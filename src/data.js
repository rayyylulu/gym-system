// Startdaten aus dem Trainingsplan. Die Sätze füllen nur die Eingabefelder vor
// und zählen nicht als Verlauf, damit das erste echte Training den Startwert setzt.

const sets = (...pairs) => pairs.map(([reps, weight]) => ({ reps, weight }));

const EXERCISES = [
  { id: 'incline', name: 'Schrägbank', sets: sets([10, 20], [10, 25], [10, 30], [6, 30]) },
  { id: 'shoulder', name: 'Schulterdrücken', sets: sets([10, 15], [10, 20], [10, 25], [10, 25]) },
  { id: 'lateral', name: 'Seitheben', sets: sets([10, 20], [9, 25], [5, 25], [6, 20]) },
  { id: 'chestpress', name: 'Brustpresse', sets: sets([10, 25], [10, 30], [10, 35], [15, 35]) },
  { id: 'row', name: 'Rudern', sets: sets([8, 45], [8, 45], [15, 30], [15, 30]) },
  { id: 'triceps', name: 'Trizeps Kabelzug', sets: sets([7, 50], [10, 40], [5, 40]) },
  { id: 'bicepscable', name: 'Bizeps Kabel', sets: sets([8, 40], [11, 30], [7, 30]) },
  { id: 'latpull', name: 'Latzug', sets: sets([7, 50], [12, 40], [7, 40]) },
  { id: 'bicepsmachine', name: 'Bizeps Maschine', sets: sets([8, 25], [11, 15], [6, 15]) },
  { id: 'squat', name: 'Squat-Gerät', sets: [] },
  { id: 'legpress', name: 'Beinpresse', sets: [] },
  { id: 'adductor', name: 'Adduktor', sets: [] },
  { id: 'abductor', name: 'Abduktor', sets: [] },
  { id: 'legextension', name: 'Beinstrecker', sets: [] },
  { id: 'legcurl', name: 'Beinbeuger', sets: [] },
];

const PLANS = [
  { id: 'push', name: 'Brust, Schulter, Cardio', exerciseIds: ['incline', 'shoulder', 'lateral', 'chestpress'], cardio: true },
  { id: 'pull', name: 'Rücken, Arme, Cardio', exerciseIds: ['row', 'triceps', 'bicepscable', 'latpull', 'bicepsmachine'], cardio: true },
  { id: 'legs', name: 'Beine, Bauch, Cardio', exerciseIds: ['squat', 'legpress', 'adductor', 'abductor', 'legextension', 'legcurl'], cardio: true },
  { id: 'cardio', name: 'Nur Cardio', exerciseIds: [], cardio: true },
];

const CARDIO_DEVICES = [
  { id: 'treadmill', name: 'Laufband', metricName: 'Strecke', unit: 'km', factor: 1 },
  { id: 'stairmaster', name: 'Stairmaster', metricName: 'Stockwerke', unit: 'Stockwerke', factor: 1.5 },
];

export const COSMETICS = [
  { id: 'theme-blue', kind: 'theme', name: 'System-Blau', price: 0 },
  { id: 'theme-crimson', kind: 'theme', name: 'Rotes Tor', price: 500 },
  { id: 'theme-violet', kind: 'theme', name: 'Schattenviolett', price: 1000 },
  { id: 'theme-gold', kind: 'theme', name: 'Monarchengold', price: 3000 },
  { id: 'title-awakened', kind: 'title', name: 'Der Erwachte', price: 500 },
  { id: 'title-ironborn', kind: 'title', name: 'Eisenseele', price: 1000 },
  { id: 'title-shadow', kind: 'title', name: 'Schattenjäger', price: 3000 },
];

export function createState() {
  return {
    version: 1,
    player: {
      level: 1,
      xp: 0,
      points: 0,
      coins: 0,
      essence: 0,
      boxes: 0,
      attrs: { str: 0, prec: 0, end: 0, luck: 0 },
    },
    exercises: structuredClone(EXERCISES),
    plans: structuredClone(PLANS),
    cardioDevices: structuredClone(CARDIO_DEVICES),
    history: [],
    active: null,
    parkedGate: null,
    inventory: [],
    equipped: {},
    pity: 0,
    steps: {},
    bodyweight: [],
    claims: { days: {}, weeks: {}, weighIns: {} },
    cosmetics: { owned: ['theme-blue'], theme: 'theme-blue', title: null },
    backup: { trainingsSince: 0, lastAt: null },
  };
}
