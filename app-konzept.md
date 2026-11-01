# Gym-App im Solo-Leveling-Stil: Konzept

Alle Zahlen sind Startwerte und werden beim Testen angepasst.

## Grundlagen
- Kostenlos, Web-App (PWA) auf dem iPhone, kein Echtgeld in der App
- Muss im Gym ohne Empfang funktionieren
- Dunkler "System"-Look mit blau leuchtenden Fenstern und System-Meldungen
- Bedienung im Gym: große Knöpfe, letztes Gewicht vorausgefüllt, Satz in wenigen Tipps eingetragen
- Bereiche: Status, Dungeon, Inventar, Shop, Ernährung (gesperrt)
- Daten auf dem iPhone, Backup-Datei in iCloud Drive, Erinnerung nach jedem vierten Training

## Training
- Trainingsarten: Brust/Schulter/Cardio, Rücken/Arme/Cardio, Beine/Bauch/Cardio, Nur-Cardio
- Keine festen Tage: Die App schlägt das nächste Training vor, du entscheidest
- Reihenfolge der Übungen frei wählbar, Übungen selbst anlegbar
- Satzaufbau: 3 Sätze mit Ziel 10 Wiederholungen, dann Finisher nach kurzer Pause bis zum Muskelversagen

## Schaden
- Jeder Arbeitssatz macht Grundschaden, Aufwärmsätze machen keinen
- Finisher: doppelter Grundschaden
- Krit: bester Satz liegt über dem besten Arbeitssatz des letzten Trainings
- Höchstens ein Krit pro Übung und Training, erstes Training einer Übung ohne Krit
- Kraftwert = Gewicht × (1 + Wiederholungen / 30)

## Cardio
- Laufband: 1 Treffer pro 5 Minuten, Krit über Strecke
- Stairmaster: 1,5 Treffer pro 5 Minuten, Krit über Stockwerke oder Stufen
- Eigene Geräte: Messwert frei wählbar, 1 Treffer pro 5 Minuten, änderbar
- Höchstens 60 Minuten pro Training zählen für Schaden

## Dungeons
- Beim Start öffnet sich ein Tor mit zufälligem Rang
- Zufällige Zahl an Monstern, danach ein Boss; Schaden läuft unabhängig von der Übung durch diese Reihe
- Lebenspunkte = Schnitt der letzten Trainings dieser Art ohne Ausrüstung und Attribute × Rang-Faktor
- Rang-Faktoren: E 70 %, D 85 %, C 100 %, B 110 %, A 120 %, S 140 %; höhere Ränge sind seltener
- Boss vor Trainingsende besiegt: Bonusgegner oder Goldraum
- Training beendet und Boss lebt: Beute der besiegten Monster bleibt, keine Boss-Beute, keine Strafe
- Später: Rote Tore als Stufe über S

## XP und Level
| Aktion | XP |
|---|---|
| Training abgeschlossen | 100 |
| Krit | 20 |
| Dungeon geschafft | 30 bis 100 je nach Rang |
| Wochenziel: 4 Trainings | 200 |
| Tagesquest: 10.000 Schritte | 50 |
| Wiege-Quest: einmal pro Woche | 50 |

Bonusbeute der Quests (Glück erhöht nur die Lootbox-Chance):
- Tagesquest: 5 % Lootbox, 15 % 20 Essenz, 40 % 75 Münzen, 40 % nichts
- Wochenziel: 25 % Lootbox, sonst 300 Münzen
- Wiege-Quest: 10 % Lootbox, sonst 100 Münzen

- Kosten von Level n auf n+1: 300 + 60 × n XP, keine Level-Obergrenze
- Pro Level-up 3 Attributspunkte für Stärke, Präzision, Ausdauer und Glück
- Jäger-Rang: D ab Level 10, B ab Level 30, A ab Level 50, S ab Level 70
- Alle 3 Monate eine Saison mit neuem Thema, Bossen und Ausrüstung, ohne Fortschrittsverlust

## Ausrüstung
- Plätze: Waffe, Helm, Rüstung, Handschuhe, Stiefel
- Seltenheiten: Gewöhnlich, Ungewöhnlich, Selten, Episch, Legendär
- Teile kommen mit deinem aktuellen Level, das Level bestimmt die Stärke
- Seltenheit bestimmt die Zahl der Eigenschaften, Legendär: drei plus einzigartiger Effekt
- Werte sind zufällig
- Alte Teile werden zu Essenz zerlegt; Essenz und Münzen bringen ein Teil auf dein Level
- Glücksschutz: spätestens nach 30 Lootboxen ein legendäres Teil
- Jedes der 16 Item-Modelle hat eine eigene Grafik, Episch und Legendär leuchten und funkeln
- Kisten öffnen sich mit einem Streifen wie in Counter-Strike; das Ergebnis steht vorher fest, die Streifen-Füllung ist nur Optik

## Fortschritt
- Status hat die Ansichten Übersicht und Fortschritt
- Körpergewicht: Eintrag, Diagramm, Veränderung seit dem ersten Wert
- Kraftentwicklung pro Übung: Diagramm für Kraftwert oder Gewicht des besten Arbeitssatzes

## Shop
| Angebot | Münzen |
|---|---|
| Lootbox | 500 |
| Saison-Box | 1.000 |
| Essenz | 300 |
| Tor-Neuwurf | 200 |
| Kosmetik | 500 bis 3.000 |

- Pro geschafftem Dungeon grob 200 bis 300 Münzen

## Uhr und Apple Health
- Weg: Uhr → Huawei Health → Apple Health → Kurzbefehl → Zwischenablage → Import in der App
- Schritte zählen für die Tagesquest, manuelle Eingabe als Ersatz
- Alle anderen Uhrdaten sind nur Statistik

## Ausbaustufen
1. Training, Schaden, Dungeons, XP, Attribute, Ausrüstung, Shop, Backup, Schritte von Hand
2. Import aus Apple Health
3. Saisons und Rote Tore
4. Kalorien-Tracker mit Barcode-Scanner und Open Food Facts

## Noch offen
- Testen, welche Daten der Uhr außer den Schritten in Apple Health ankommen (Schritte sind bestätigt)
- Name der App (Arbeitstitel: Gym System)
- Startwerte im Alltag prüfen: Grundschaden 10, Krit 30, Rang-Häufigkeiten, Münzen
- Gewichte für den Beintag ergänzen
- Hintergründe als Kosmetik fehlen noch, Farben und Titel sind drin

## Aktueller Trainingsplan

### Brust, Schulter, Cardio
- Schrägbank: 10 × 20 kg, 10 × 25 kg, 10 × 30 kg, nach 30 s 6 × 30 kg
- Schulterdrücken: 10 × 15 kg, 10 × 20 kg, 10 × 25 kg, nach 30 s 10 × 25 kg
- Seitheben: 10 × 20 kg, 9 × 25 kg, 5 × 25 kg, nach 30 s 6 × 20 kg
- Brustpresse: 10 × 25 kg, 10 × 30 kg, 10 × 35 kg, nach 30 s 15 × 35 kg

### Rücken, Arme, Cardio
- Rudern: 2 × 8 mit 45 kg, 1 × 15 mit 30 kg, nach 30 s nochmal
- Trizeps Kabelzug: 7 × 50 kg, 10 × 40 kg, nach 30 s 5 × 40 kg
- Bizeps Kabel: 8 × 40 kg, 11 × 30 kg, nach 30 s 7 × 30 kg
- Latzug: 7 × 50 kg, 12 × 40 kg, nach 30 s 7 × 40 kg
- Bizeps Maschine: 8 × 25 kg, 11 × 15 kg, nach 30 s 6 × 15 kg

### Beine, Bauch, Cardio
- Noch ohne Werte: Squat-ähnliches Gerät, Beinpresse, Adduktor, Abduktor, Beinstrecker, Beinbeuger
