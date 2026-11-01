import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addXp, baselineFor, collectBonuses, computeSession, createSession, dismantleItem, finishSession,
  hunterRank, itemValue, levelCost, logSteps, mulberry, nextPlanId, openBox, rerollGate, rollItem,
  strengthValue, upgradeCost, upgradeItem,
} from '../src/rules.js';
import { createState } from '../src/data.js';

const noBonuses = { base: 0, crit: 0, cardio: 0, finisher: 0, coins: 0, luck: 0, uniques: [] };

function session(entries, overrides = {}) {
  return { seed: 1, rankId: 'C', totalHp: 200, bonuses: noBonuses, entries, ...overrides };
}

const set = (weight, reps, type = 'work', exerciseId = 'bench') => ({ kind: 'set', exerciseId, weight, reps, type });
const past = (...entries) => ({ planId: 'push', entries, rawTotal: 200, endedAt: '2026-01-01T10:00:00.000Z' });

test('Kraftwert entspricht den Beispielen aus dem Konzept', () => {
  assert.equal(Math.round(strengthValue(50, 8) * 10) / 10, 63.3);
  assert.equal(Math.round(strengthValue(52.5, 6) * 10) / 10, 63);
  assert.equal(Math.round(strengthValue(50, 9) * 10) / 10, 65);
  assert.equal(Math.round(strengthValue(52.5, 7) * 10) / 10, 64.8);
});

test('Arbeitssatz macht Grundschaden, Aufwärmsatz keinen, Finisher doppelt', () => {
  const { results } = computeSession(session([set(20, 10, 'warm'), set(50, 10), set(50, 6, 'finisher')]), []);
  assert.deepEqual(results.map((result) => result.damage), [0, 10, 20]);
});

test('nur ein Finisher pro Übung zählt doppelt', () => {
  const { results } = computeSession(session([set(50, 6, 'finisher'), set(50, 6, 'finisher')]), []);
  assert.deepEqual(results.map((result) => result.damage), [20, 10]);
});

test('erstes Training einer Übung hat keinen Krit', () => {
  assert.equal(computeSession(session([set(100, 10)]), []).crits, 0);
});

test('Krit vergleicht mit dem letzten Training, nicht mit dem Allzeitbest', () => {
  const history = [past(set(60, 10)), past(set(50, 8))];
  const result = computeSession(session([set(50, 9), set(50, 10)]), history);
  assert.equal(result.crits, 1);
  assert.deepEqual(result.results.map((entry) => entry.damage), [40, 10]);
});

test('gleicher oder schwächerer Satz bringt keinen Krit', () => {
  const history = [past(set(50, 8))];
  assert.equal(computeSession(session([set(50, 8), set(52.5, 6)]), history).crits, 0);
});

test('Aufwärmsätze zählen nicht als Messlatte', () => {
  const history = [past(set(100, 10, 'warm'), set(50, 8))];
  assert.equal(computeSession(session([set(50, 9)]), history).crits, 1);
});

test('Cardio nutzt Gerätefaktor, Fünf-Minuten-Treffer und Obergrenze', () => {
  const devices = [{ id: 'stair', factor: 1.5 }];
  const cardio = (minutes) => ({ kind: 'cardio', deviceId: 'stair', minutes, metric: 10 });
  const { results } = computeSession(session([cardio(20), cardio(50)], { totalHp: 999 }), [], devices);
  assert.deepEqual(results.map((result) => result.damage), [60, 120]);
});

test('Cardio-Krit kommt über den Messwert des Geräts', () => {
  const devices = [{ id: 'stair', factor: 1 }];
  const cardio = (metric) => ({ kind: 'cardio', deviceId: 'stair', minutes: 5, metric });
  const history = [past(cardio(50))];
  assert.equal(computeSession(session([cardio(50)]), history, devices).crits, 0);
  assert.equal(computeSession(session([cardio(51)]), history, devices).crits, 1);
});

test('Boss kommt nach den Monstern, danach folgen Bonusgegner', () => {
  const big = computeSession(session(Array.from({ length: 30 }, () => set(50, 10))), []);
  const bossIndex = big.chain.findIndex((node) => node.kind === 'boss');
  assert.ok(bossIndex >= 3 && bossIndex <= 7);
  assert.ok(big.bossDead);
  assert.ok(['bonus', 'gold'].includes(big.chain[bossIndex + 1].kind));
  assert.equal(big.chain.slice(0, bossIndex).reduce((sum, node) => sum + node.hp, 0) + big.chain[bossIndex].hp, 200);
});

test('zu wenig Schaden lässt den Boss überleben', () => {
  assert.equal(computeSession(session([set(50, 10)]), []).bossDead, false);
});

test('gleiche Einträge ergeben denselben Dungeon, auch nach Rückgängig', () => {
  const entries = [set(50, 10), set(50, 10), set(50, 10)];
  const before = computeSession(session(entries.slice(0, 2)), []);
  computeSession(session(entries), []);
  const after = computeSession(session(entries.slice(0, 2)), []);
  assert.deepEqual(after.chain, before.chain);
  assert.equal(after.hpLeft, before.hpLeft);
});

test('Attribute und Ausrüstung erhöhen den Schaden, nicht die Dungeon-Größe', () => {
  const state = createState();
  const plan = state.plans[0];
  const before = baselineFor(plan, state.history);
  state.player.attrs.str = 10;
  assert.equal(baselineFor(plan, state.history), before);
  const bonuses = collectBonuses(state.player, state.inventory, state.equipped);
  assert.equal(computeSession(session([set(50, 10)], { bonuses }), []).results[0].damage, 12);
});

test('Dungeon-Größe folgt dem Schnitt der letzten drei Trainings dieser Art', () => {
  const plan = { id: 'push', exerciseIds: ['bench'], cardio: true };
  const history = [100, 300, 200, 100].map((rawTotal) => ({ planId: 'push', rawTotal }));
  assert.equal(baselineFor(plan, history), 200);
});

test('Level-Kurve passt zum Konzept', () => {
  assert.equal(levelCost(1), 360);
  const player = { level: 1, xp: 0, points: 0 };
  assert.equal(addXp(player, 360 + 420), 2);
  assert.deepEqual(player, { level: 3, xp: 0, points: 6 });
  assert.equal(hunterRank(9), 'E');
  assert.equal(hunterRank(30), 'B');
  assert.equal(hunterRank(70), 'S');
});

test('Rotation schlägt das nächste Krafttraining vor und überspringt Nur-Cardio', () => {
  const state = createState();
  assert.equal(nextPlanId(state.plans, []), 'push');
  assert.equal(nextPlanId(state.plans, [{ planId: 'pull' }, { planId: 'cardio' }]), 'legs');
  assert.equal(nextPlanId(state.plans, [{ planId: 'legs' }]), 'push');
});

test('Training abschließen vergibt XP, Münzen und das Wochenziel nur einmal', () => {
  const state = createState();
  const now = new Date(2026, 10, 2, 18);
  const rng = mulberry(7);
  let lastSummary;
  for (let i = 0; i < 5; i++) {
    state.active = createSession(state, state.plans[0], now, rng);
    state.active.entries.push(set(50, 10));
    lastSummary = finishSession(state, now);
    if (i === 3) assert.equal(lastSummary.weeklyReached, true);
  }
  assert.equal(lastSummary.weeklyReached, false);
  assert.equal(state.history.length, 5);
  assert.equal(state.active, null);
  assert.equal(state.backup.trainingsSince, 5);
});

test('Tor-Neuwurf kostet Münzen und ändert den Rang', () => {
  const state = createState();
  const rng = mulberry(3);
  state.active = createSession(state, state.plans[0], new Date(), rng);
  assert.equal(rerollGate(state, rng), false);
  state.player.coins = 200;
  const before = state.active.rankId;
  assert.equal(rerollGate(state, rng), true);
  assert.equal(state.player.coins, 0);
  assert.notEqual(state.active.rankId, before);
  state.player.coins = 200;
  state.active.entered = true;
  assert.equal(rerollGate(state, rng), false);
});

test('Tagesquest gibt pro Tag nur einmal XP', () => {
  const state = createState();
  assert.equal(logSteps(state, '2026-11-02', 9999), false);
  assert.equal(logSteps(state, '2026-11-02', 10000), true);
  assert.equal(logSteps(state, '2026-11-02', 12000), false);
  assert.equal(state.player.xp, 50);
});

test('Glücksschutz garantiert spätestens die 30. Box', () => {
  const state = createState();
  state.player.boxes = 30;
  const rng = () => 0;
  let item;
  for (let i = 0; i < 30; i++) item = openBox(state, rng);
  assert.equal(item.rarity, 'legendary');
  assert.equal(state.pity, 0);
});

test('Seltenheit bestimmt Eigenschaften, Legendär hat einen Einzigartigen Effekt', () => {
  const rng = mulberry(11);
  for (let i = 0; i < 200; i++) {
    const item = rollItem(10, rng, 0, 0);
    assert.equal(new Set(item.props.map((prop) => prop.stat)).size, item.props.length);
    assert.equal(Boolean(item.unique), item.rarity === 'legendary');
  }
});

test('Legendäres Teil skaliert mit dem Level wie im Beispiel', () => {
  const low = itemValue({ roll: 1 }, { rarity: 'legendary', level: 10 });
  const high = itemValue({ roll: 1 }, { rarity: 'legendary', level: 70 });
  assert.equal(low, 13);
  assert.equal(high, 31);
});

test('Zerlegen gibt Essenz, angelegte Teile sind geschützt', () => {
  const state = createState();
  state.inventory.push({ id: 'a', rarity: 'rare', level: 1, props: [] });
  state.inventory.push({ id: 'b', rarity: 'rare', level: 1, props: [] });
  state.equipped.weapon = 'a';
  assert.equal(dismantleItem(state, 'a'), false);
  assert.equal(dismantleItem(state, 'b'), true);
  assert.equal(state.player.essence, 20);
});

test('Aufwerten hebt ein Teil auf das aktuelle Level', () => {
  const state = createState();
  const item = { id: 'a', rarity: 'legendary', level: 1, props: [] };
  state.inventory.push(item);
  state.player.level = 11;
  assert.deepEqual(upgradeCost(item, 11), { essence: 100, coins: 200 });
  assert.equal(upgradeItem(state, 'a'), false);
  state.player.essence = 100;
  state.player.coins = 200;
  assert.equal(upgradeItem(state, 'a'), true);
  assert.equal(item.level, 11);
  assert.equal(state.player.essence, 0);
});
