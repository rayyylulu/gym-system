// Spielregeln ohne Oberfläche und ohne Speicherzugriff, damit sie testbar bleiben.

export const BASE_DAMAGE = 10;
export const FINISHER_MULT = 2;
export const CRIT_DAMAGE = 30;
export const CARDIO_CAP_MINUTES = 60;
export const CARDIO_HIT_MINUTES = 5;
export const WEEKLY_GOAL = 4;
export const STEP_GOAL = 10000;
export const PITY_LIMIT = 30;

export const XP = { training: 100, crit: 20, weekly: 200, steps: 50, weighIn: 50 };
export const POINTS_PER_LEVEL = 3;

export const QUEST_REWARDS = {
  steps: [{ weight: 5, boxes: 1 }, { weight: 15, essence: 20 }, { weight: 40, coins: 75 }, { weight: 40 }],
  weekly: [{ weight: 25, boxes: 1 }, { weight: 75, coins: 300 }],
  weighIn: [{ weight: 10, boxes: 1 }, { weight: 90, coins: 100 }],
};

export const PRICES = { box: 500, essence: 300, reroll: 200 };
export const ESSENCE_PACK = 50;

export const RANKS = [
  { id: 'E', factor: 0.7, weight: 30, coins: 0.7, xp: 30, boxChance: 0.1 },
  { id: 'D', factor: 0.85, weight: 30, coins: 0.85, xp: 40, boxChance: 0.15 },
  { id: 'C', factor: 1, weight: 22, coins: 1, xp: 55, boxChance: 0.2 },
  { id: 'B', factor: 1.1, weight: 12, coins: 1.3, xp: 70, boxChance: 0.3 },
  { id: 'A', factor: 1.2, weight: 5, coins: 1.7, xp: 85, boxChance: 0.5 },
  { id: 'S', factor: 1.4, weight: 1, coins: 2.5, xp: 100, boxChance: 1 },
];

export const NODE_COINS = { monster: 20, boss: 120, bonus: 30, gold: 80 };

export const HUNTER_RANKS = [
  { id: 'E', level: 1 },
  { id: 'D', level: 10 },
  { id: 'C', level: 20 },
  { id: 'B', level: 30 },
  { id: 'A', level: 50 },
  { id: 'S', level: 70 },
];

export const SLOTS = [
  { id: 'weapon', name: 'Waffe' },
  { id: 'helm', name: 'Helm' },
  { id: 'armor', name: 'Rüstung' },
  { id: 'gloves', name: 'Handschuhe' },
  { id: 'boots', name: 'Stiefel' },
];

export const RARITIES = [
  { id: 'common', name: 'Gewöhnlich', weight: 50, mult: 0.5, props: 1, essence: 5 },
  { id: 'uncommon', name: 'Ungewöhnlich', weight: 28, mult: 0.65, props: 2, essence: 10 },
  { id: 'rare', name: 'Selten', weight: 15, mult: 0.8, props: 2, essence: 20 },
  { id: 'epic', name: 'Episch', weight: 6, mult: 0.9, props: 3, essence: 40 },
  { id: 'legendary', name: 'Legendär', weight: 1, mult: 1, props: 3, essence: 80 },
];

export const STATS = [
  { id: 'base', name: 'Grundschaden' },
  { id: 'crit', name: 'Krit-Schaden' },
  { id: 'cardio', name: 'Cardio-Schaden' },
  { id: 'coins', name: 'Münzen' },
  { id: 'luck', name: 'Beute-Glück' },
];

export const UNIQUES = [
  { id: 'firstCritDouble', text: 'Dein erster Krit pro Training zählt doppelt' },
  { id: 'firstSetDouble', text: 'Dein erster Satz pro Training zählt doppelt' },
  { id: 'finisherBoost', text: 'Finisher machen 50 % mehr Schaden' },
  { id: 'bossBoost', text: 'Bosse erleiden 25 % mehr Schaden' },
  { id: 'goldBoost', text: 'Goldräume bringen doppelt so viele Münzen' },
];

export const ATTRIBUTES = [
  { id: 'str', name: 'Stärke', text: '+2 % Grundschaden pro Punkt' },
  { id: 'prec', name: 'Präzision', text: '+5 % Krit-Schaden pro Punkt' },
  { id: 'end', name: 'Ausdauer', text: '+3 % Cardio- und Finisher-Schaden pro Punkt' },
  { id: 'luck', name: 'Glück', text: '+2 % Münzen und +1 % Beute-Glück pro Punkt' },
];

const MONSTERS = ['Goblin', 'Steinwächter', 'Eiswolf', 'Skelettkrieger', 'Höhlenspinne', 'Sumpfork', 'Schattenratte'];
const BOSSES = ['Hobgoblin-Häuptling', 'Eisbär-Fürst', 'Blutroter Ork', 'Naga-Königin', 'Der Kerkermeister', 'Steingigant'];
const ITEM_NAMES = {
  weapon: ['Klinge', 'Dolch', 'Axt', 'Speer'],
  helm: ['Helm', 'Kapuze', 'Maske'],
  armor: ['Brustpanzer', 'Mantel', 'Harnisch'],
  gloves: ['Handschuhe', 'Armschienen', 'Faustwickel'],
  boots: ['Stiefel', 'Beinschienen', 'Sandalen'],
};

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

function pickWeighted(list, rng) {
  const total = list.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of list) {
    roll -= entry.weight;
    if (roll < 0) return entry;
  }
  return list[list.length - 1];
}

export function strengthValue(weight, reps) {
  return weight * (1 + reps / 30);
}

export function levelCost(level) {
  return 300 + 60 * level;
}

export function hunterRank(level) {
  return HUNTER_RANKS.filter((rank) => level >= rank.level).pop().id;
}

export function dateKey(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function weekKey(date) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return dateKey(monday);
}

export function trainingsThisWeek(history, now) {
  const week = weekKey(now);
  return history.filter((session) => weekKey(new Date(session.endedAt)) === week).length;
}

export function rankById(id) {
  return RANKS.find((rank) => rank.id === id);
}

export function rollRank(rng, excludeId) {
  return pickWeighted(RANKS.filter((rank) => rank.id !== excludeId), rng);
}

export function baselineFor(plan, history) {
  const recent = history.filter((session) => session.planId === plan.id).slice(-3);
  if (recent.length) {
    return Math.max(30, Math.round(recent.reduce((sum, session) => sum + session.rawTotal, 0) / recent.length));
  }
  if (!plan.exerciseIds.length) return 90;
  return plan.exerciseIds.length * 50 + (plan.cardio ? 40 : 0);
}

export function nextPlanId(plans, history) {
  const rotation = plans.filter((plan) => plan.exerciseIds.length);
  const last = [...history].reverse().find((session) => rotation.some((plan) => plan.id === session.planId));
  if (!last) return rotation[0].id;
  const index = rotation.findIndex((plan) => plan.id === last.planId);
  return rotation[(index + 1) % rotation.length].id;
}

// Der Dungeon hängt nur am Seed. So lässt sich jeder Stand aus den Einträgen neu berechnen,
// und das Rückgängigmachen eines Satzes braucht keinen eigenen Sonderfall.
function buildChain(totalHp, rng) {
  const count = 3 + Math.floor(rng() * 5);
  const bossHp = Math.round(totalHp * 0.35);
  const shares = Array.from({ length: count }, () => 0.7 + rng() * 0.6);
  const shareTotal = shares.reduce((sum, share) => sum + share, 0);
  const chain = shares.map((share) => ({
    kind: 'monster',
    name: pick(MONSTERS, rng),
    hp: Math.max(1, Math.round(((totalHp - bossHp) * share) / shareTotal)),
  }));
  chain.push({ kind: 'boss', name: pick(BOSSES, rng), hp: bossHp });
  return chain;
}

function bonusNode(totalHp, rng) {
  const gold = rng() >= 0.7;
  return {
    kind: gold ? 'gold' : 'bonus',
    name: gold ? 'Goldraum' : `Bonus: ${pick(MONSTERS, rng)}`,
    hp: Math.max(1, Math.round(totalHp * 0.12)),
  };
}

export function previousBenchmark(history, exerciseId) {
  for (let i = history.length - 1; i >= 0; i--) {
    const sets = history[i].entries.filter(
      (entry) => entry.kind === 'set' && entry.exerciseId === exerciseId && entry.type !== 'warm',
    );
    if (sets.length) return Math.max(...sets.map((set) => strengthValue(set.weight, set.reps)));
  }
  return null;
}

export function previousCardioMetric(history, deviceId) {
  for (let i = history.length - 1; i >= 0; i--) {
    const entries = history[i].entries.filter((entry) => entry.kind === 'cardio' && entry.deviceId === deviceId);
    if (entries.length) return Math.max(...entries.map((entry) => entry.metric));
  }
  return null;
}

export function computeSession(session, history, devices = []) {
  const { bonuses, totalHp } = session;
  const unique = new Set(bonuses.uniques);
  const rank = rankById(session.rankId);
  const rng = mulberry(session.seed);
  const chain = buildChain(totalHp, rng);

  let nodeIndex = 0;
  let hpLeft = chain[0].hp;
  let bossDead = false;
  let coins = 0;
  let boxes = 0;
  let rawTotal = 0;
  let damageTotal = 0;
  let crits = 0;
  let cardioMinutes = 0;
  let firstDamage = true;
  let firstCrit = true;
  const critKeys = new Set();
  const finisherKeys = new Set();
  const killed = [];
  const results = [];

  const strike = (amount) => {
    let remaining = amount;
    while (remaining > 0) {
      const node = chain[nodeIndex];
      const taken = Math.min(remaining, hpLeft);
      hpLeft -= taken;
      remaining -= taken;
      if (hpLeft > 0) break;

      const goldFactor = node.kind === 'gold' && unique.has('goldBoost') ? 2 : 1;
      coins += NODE_COINS[node.kind] * rank.coins * goldFactor;
      killed.push(node);
      if (node.kind === 'boss') {
        bossDead = true;
        if (rng() < rank.boxChance) boxes += 1;
      }
      nodeIndex += 1;
      if (nodeIndex === chain.length) chain.push(bonusNode(totalHp, rng));
      hpLeft = chain[nodeIndex].hp;
    }
  };

  for (const entry of session.entries) {
    const killedBefore = killed.length;
    let baseRaw = 0;
    let scaled = 0;
    let crit = false;
    let finisher = false;

    if (entry.kind === 'set' && entry.type !== 'warm') {
      finisher = entry.type === 'finisher' && !finisherKeys.has(entry.exerciseId);
      if (finisher) finisherKeys.add(entry.exerciseId);
      baseRaw = BASE_DAMAGE * (finisher ? FINISHER_MULT : 1);
      scaled = baseRaw * (1 + bonuses.base);
      if (finisher) scaled *= 1 + bonuses.finisher + (unique.has('finisherBoost') ? 0.5 : 0);

      const benchmark = previousBenchmark(history, entry.exerciseId);
      if (benchmark !== null && !critKeys.has(entry.exerciseId) && strengthValue(entry.weight, entry.reps) > benchmark) {
        crit = true;
        critKeys.add(entry.exerciseId);
      }
    } else if (entry.kind === 'cardio') {
      const device = devices.find((candidate) => candidate.id === entry.deviceId);
      const minutes = Math.min(entry.minutes, CARDIO_CAP_MINUTES - cardioMinutes);
      cardioMinutes += Math.max(0, minutes);
      baseRaw = Math.floor(Math.max(0, minutes) / CARDIO_HIT_MINUTES) * (device ? device.factor : 1) * BASE_DAMAGE;
      scaled = baseRaw * (1 + bonuses.cardio);

      const key = `cardio:${entry.deviceId}`;
      const benchmark = previousCardioMetric(history, entry.deviceId);
      if (benchmark !== null && !critKeys.has(key) && entry.metric > benchmark) {
        crit = true;
        critKeys.add(key);
      }
    }

    let critRaw = 0;
    let critScaled = 0;
    if (crit) {
      crits += 1;
      critRaw = CRIT_DAMAGE;
      critScaled = CRIT_DAMAGE * (1 + bonuses.crit);
      if (firstCrit && unique.has('firstCritDouble')) critScaled *= 2;
      firstCrit = false;
    }

    let damage = scaled + critScaled;
    if (damage > 0) {
      if (firstDamage && unique.has('firstSetDouble')) damage *= 2;
      firstDamage = false;
      if (chain[nodeIndex].kind === 'boss' && unique.has('bossBoost')) damage *= 1.25;
    }
    damage = Math.round(damage);

    rawTotal += baseRaw + critRaw;
    damageTotal += damage;
    strike(damage);
    results.push({ entry, damage, crit, finisher, killed: killed.slice(killedBefore) });
  }

  return {
    chain,
    nodeIndex,
    current: chain[nodeIndex],
    hpLeft,
    bossDead,
    killed,
    coins: Math.round(coins * (1 + bonuses.coins)),
    boxes,
    rawTotal,
    damageTotal,
    crits,
    results,
  };
}

export function itemValue(prop, item) {
  const rarity = RARITIES.find((entry) => entry.id === item.rarity);
  return Math.round((10 + 0.3 * item.level) * rarity.mult * prop.roll * 10) / 10;
}

export function collectBonuses(player, inventory, equipped) {
  const { str, prec, end, luck } = player.attrs;
  const totals = { base: 0, crit: 0, cardio: 0, coins: 0, luck: 0 };
  const uniques = [];
  for (const slot of SLOTS) {
    const item = inventory.find((entry) => entry.id === equipped[slot.id]);
    if (!item) continue;
    for (const prop of item.props) totals[prop.stat] += itemValue(prop, item) / 100;
    if (item.unique) uniques.push(item.unique);
  }
  return {
    base: str * 0.02 + totals.base,
    crit: prec * 0.05 + totals.crit,
    cardio: end * 0.03 + totals.cardio,
    finisher: end * 0.03,
    coins: luck * 0.02 + totals.coins,
    luck: luck * 0.01 + totals.luck,
    uniques,
  };
}

export function rollItem(level, rng, pity, luck) {
  const forced = pity + 1 >= PITY_LIMIT;
  const weights = RARITIES.map((rarity) => ({
    ...rarity,
    weight: rarity.weight * (rarity.id === 'legendary' ? 1 + luck * 5 : rarity.id === 'epic' ? 1 + luck * 2 : 1),
  }));
  const rarity = forced ? RARITIES[RARITIES.length - 1] : pickWeighted(weights, rng);
  const slot = pick(SLOTS, rng);
  const stats = [...STATS];
  const props = Array.from({ length: rarity.props }, () => ({
    stat: stats.splice(Math.floor(rng() * stats.length), 1)[0].id,
    roll: 0.85 + rng() * 0.3,
  }));
  return {
    id: `item-${Math.floor(rng() * 1e12).toString(36)}`,
    name: pick(ITEM_NAMES[slot.id], rng),
    slot: slot.id,
    rarity: rarity.id,
    level,
    props,
    unique: rarity.id === 'legendary' ? pick(UNIQUES, rng).id : null,
  };
}

export function upgradeCost(item, level) {
  const difference = Math.max(0, level - item.level);
  const tier = RARITIES.findIndex((rarity) => rarity.id === item.rarity) + 1;
  return { essence: difference * tier * 2, coins: difference * 20 };
}

export function addXp(player, amount) {
  player.xp += amount;
  let gained = 0;
  while (player.xp >= levelCost(player.level)) {
    player.xp -= levelCost(player.level);
    player.level += 1;
    player.points += POINTS_PER_LEVEL;
    gained += 1;
  }
  return gained;
}

export function createSession(state, plan, now, rng) {
  const seed = Math.floor(rng() * 2 ** 32);
  const rank = rollRank(rng);
  const baseline = baselineFor(plan, state.history);
  return {
    id: `session-${now.getTime()}`,
    planId: plan.id,
    planName: plan.name,
    startedAt: now.toISOString(),
    seed,
    rankId: rank.id,
    baseline,
    totalHp: Math.round(baseline * rank.factor),
    bonuses: collectBonuses(state.player, state.inventory, state.equipped),
    entries: [],
    entered: false,
  };
}

export function rerollGate(state, rng) {
  const session = state.active;
  if (!session || session.entered || state.player.coins < PRICES.reroll) return false;
  const rank = rollRank(rng, session.rankId);
  state.player.coins -= PRICES.reroll;
  session.seed = Math.floor(rng() * 2 ** 32);
  session.rankId = rank.id;
  session.totalHp = Math.round(session.baseline * rank.factor);
  return true;
}

// Bonusbeute der Quests. Glück erhöht nur die Chance auf eine Lootbox.
function grantQuestReward(state, kind, rng) {
  const { luck } = collectBonuses(state.player, state.inventory, state.equipped);
  const table = QUEST_REWARDS[kind].map((entry) => (
    entry.boxes ? { ...entry, weight: entry.weight * (1 + luck) } : entry
  ));
  const { coins = 0, essence = 0, boxes = 0 } = pickWeighted(table, rng);
  state.player.coins += coins;
  state.player.essence += essence;
  state.player.boxes += boxes;
  return { coins, essence, boxes };
}

export function finishSession(state, now, rng = Math.random) {
  const session = state.active;
  const result = computeSession(session, state.history, state.cardioDevices);
  const rank = rankById(session.rankId);
  const player = state.player;

  let xp = XP.training + result.crits * XP.crit;
  if (result.bossDead) xp += rank.xp;

  state.history.push({
    id: session.id,
    planId: session.planId,
    planName: session.planName,
    startedAt: session.startedAt,
    endedAt: now.toISOString(),
    rankId: session.rankId,
    entries: session.entries,
    rawTotal: result.rawTotal,
    damageTotal: result.damageTotal,
    crits: result.crits,
    cleared: result.bossDead,
  });

  const week = weekKey(now);
  const weeklyReached = trainingsThisWeek(state.history, now) >= WEEKLY_GOAL && !state.claims.weeks[week];
  let weeklyReward = null;
  if (weeklyReached) {
    state.claims.weeks[week] = true;
    xp += XP.weekly;
    weeklyReward = grantQuestReward(state, 'weekly', rng);
  }

  player.coins += result.coins;
  player.boxes += result.boxes;
  const levels = addXp(player, xp);
  state.active = null;
  state.backup.trainingsSince += 1;

  return { ...result, xp, levels, weeklyReached, weeklyReward, rankId: session.rankId, planName: session.planName };
}

export function logSteps(state, day, steps, rng = Math.random) {
  state.steps[day] = steps;
  if (steps < STEP_GOAL || state.claims.days[day]) return null;
  state.claims.days[day] = true;
  addXp(state.player, XP.steps);
  return grantQuestReward(state, 'steps', rng);
}

export function hasWeighedIn(state, now) {
  return Boolean(state.claims.weighIns[weekKey(now)]);
}

export function logBodyweight(state, now, kg, rng = Math.random) {
  const date = dateKey(now);
  state.bodyweight = state.bodyweight.filter((entry) => entry.date !== date);
  state.bodyweight.push({ date, kg });
  state.bodyweight.sort((a, b) => a.date.localeCompare(b.date));

  if (hasWeighedIn(state, now)) return null;
  state.claims.weighIns[weekKey(now)] = true;
  addXp(state.player, XP.weighIn);
  return grantQuestReward(state, 'weighIn', rng);
}

export function exerciseProgress(history, exerciseId) {
  return history.flatMap((session) => {
    const sets = session.entries.filter(
      (entry) => entry.kind === 'set' && entry.exerciseId === exerciseId && entry.type !== 'warm',
    );
    if (!sets.length) return [];
    const best = sets.reduce((top, set) => (
      strengthValue(set.weight, set.reps) > strengthValue(top.weight, top.reps) ? set : top
    ));
    return [{
      date: session.endedAt,
      weight: best.weight,
      reps: best.reps,
      strength: Math.round(strengthValue(best.weight, best.reps) * 10) / 10,
    }];
  });
}

export function openBox(state, rng) {
  if (state.player.boxes < 1) return null;
  const luck = collectBonuses(state.player, state.inventory, state.equipped).luck;
  const item = rollItem(state.player.level, rng, state.pity, luck);
  state.player.boxes -= 1;
  state.pity = item.rarity === 'legendary' ? 0 : state.pity + 1;
  state.inventory.push(item);
  return item;
}

export function dismantleItem(state, itemId) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item || Object.values(state.equipped).includes(itemId)) return false;
  state.player.essence += RARITIES.find((rarity) => rarity.id === item.rarity).essence;
  state.inventory = state.inventory.filter((entry) => entry.id !== itemId);
  return true;
}

export function upgradeItem(state, itemId) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item || item.level >= state.player.level) return false;
  const cost = upgradeCost(item, state.player.level);
  if (state.player.essence < cost.essence || state.player.coins < cost.coins) return false;
  state.player.essence -= cost.essence;
  state.player.coins -= cost.coins;
  item.level = state.player.level;
  return true;
}
