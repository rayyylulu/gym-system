# Gym System

Kostenlose Trainings-App im Solo-Leveling-Stil als Web-App für das iPhone. Das Spielkonzept steht in [app-konzept.md](app-konzept.md).

## Lokal starten

```bash
python -m http.server 4173
```

Danach `http://localhost:4173` öffnen. Der Offline-Speicher ist auf localhost nur mit `?sw=1` aktiv.

## Tests

```bash
npm test
```

## Aufs iPhone bringen

Die App läuft ohne Build-Schritt. Alle Dateien können direkt auf GitHub Pages liegen, das HTTPS mitbringt. Danach die Adresse in Safari öffnen und über „Teilen“ → „Zum Home-Bildschirm“ hinzufügen.
