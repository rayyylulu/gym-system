import { COSMETICS } from './data.js';
import {
  ATTRIBUTES, CARDIO_CAP_MINUTES, ESSENCE_PACK, PITY_LIMIT, PRICES, RANKS, RARITIES, SLOTS, STATS, STEP_GOAL, UNIQUES,
  WEEKLY_GOAL, XP, collectBonuses, computeSession, createSession, dateKey, dismantleItem, finishSession, hunterRank,
  itemValue, levelCost, logSteps, nextPlanId, openBox, previousBenchmark, rerollGate, strengthValue, trainingsThisWeek,
  upgradeCost, upgradeItem,
} from './rules.js';
import { exportBackup, load, parseBackup, requestPersistentStorage, save } from './store.js';

let state = load();
const ui = { tab: state.active ? 'dungeon' : 'status', sheet: null, summary: null, form: null, fx: null, notice: null };
const app = document.querySelector('#app');
let wakeLock = null;

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const num = (value) => Number(value).toLocaleString('de-DE');
const parseNum = (value) => Number(String(value).replace(',', '.'));
const clampNumber = (value, fallback = 0) => (Number.isFinite(value) && value >= 0 ? value : fallback);

const exerciseById = (id) => state.exercises.find((exercise) => exercise.id === id);
const deviceById = (id) => state.cardioDevices.find((device) => device.id === id);
const planById = (id) => state.plans.find((plan) => plan.id === id);
const rarityOf = (item) => RARITIES.find((rarity) => rarity.id === item.rarity);
const slotName = (id) => SLOTS.find((slot) => slot.id === id).name;
const statName = (id) => STATS.find((stat) => stat.id === id).name;
const isEquipped = (item) => state.equipped[item.slot] === item.id;
const live = () => computeSession(state.active, state.history, state.cardioDevices);

function setWakeLock(on) {
  if (on && !wakeLock && document.visibilityState === 'visible') {
    navigator.wakeLock?.request('screen').then((lock) => {
      wakeLock = lock;
      lock.addEventListener('release', () => { wakeLock = null; });
    }).catch(() => {});
  } else if (!on && wakeLock) {
    wakeLock.release().catch(() => {});
  }
}

function prefill(exerciseId) {
  const exercise = exerciseById(exerciseId);
  const done = state.active.entries.filter((entry) => entry.kind === 'set' && entry.exerciseId === exerciseId);
  const counted = done.filter((entry) => entry.type !== 'warm');

  let previous = [];
  for (let i = state.history.length - 1; i >= 0 && !previous.length; i--) {
    previous = state.history[i].entries.filter(
      (entry) => entry.kind === 'set' && entry.exerciseId === exerciseId && entry.type !== 'warm',
    );
  }
  const source = previous[counted.length] ?? exercise.sets[counted.length] ?? done[done.length - 1]
    ?? previous[previous.length - 1] ?? { weight: 20, reps: 10 };
  const hasFinisher = counted.some((entry) => entry.type === 'finisher');
  ui.form = {
    mode: 'set',
    exerciseId,
    weight: source.weight,
    reps: source.reps,
    type: counted.length === 3 && !hasFinisher ? 'finisher' : 'work',
  };
}

function prefillCardio(deviceId) {
  const done = [...state.history].reverse().flatMap((session) => session.entries)
    .find((entry) => entry.kind === 'cardio' && entry.deviceId === deviceId);
  ui.form = { mode: 'cardio', deviceId, minutes: done?.minutes ?? 20, metric: done?.metric ?? 0 };
}

// iOS kann die App beim Sperren beenden. Danach geht es bei der letzten Eingabe weiter.
function firstTarget() {
  const plan = planById(state.active.planId);
  const last = state.active.entries[state.active.entries.length - 1];
  if (last?.kind === 'set') prefill(last.exerciseId);
  else if (last?.kind === 'cardio') prefillCardio(last.deviceId);
  else if (plan.exerciseIds.length) prefill(plan.exerciseIds[0]);
  else prefillCardio(state.cardioDevices[0].id);
}

const actions = {
  tab({ tab }) {
    ui.tab = tab;
    ui.summary = null;
  },
  closeSheet() {
    ui.sheet = null;
  },
  spend({ attr }) {
    if (state.player.points < 1) return;
    state.player.points -= 1;
    state.player.attrs[attr] += 1;
  },
  saveSteps() {
    const steps = clampNumber(parseNum(document.querySelector('#steps').value));
    const rewarded = logSteps(state, dateKey(new Date()), Math.round(steps));
    ui.notice = rewarded ? `[Tagesquest abgeschlossen. +${XP.steps} XP]` : '[Schritte gespeichert.]';
  },
  async backup() {
    const done = await exportBackup(state);
    if (!done) return;
    state.backup = { trainingsSince: 0, lastAt: new Date().toISOString() };
    ui.notice = '[Backup erstellt.]';
    commit();
  },
  pickBackup() {
    document.querySelector('#backup-file').click();
  },
  restore() {
    state = ui.sheet.data;
    ui.sheet = null;
    ui.form = null;
    ui.notice = '[Backup geladen.]';
  },

  start({ plan: planId }) {
    const parked = state.parkedGate;
    if (parked?.planId === planId && dateKey(new Date(parked.startedAt)) === dateKey(new Date())) {
      state.active = parked;
    } else {
      state.active = createSession(state, planById(planId), new Date(), Math.random);
    }
    state.parkedGate = null;
  },
  reroll() {
    if (!rerollGate(state, Math.random)) ui.notice = '[Nicht genügend Münzen.]';
  },
  leaveGate() {
    state.parkedGate = state.active;
    state.active = null;
  },
  enter() {
    state.active.entered = true;
    state.active.bonuses = collectBonuses(state.player, state.inventory, state.equipped);
    firstTarget();
    setWakeLock(true);
  },
  chooseExercise({ id }) {
    prefill(id);
  },
  chooseDevice({ id }) {
    prefillCardio(id);
  },
  step({ field, by }) {
    ui.form[field] = Math.max(0, Math.round((clampNumber(ui.form[field]) + Number(by)) * 100) / 100);
  },
  setType({ type }) {
    ui.form.type = type;
  },
  logSet() {
    const { exerciseId, weight, reps, type } = ui.form;
    if (!(weight > 0) || !(reps > 0)) {
      ui.notice = '[Trag Gewicht und Wiederholungen ein.]';
      return;
    }
    state.active.entries.push({ kind: 'set', exerciseId, weight, reps, type });
    showHit();
    prefill(exerciseId);
  },
  logCardio() {
    const { deviceId, minutes, metric } = ui.form;
    if (!(minutes > 0)) {
      ui.notice = '[Trag die Minuten ein.]';
      return;
    }
    state.active.entries.push({ kind: 'cardio', deviceId, minutes, metric: clampNumber(metric) });
    showHit();
  },
  undo() {
    const entry = state.active.entries.pop();
    if (entry?.kind === 'set') prefill(entry.exerciseId);
  },
  addExercise() {
    const name = document.querySelector('#new-name').value.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    state.exercises.push({ id, name, sets: [] });
    planById(state.active.planId).exerciseIds.push(id);
    ui.sheet = null;
    prefill(id);
  },
  linkExercise({ id }) {
    planById(state.active.planId).exerciseIds.push(id);
    ui.sheet = null;
    prefill(id);
  },
  addDevice() {
    const name = document.querySelector('#device-name').value.trim();
    const unit = document.querySelector('#device-unit').value.trim() || 'Minuten';
    const factor = parseNum(document.querySelector('#device-factor').value);
    if (!name) return;
    const id = `device-${Date.now()}`;
    state.cardioDevices.push({ id, name, metricName: unit, unit, factor: factor > 0 ? factor : 1 });
    ui.sheet = null;
    prefillCardio(id);
  },
  finish() {
    ui.sheet = null;
    ui.summary = finishSession(state, new Date());
    ui.form = null;
    setWakeLock(false);
  },
  discard() {
    state.active = null;
    ui.sheet = null;
    ui.form = null;
    setWakeLock(false);
  },

  openBox() {
    const item = openBox(state, Math.random);
    if (item) ui.sheet = { type: 'item', id: item.id, fresh: true };
  },
  item({ id }) {
    ui.sheet = { type: 'item', id };
  },
  equip({ id }) {
    const item = state.inventory.find((entry) => entry.id === id);
    if (isEquipped(item)) delete state.equipped[item.slot];
    else state.equipped[item.slot] = id;
  },
  upgrade({ id }) {
    if (!upgradeItem(state, id)) ui.notice = '[Nicht genügend Essenz oder Münzen.]';
  },
  confirmDismantle({ id }) {
    ui.sheet = { type: 'dismantle', id };
  },
  dismantle({ id }) {
    dismantleItem(state, id);
    ui.sheet = null;
  },

  buy({ what }) {
    const price = PRICES[what];
    if (state.player.coins < price) {
      ui.notice = '[Nicht genügend Münzen.]';
      return;
    }
    state.player.coins -= price;
    if (what === 'box') state.player.boxes += 1;
    if (what === 'essence') state.player.essence += ESSENCE_PACK;
  },
  cosmetic({ id }) {
    const entry = COSMETICS.find((cosmetic) => cosmetic.id === id);
    const { cosmetics, player } = state;
    if (!cosmetics.owned.includes(id)) {
      if (player.coins < entry.price) {
        ui.notice = '[Nicht genügend Münzen.]';
        return;
      }
      player.coins -= entry.price;
      cosmetics.owned.push(id);
    }
    if (entry.kind === 'theme') cosmetics.theme = id;
    else cosmetics.title = cosmetics.title === id ? null : id;
  },
};

function showHit() {
  const { results } = live();
  ui.fx = results[results.length - 1];
}

function commit() {
  if (!save(state)) ui.notice = '[Speichern fehlgeschlagen. Bitte Backup erstellen.]';
  render();
}

function progress(value, max, label = '') {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return `<div class="bar" role="progressbar" aria-valuenow="${Math.round(percent)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label)}"><span style="width:${percent}%"></span></div>`;
}

function statusView() {
  const { player, cosmetics } = state;
  const now = new Date();
  const cost = levelCost(player.level);
  const title = COSMETICS.find((entry) => entry.id === cosmetics.title)?.name ?? 'Jäger';
  const week = trainingsThisWeek(state.history, now);
  const steps = state.steps[dateKey(now)] ?? 0;
  const backupDue = state.backup.trainingsSince >= WEEKLY_GOAL;

  return `
    <h1 class="screen-title">Status</h1>
    <section class="panel hero">
      <div class="rank-badge" aria-label="Jäger-Rang ${hunterRank(player.level)}">${hunterRank(player.level)}</div>
      <div class="hero-main">
        <p class="eyebrow">${esc(title)}</p>
        <p class="level">Level ${player.level}</p>
        ${progress(player.xp, cost, 'XP bis zum nächsten Level')}
        <p class="muted">${num(player.xp)} / ${num(cost)} XP</p>
      </div>
    </section>

    <section class="wallet">
      <div><strong>${num(player.coins)}</strong><span>Münzen</span></div>
      <div><strong>${num(player.essence)}</strong><span>Essenz</span></div>
      <div><strong>${num(player.boxes)}</strong><span>Lootboxen</span></div>
    </section>

    ${backupDue ? `
      <section class="panel alert">
        <p class="system-line">[Dein Fortschritt ist noch nicht gesichert.]</p>
        <button class="btn primary" data-act="backup">Backup erstellen</button>
      </section>` : ''}

    <section class="panel">
      <h2>Quests</h2>
      <div class="quest">
        <div class="quest-head"><span>Wochenziel</span><span>${Math.min(week, WEEKLY_GOAL)} / ${WEEKLY_GOAL} Trainings</span></div>
        ${progress(week, WEEKLY_GOAL, 'Wochenziel')}
      </div>
      <div class="quest">
        <div class="quest-head"><span>Tagesquest</span><span>${num(steps)} / ${num(STEP_GOAL)} Schritte</span></div>
        ${progress(steps, STEP_GOAL, 'Tagesquest')}
        <div class="inline-form">
          <label class="sr" for="steps">Schritte heute</label>
          <input id="steps" inputmode="numeric" value="${steps || ''}" placeholder="Schritte heute">
          <button class="btn" data-act="saveSteps">Speichern</button>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>Attribute${player.points ? ` <span class="pill">${player.points} Punkte frei</span>` : ''}</h2>
      ${ATTRIBUTES.map((attr) => `
        <div class="attr">
          <div><strong>${attr.name}</strong><p class="muted">${attr.text}</p></div>
          <span class="attr-value">${player.attrs[attr.id]}</span>
          ${player.points ? `<button class="btn square" data-act="spend" data-attr="${attr.id}" aria-label="${attr.name} erhöhen">+</button>` : ''}
        </div>`).join('')}
    </section>

    ${state.history.length ? `
      <section class="panel">
        <h2>Letzte Trainings</h2>
        ${state.history.slice(-5).reverse().map((session) => `
          <div class="row">
            <span class="rank-chip">${session.rankId}</span>
            <div class="grow"><strong>${esc(session.planName)}</strong>
              <p class="muted">${new Date(session.endedAt).toLocaleDateString('de-DE')} · ${num(session.damageTotal)} Schaden · ${session.crits} Krits</p></div>
            <span class="${session.cleared ? 'good' : 'muted'}">${session.cleared ? 'Geschafft' : 'Gescheitert'}</span>
          </div>`).join('')}
      </section>` : ''}

    <section class="panel">
      <h2>Datensicherung</h2>
      <p class="muted">Speichere die Datei in iCloud Drive. Damit bleibt dein Fortschritt auch auf einem neuen iPhone erhalten.</p>
      <div class="split">
        <button class="btn" data-act="backup">Backup erstellen</button>
        <button class="btn" data-act="pickBackup">Backup laden</button>
      </div>
      <input id="backup-file" type="file" accept=".json,application/json" hidden>
    </section>`;
}

function planListView() {
  const nextId = nextPlanId(state.plans, state.history);
  return `
    <h1 class="screen-title">Dungeon</h1>
    <p class="system-line">[Wähle dein heutiges Training. Dort öffnet sich dein Tor.]</p>
    ${state.plans.map((plan) => `
      <button class="panel plan" data-act="start" data-plan="${plan.id}">
        <span class="grow">
          ${plan.id === nextId ? '<span class="pill">Als Nächstes</span>' : ''}
          <strong>${esc(plan.name)}</strong>
          <span class="muted">${plan.exerciseIds.length ? `${plan.exerciseIds.length} Übungen` : 'Laufband, Stairmaster und mehr'}</span>
        </span>
        <span class="chevron" aria-hidden="true">›</span>
      </button>`).join('')}`;
}

function gateView() {
  const session = state.active;
  const rank = RANKS.find((entry) => entry.id === session.rankId);
  const baseline = session.baseline;
  return `
    <div class="gate rank-${rank.id}">
      <p class="system-line">[Ein Tor der Stufe ${rank.id} wurde entdeckt.]</p>
      <div class="portal"><span>${rank.id}</span></div>
      <h1>${esc(session.planName)}</h1>
      <p class="muted">Lebenspunkte: ${num(session.totalHp)} · dein Schnitt: ${num(baseline)} Schaden</p>
      <button class="btn primary big" data-act="enter">Tor betreten</button>
      <div class="split">
        <button class="btn" data-act="reroll">Neuwurf (${PRICES.reroll} Münzen)</button>
        <button class="btn" data-act="leaveGate">Zurück</button>
      </div>
      <p class="muted center">Du hast ${num(state.player.coins)} Münzen.</p>
    </div>`;
}

function enemyPanel(result) {
  const node = result.current;
  const stage = result.chain.filter((entry) => entry.kind === 'monster').length;
  const label = { monster: `Monster ${Math.min(result.nodeIndex + 1, stage)} von ${stage}`, boss: 'Boss', bonus: 'Bonusgegner', gold: 'Goldraum' }[node.kind];
  return `
    <section class="panel enemy kind-${node.kind}">
      <div class="quest-head">
        <span class="rank-chip">${state.active.rankId}</span>
        <span class="muted">${esc(label)}</span>
      </div>
      <p class="enemy-name">${esc(node.name)}</p>
      ${progress(result.hpLeft, node.hp, `Lebenspunkte ${node.name}`)}
      <p class="muted">${num(result.hpLeft)} / ${num(node.hp)} LP</p>
      <div class="chain" aria-hidden="true">
        ${result.chain.map((entry, index) => `<i class="${index < result.nodeIndex ? 'dead' : ''} ${index === result.nodeIndex ? 'now' : ''} ${entry.kind}"></i>`).join('')}
      </div>
      ${ui.fx?.damage ? `<div class="hit ${ui.fx.crit ? 'crit' : ''}">${ui.fx.crit ? 'KRIT ' : ''}-${num(ui.fx.damage)}</div>` : ''}
    </section>
    ${ui.fx?.killed.length ? `<p class="system-line kill">[${ui.fx.killed.map((entry) => `${esc(entry.name)} besiegt`).join(' · ')}]</p>` : ''}`;
}

function stepper(field, label, step, unit = '') {
  return `
    <div class="field">
      <label for="f-${field}">${label}</label>
      <div class="stepper">
        <button class="btn square" data-act="step" data-field="${field}" data-by="-${step}" aria-label="${label} verringern">−</button>
        <input id="f-${field}" data-field="${field}" inputmode="decimal" value="${esc(String(ui.form[field]).replace('.', ','))}">
        <button class="btn square" data-act="step" data-field="${field}" data-by="${step}" aria-label="${label} erhöhen">+</button>
      </div>
      ${unit ? `<span class="muted">${esc(unit)}</span>` : ''}
    </div>`;
}

function setLogger(sessionSets) {
  const { exerciseId, type, weight, reps } = ui.form;
  const benchmark = previousBenchmark(state.history, exerciseId);
  const value = strengthValue(clampNumber(weight), clampNumber(reps));
  const hint = benchmark === null
    ? 'Erstes Training dieser Übung: Hier setzt du deinen Startwert.'
    : `Letztes Mal bester Kraftwert: ${num(Math.round(benchmark * 10) / 10)} · dieser Satz: ${num(Math.round(value * 10) / 10)}`;
  const types = [['warm', 'Aufwärmen'], ['work', 'Arbeitssatz'], ['finisher', 'Finisher']];
  return `
    <section class="panel">
      <h2>${esc(exerciseById(exerciseId).name)} <span class="pill">Satz ${sessionSets + 1}</span></h2>
      <div class="segmented" role="group" aria-label="Satzart">
        ${types.map(([id, label]) => `<button class="${type === id ? 'on' : ''}" aria-pressed="${type === id}" data-act="setType" data-type="${id}">${label}</button>`).join('')}
      </div>
      <div class="fields">
        ${stepper('weight', 'Gewicht in kg', 2.5)}
        ${stepper('reps', 'Wiederholungen', 1)}
      </div>
      <p class="muted">${hint}</p>
      <button class="btn primary big" data-act="logSet">Satz eintragen</button>
    </section>`;
}

function cardioLogger() {
  const device = deviceById(ui.form.deviceId);
  return `
    <section class="panel">
      <h2>${esc(device.name)}</h2>
      <div class="fields">
        ${stepper('minutes', 'Minuten', 5)}
        ${stepper('metric', esc(device.metricName), 1, device.unit)}
      </div>
      <p class="muted">Pro 5 Minuten ${num(device.factor)} Treffer, höchstens ${CARDIO_CAP_MINUTES} Minuten pro Training. Mehr ${esc(device.metricName)} als beim letzten Mal geben einen Krit.</p>
      <button class="btn primary big" data-act="logCardio">Cardio eintragen</button>
    </section>`;
}

function entryLabel(result) {
  const { entry } = result;
  if (entry.kind === 'cardio') {
    const device = deviceById(entry.deviceId);
    return `${esc(device?.name ?? 'Cardio')}: ${num(entry.minutes)} Min`;
  }
  const type = { warm: 'Aufwärmen', work: '', finisher: 'Finisher' }[entry.type];
  return `${esc(exerciseById(entry.exerciseId)?.name ?? 'Übung')}: ${num(entry.reps)} × ${num(entry.weight)} kg${type ? ` · ${type}` : ''}`;
}

function fightView() {
  const session = state.active;
  const plan = planById(session.planId);
  const result = live();
  const countFor = (id) => session.entries.filter((entry) => entry.kind === 'set' && entry.exerciseId === id).length;

  return `
    ${enemyPanel(result)}
    <div class="chips" role="group" aria-label="Übung wählen">
      ${plan.exerciseIds.map((id) => `
        <button class="chip ${ui.form.exerciseId === id ? 'on' : ''}" data-act="chooseExercise" data-id="${id}">${esc(exerciseById(id).name)}${countFor(id) ? ` <b>${countFor(id)}</b>` : ''}</button>`).join('')}
      ${state.cardioDevices.map((device) => `
        <button class="chip cardio ${ui.form.deviceId === device.id ? 'on' : ''}" data-act="chooseDevice" data-id="${device.id}">${esc(device.name)}</button>`).join('')}
      <button class="chip add" data-sheet="add" aria-label="Übung oder Gerät hinzufügen">+ Neu</button>
    </div>

    ${ui.form.mode === 'set' ? setLogger(countFor(ui.form.exerciseId)) : cardioLogger()}

    ${result.results.length ? `
      <section class="panel">
        <h2>Protokoll</h2>
        ${result.results.slice(-6).reverse().map((entry) => `
          <div class="row">
            <span class="grow">${entryLabel(entry)}</span>
            ${entry.crit ? '<span class="pill crit">Krit</span>' : ''}
            <strong>${num(entry.damage)}</strong>
          </div>`).join('')}
        <button class="btn" data-act="undo">Letzten Eintrag löschen</button>
      </section>` : ''}

    <button class="btn danger big" data-sheet="finish">Training beenden</button>`;
}

function summaryView() {
  const summary = ui.summary;
  return `
    <div class="gate rank-${summary.rankId}">
      <p class="system-line">${summary.bossDead ? '[Dungeon abgeschlossen.]' : '[Dungeon nicht abgeschlossen. Der Boss lebt noch.]'}</p>
      ${summary.levels ? `<p class="level-up">[Level aufgestiegen!]</p>` : ''}
      <h1>${esc(summary.planName)}</h1>
      <section class="panel">
        <div class="row"><span class="grow">Schaden</span><strong>${num(summary.damageTotal)}</strong></div>
        <div class="row"><span class="grow">Besiegte Gegner</span><strong>${summary.killed.length}</strong></div>
        <div class="row"><span class="grow">Krits</span><strong>${summary.crits}</strong></div>
        <div class="row"><span class="grow">XP</span><strong>+${num(summary.xp)}</strong></div>
        <div class="row"><span class="grow">Münzen</span><strong>+${num(summary.coins)}</strong></div>
        ${summary.boxes ? `<div class="row"><span class="grow">Lootbox vom Boss</span><strong>+${summary.boxes}</strong></div>` : ''}
        ${summary.weeklyReached ? `<div class="row"><span class="grow">Wochenziel erreicht</span><strong class="good">+${XP.weekly} XP</strong></div>` : ''}
      </section>
      <button class="btn primary big" data-act="tab" data-tab="status">Zum Status</button>
    </div>`;
}

function dungeonView() {
  if (ui.summary) return summaryView();
  if (!state.active) return planListView();
  if (!state.active.entered) return gateView();
  if (!ui.form) firstTarget();
  return fightView();
}

function itemProps(item) {
  const props = item.props.map((prop) => `<li>+${num(itemValue(prop, item))} % ${statName(prop.stat)}</li>`).join('');
  const unique = UNIQUES.find((entry) => entry.id === item.unique);
  return `<ul class="props">${props}${unique ? `<li class="unique">${unique.text}</li>` : ''}</ul>`;
}

function itemCard(item) {
  return `
    <button class="item ${item.rarity}" data-act="item" data-id="${item.id}">
      <span class="item-name">${esc(item.name)}</span>
      <span class="muted">${rarityOf(item).name} · Level ${item.level}${isEquipped(item) ? ' · angelegt' : ''}</span>
    </button>`;
}

function inventoryView() {
  const { player, inventory, equipped } = state;
  const items = [...inventory].sort((a, b) => Number(isEquipped(b)) - Number(isEquipped(a)) || b.level - a.level);
  return `
    <h1 class="screen-title">Inventar</h1>
    <section class="panel">
      <div class="quest-head"><span>Lootboxen: <strong>${player.boxes}</strong></span><span>Essenz: <strong>${num(player.essence)}</strong></span></div>
      <p class="muted">Glücksschutz: spätestens in ${PITY_LIMIT - state.pity} Boxen kommt ein legendäres Teil.</p>
      <button class="btn primary big" data-act="openBox" ${player.boxes ? '' : 'disabled'}>Lootbox öffnen</button>
    </section>
    <section class="slots">
      ${SLOTS.map((slot) => {
        const item = inventory.find((entry) => entry.id === equipped[slot.id]);
        return item
          ? `<button class="slot filled ${item.rarity}" data-act="item" data-id="${item.id}"><span class="muted">${slot.name}</span>${esc(item.name)}</button>`
          : `<div class="slot"><span class="muted">${slot.name}</span>Leer</div>`;
      }).join('')}
    </section>
    <h2>Gegenstände</h2>
    ${items.length ? items.map(itemCard).join('') : '<p class="muted">Noch keine Gegenstände. Besiege Bosse oder kaufe im Shop eine Lootbox.</p>'}`;
}

function shopView() {
  const { player, cosmetics } = state;
  const offer = (what, name, text, note = '') => `
    <div class="row offer">
      <div class="grow"><strong>${name}</strong><p class="muted">${text}</p></div>
      <button class="btn" data-act="buy" data-what="${what}">${num(PRICES[what])}${note}</button>
    </div>`;
  return `
    <h1 class="screen-title">Shop</h1>
    <p class="system-line">[Guthaben: ${num(player.coins)} Münzen]</p>
    <section class="panel">
      <h2>Angebote</h2>
      ${offer('box', 'Lootbox', 'Ein zufälliges Ausrüstungsteil')}
      ${offer('essence', `Essenz (${ESSENCE_PACK})`, 'Bringt Teile auf dein aktuelles Level')}
      <div class="row offer locked">
        <div class="grow"><strong>Saison-Box</strong><p class="muted">Kommt mit den Saisons</p></div>
        <span class="muted">Gesperrt</span>
      </div>
      <div class="row offer">
        <div class="grow"><strong>Tor-Neuwurf</strong><p class="muted">Direkt am Tor für ${PRICES.reroll} Münzen, solange du es nicht betreten hast</p></div>
      </div>
    </section>
    <section class="panel">
      <h2>Kosmetik</h2>
      ${COSMETICS.filter((entry) => entry.price > 0 || entry.kind === 'theme').map((entry) => {
        const owned = cosmetics.owned.includes(entry.id);
        const active = cosmetics.theme === entry.id || cosmetics.title === entry.id;
        const label = active ? 'Aktiv' : owned ? 'Nutzen' : num(entry.price);
        return `
          <div class="row offer">
            <div class="grow"><strong>${entry.name}</strong><p class="muted">${entry.kind === 'theme' ? 'Farbe' : 'Titel'}</p></div>
            <button class="btn ${active ? 'on' : ''}" data-act="cosmetic" data-id="${entry.id}">${label}</button>
          </div>`;
      }).join('')}
    </section>`;
}

function nutritionView() {
  return `
    <h1 class="screen-title">Ernährung</h1>
    <div class="gate sealed">
      <p class="system-line">[Dieses Tor ist noch versiegelt.]</p>
      <div class="portal"><span>🔒</span></div>
      <p class="muted center">Der Kalorien-Tracker mit Barcode-Scanner kommt in einer späteren Stufe.</p>
    </div>`;
}

function sheetView() {
  const sheet = ui.sheet;
  if (!sheet) return '';
  let body = '';

  if (sheet.type === 'item') {
    const item = state.inventory.find((entry) => entry.id === sheet.id);
    const cost = upgradeCost(item, state.player.level);
    const canUpgrade = item.level < state.player.level;
    body = `
      ${sheet.fresh ? '<p class="system-line">[Neuer Gegenstand erhalten.]</p>' : ''}
      <h2 class="item-title ${item.rarity}">${esc(item.name)}</h2>
      <p class="muted">${rarityOf(item).name} · ${slotName(item.slot)} · Level ${item.level}</p>
      ${itemProps(item)}
      <button class="btn primary big" data-act="equip" data-id="${item.id}">${isEquipped(item) ? 'Ablegen' : 'Anlegen'}</button>
      ${canUpgrade ? `<button class="btn" data-act="upgrade" data-id="${item.id}">Auf Level ${state.player.level} bringen (${num(cost.essence)} Essenz, ${num(cost.coins)} Münzen)</button>` : ''}
      ${isEquipped(item) ? '' : `<button class="btn danger" data-act="confirmDismantle" data-id="${item.id}">Zerlegen (+${rarityOf(item).essence} Essenz)</button>`}`;
  }

  if (sheet.type === 'dismantle') {
    const item = state.inventory.find((entry) => entry.id === sheet.id);
    body = `
      <h2>${esc(item.name)} zerlegen?</h2>
      <p class="muted">Das Teil ist danach weg, du bekommst ${rarityOf(item).essence} Essenz.</p>
      <button class="btn danger big" data-act="dismantle" data-id="${item.id}">Zerlegen</button>`;
  }

  if (sheet.type === 'finish') {
    const result = live();
    const counts = result.results.some((entry) => entry.damage > 0);
    body = counts
      ? `
        <h2>Training beenden?</h2>
        <p class="muted">${result.bossDead ? 'Der Boss ist besiegt. Danach werden deine Belohnungen vergeben.' : 'Der Boss lebt noch. Du bekommst trotzdem XP und die Beute der besiegten Gegner.'}</p>
        <button class="btn primary big" data-act="finish">Beenden und Beute einsammeln</button>
        <button class="btn danger" data-sheet="discard">Training verwerfen</button>`
      : `
        <h2>Noch nichts eingetragen</h2>
        <p class="muted">Ohne Schaden gibt es keine Belohnung. Willst du den Dungeon verlassen?</p>
        <button class="btn danger big" data-act="discard">Dungeon verlassen</button>`;
  }

  if (sheet.type === 'discard') {
    body = `
      <h2>Training verwerfen?</h2>
      <p class="muted">Alle Einträge dieses Trainings gehen verloren, und es gibt keine Belohnung.</p>
      <button class="btn danger big" data-act="discard">Verwerfen</button>`;
  }

  if (sheet.type === 'add') {
    const plan = planById(state.active.planId);
    const others = state.exercises.filter((exercise) => !plan.exerciseIds.includes(exercise.id));
    body = `
      <h2>Übung hinzufügen</h2>
      <label for="new-name">Neue Übung</label>
      <div class="inline-form">
        <input id="new-name" placeholder="Name der Übung">
        <button class="btn" data-act="addExercise">Anlegen</button>
      </div>
      ${others.length ? `
        <label for="link">Vorhandene Übung</label>
        <div class="chips wrap" id="link">
          ${others.map((exercise) => `<button class="chip" data-act="linkExercise" data-id="${exercise.id}">${esc(exercise.name)}</button>`).join('')}
        </div>` : ''}
      <h2>Cardio-Gerät hinzufügen</h2>
      <label for="device-name">Name</label>
      <input id="device-name" placeholder="z. B. Crosstrainer">
      <label for="device-unit">Messwert für den Krit</label>
      <input id="device-unit" placeholder="z. B. km, Kalorien oder Minuten">
      <label for="device-factor">Treffer pro 5 Minuten</label>
      <input id="device-factor" inputmode="decimal" value="1">
      <button class="btn" data-act="addDevice">Gerät anlegen</button>`;
  }

  if (sheet.type === 'restore') {
    body = `
      <h2>Backup laden?</h2>
      <p class="muted">Dein aktueller Stand wird durch das Backup ersetzt: Level ${sheet.data.player.level}, ${sheet.data.history.length} Trainings.</p>
      <button class="btn danger big" data-act="restore">Backup laden</button>`;
  }

  return `
    <div class="scrim" data-act="closeSheet"></div>
    <div class="sheet" role="dialog" aria-modal="true">
      ${body}
      <button class="btn" data-act="closeSheet">Schließen</button>
    </div>`;
}

const TABS = [
  ['shop', 'Shop', '◎'],
  ['status', 'Status', '◈'],
  ['dungeon', 'Dungeon', '⚔'],
  ['inventory', 'Inventar', '▣'],
  ['nutrition', 'Ernährung', '🔒'],
];
const VIEWS = { status: statusView, dungeon: dungeonView, inventory: inventoryView, shop: shopView, nutrition: nutritionView };

function render() {
  document.documentElement.dataset.theme = state.cosmetics.theme;
  const view = `${ui.tab}:${Boolean(ui.summary)}:${Boolean(state.active?.entered)}`;
  const scrollY = view === ui.lastView ? window.scrollY : 0;
  ui.lastView = view;
  app.innerHTML = `
    <main class="screen">${VIEWS[ui.tab]()}</main>
    ${ui.notice ? `<div class="toast" role="status">${esc(ui.notice)}</div>` : ''}
    <nav class="tabbar" aria-label="Bereiche">
      ${TABS.map(([id, label, icon]) => `
        <button class="${ui.tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}" ${ui.tab === id ? 'aria-current="page"' : ''}>
          <span aria-hidden="true">${icon}</span>${label}
        </button>`).join('')}
    </nav>
    ${sheetView()}`;
  window.scrollTo(0, scrollY);
  ui.fx = null;
  if (ui.notice) {
    const shown = ui.notice;
    setTimeout(() => {
      if (ui.notice !== shown) return;
      ui.notice = null;
      document.querySelector('.toast')?.remove();
    }, 2600);
  }
}

app.addEventListener('click', async (event) => {
  const sheetButton = event.target.closest('[data-sheet]');
  if (sheetButton) {
    ui.sheet = { type: sheetButton.dataset.sheet };
    commit();
    return;
  }
  const button = event.target.closest('[data-act]');
  if (!button || button.disabled) return;
  await actions[button.dataset.act](button.dataset);
  commit();
});

// Eingaben lösen bewusst kein render() aus: Das würde den Knopf ersetzen,
// den der Finger beim Verlassen des Feldes gerade trifft.
app.addEventListener('input', (event) => {
  const { field } = event.target.dataset;
  if (field) ui.form[field] = clampNumber(parseNum(event.target.value));
});

app.addEventListener('change', async (event) => {
  if (event.target.id !== 'backup-file') return;
  const [file] = event.target.files;
  if (!file) return;
  const data = parseBackup(await file.text());
  if (data) ui.sheet = { type: 'restore', data };
  else ui.notice = '[Diese Datei ist kein gültiges Backup.]';
  render();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.active?.entered) setWakeLock(true);
});

requestPersistentStorage();
if (state.active?.entered) setWakeLock(true);
render();

const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
if ('serviceWorker' in navigator && (!isLocal || location.search.includes('sw'))) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
