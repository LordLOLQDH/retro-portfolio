# Retro 3D Portfolio

Portfolio im Stil eines alten Büro-PCs: BIOS-Boot → 3D-Schreibtisch → Zoom in den Röhrenmonitor → Windows-95-Desktop mit
Home / About / Experience / Projects / Contact → Shutdown-Sequenz.

- Hosting: **GitHub Pages** (kostenlos)
- Backend: **Supabase** (Free Plan): Projekte laden + Kontaktformular speichern
- Kein Build-Schritt, kein Node nötig. Three.js und supabase-js liegen in `vendor/`.

## Dateistruktur

```
retro-portfolio/
├── index.html              Seitenstruktur
├── .nojekyll               verhindert Jekyll-Verarbeitung auf GitHub Pages
├── css/style.css           Styles (BIOS, Start-Box, Desktop)
├── js/
│   ├── config.js           <- HIER deine Inhalte + Supabase-Daten eintragen
│   ├── supabase-client.js  Projekte laden, Nachrichten senden
│   ├── bios.js             BIOS-Boot-Animation
│   ├── scene.js            3D-Schreibtisch (Three.js)
│   ├── desktop.js          Win95-Desktop, Seiten, Kontaktformular
│   └── main.js             Ablauf der Seite
├── vendor/                 three.min.js (r150.1), supabase.js (2.45.4)
├── supabase/
│   ├── schema.sql          Tabellen + Sicherheitsregeln
│   └── seed.sql            optionale Beispielprojekte
└── assets/                 für eigene Bilder/Dateien (z. B. Lebenslauf-PDF)
```

## 1. Lokal ansehen

Einfach `index.html` im Browser öffnen, oder mit einem lokalen Server:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Ohne Supabase-Konfiguration läuft alles mit den Beispielprojekten aus `js/config.js`. Das Kontaktformular meldet dann
„not configured“.

## 2. Supabase einrichten (komplett kostenlos)

### 2.1 Konto und Projekt

1. Auf https://supabase.com gehen und **Start your project** wählen. Anmeldung mit GitHub ist am einfachsten.
2. **New project** anlegen. Organisation wählen (Free Plan).
3. Name: z. B. `portfolio`. **Database Password**: ein starkes Passwort wählen und im Passwortmanager speichern. Du
   brauchst es für dieses Projekt nicht, aber du kannst es später nicht einsehen.
4. **Region**: eine europäische, z. B. *Central EU (Frankfurt)*.
5. Plan **Free** lassen und **Create new project**. Die Einrichtung dauert ca. 1–2 Minuten.

### 2.2 Tabellen und Sicherheitsregeln anlegen

1. Links im Dashboard **SQL Editor** öffnen → **New query**.
2. Den kompletten Inhalt von `supabase/schema.sql` einfügen und **Run** klicken. Erwartet: „Success. No rows returned“.
3. Optional: genauso `supabase/seed.sql` ausführen, um zwei Beispielprojekte anzulegen.
4. Kontrolle unter **Table Editor**: Es müssen die Tabellen `projects` und `messages` existieren, jeweils mit dem
   Hinweis „RLS enabled“.

Was das Schema festlegt:

| Tabelle    | Besucher (anon) darf …  | Du (Dashboard) darfst … |
|------------|-------------------------|--------------------------|
| `projects` | lesen                   | alles                    |
| `messages` | nur einfügen, nicht lesen | alles                  |

Zusätzlich begrenzen `check`-Regeln die Länge der Felder und prüfen das E-Mail-Format, damit niemand riesige Texte
einschleusen kann.

### 2.3 URL und Key in die Seite eintragen

1. Im Dashboard **Project Settings** (Zahnrad) → **API** (je nach Dashboard-Version „API Keys“ / „Data API“).
2. **Project URL** kopieren (Format `https://abcdxyz.supabase.co`).
3. Den **anon public** Key kopieren. In neueren Dashboards heißt er **Publishable key** (`sb_publishable_...`);
   beide funktionieren mit supabase-js.
4. In `js/config.js` eintragen:

```js
supabase: {
  url: "https://abcdxyz.supabase.co",
  anonKey: "dein-anon-oder-publishable-key"
}
```

> **Wichtig:** Nur den `anon`/`publishable` Key verwenden. Der `service_role` bzw. `secret` Key darf **nie** in den
> Code, weil er alle Sicherheitsregeln umgeht. Der anon-Key ist öffentlich gedacht; geschützt wird deine Datenbank
> durch Row Level Security (RLS) aus `schema.sql`.

### 2.4 Projekte pflegen

**Table Editor → projects → Insert → Insert row.** Felder:

- `title`, `description`: Pflicht
- `url`: muss mit `http://` oder `https://` beginnen
- `tags`: z. B. `React, Supabase`
- `sort`: kleinere Zahl steht weiter oben

Änderungen erscheinen sofort nach einem Neuladen der Seite. Ist die Tabelle leer, zeigt die Seite die
`fallbackProjects` aus `config.js`.

### 2.5 Nachrichten lesen

**Table Editor → messages.** Dort siehst du alle Einsendungen mit Name, E-Mail, Firma, Nachricht und Zeitstempel.
Besucher können diese Tabelle nicht lesen.

Optional (ebenfalls kostenlos) E-Mail-Benachrichtigung: **Database → Webhooks** erstellen (Tabelle `messages`,
Event `INSERT`) und an eine Edge Function oder einen Dienst wie Resend/Zapier/Make weiterleiten. Das ist für die
Seite nicht nötig.

### 2.6 Zugriff auf deine Domain beschränken (optional)

Supabase-API-Aufrufe aus dem Browser sind per CORS grundsätzlich erlaubt. Schutz vor Missbrauch bieten die
RLS-Regeln, die Längenlimits, das Honeypot-Feld und die 60-Sekunden-Sperre im Formular. Bei Spam kannst du Zeilen
im Table Editor löschen oder unter **Authentication → Rate Limits** bzw. mit einem CAPTCHA nachrüsten.

### 2.7 Free-Plan-Hinweise

- Projekte werden nach etwa **7 Tagen ohne Aktivität pausiert**. Im Dashboard mit **Restore project** wieder
  starten (Daten bleiben erhalten). Ein Besuch der Seite, der Projekte lädt, zählt als Aktivität; wer sicher
  gehen will, richtet einen kostenlosen Ping ein (z. B. ein wöchentlicher Aufruf per GitHub Action).
- Es gibt Limits für Datenbankgröße und Traffic. Für ein Portfolio reichen sie weit.
- Aktuelle Grenzen: https://supabase.com/pricing

### 2.8 Fehlersuche

| Symptom | Ursache / Lösung |
|---------|------------------|
| Formular: „Contact form is not configured yet.“ | `url` / `anonKey` in `config.js` noch Platzhalter |
| Formular: „Sending failed“ | Browser-Konsole öffnen (F12). Meist fehlt `schema.sql` oder der Key ist falsch |
| Konsole: `new row violates row-level security policy` | Policy `messages_public_insert` fehlt → `schema.sql` erneut ausführen |
| Konsole: `violates check constraint` | Eingabe zu lang oder ungültige E-Mail |
| Projekte erscheinen nicht | Tabelle leer, falscher Key, oder Policy `projects_public_read` fehlt |
| Alles lädt nicht nach Wochen | Projekt pausiert → im Dashboard wiederherstellen |

## 3. Auf GitHub Pages veröffentlichen

1. Auf GitHub ein neues Repository anlegen (public, z. B. `portfolio`).
2. Den Inhalt dieses Ordners hochladen. Entweder per Web-Upload („Add file → Upload files“) oder per Git:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/portfolio.git
git push -u origin main
```

3. Im Repo **Settings → Pages**. Bei **Build and deployment** → Source: **Deploy from a branch**, Branch: `main`,
   Ordner `/ (root)` → **Save**.
4. Nach ca. 1 Minute ist die Seite unter `https://DEIN-NAME.github.io/portfolio/` erreichbar.
5. Eigene Domain (optional): unter Pages „Custom domain“ eintragen und beim Domain-Anbieter einen CNAME auf
   `DEIN-NAME.github.io` setzen.

Alle Pfade sind relativ, die Seite funktioniert daher auch in einem Unterordner wie `/portfolio/`.

## 4. Anpassen

- **Inhalte**: alles in `js/config.js` (Name, Rolle, About, Erfahrung, Links).
- **Titel/SEO**: `<title>` und `<meta name="description">` in `index.html`.
- **Farben/Look**: `css/style.css` (Desktop-Teal ist `#4a9aa0`, Fensterleiste `#000080`).
- **Schreibtisch**: Formen und Farben in `js/scene.js`. Eigene 3D-Modelle (glTF) kannst du später mit dem
  `GLTFLoader` aus Three.js laden, dafür bräuchtest du einen Webserver (GitHub Pages reicht).
- **Lebenslauf**: PDF in `assets/` legen und in `desktop.js` unter „contact“ verlinken.

## Hinweise

- Ohne WebGL (sehr alte Geräte) überspringt die Seite die 3D-Szene und zeigt direkt den Desktop.
- Im BIOS-Screen überspringt ein Tastendruck oder Klick die Animation.
- Three.js (MIT-Lizenz) liegt in `vendor/`; die Lizenz steht in `vendor/LICENSE-three.txt`.
