# Glanzwerk – Vue 3 + Pinia

Die bestehende Glanzwerk-Website ist auf **Vue 3, Composition API (`<script setup>`) und Pinia** umgebaut. Das responsive Design, Leistungspakete, beide Vorher-Nachher-Regler und die Terminbuchung sind enthalten.

## Lokal starten

Voraussetzung: **Node.js 24 oder neuer**. Es ist kein separat installierter Datenbankserver und kein Cloudflare-Account nötig.

1. ZIP vollständig in einen neuen Ordner entpacken (nicht über das alte React-Projekt kopieren).
2. Den Ordner `glanzwerk-vue` in VS Code über **File → Open Folder** öffnen.
3. **Terminal → New Terminal** öffnen und ausführen:

```sh
npm install
npm run dev
```

Dann **http://localhost:5173** öffnen.

`npm run dev` startet gleichzeitig Vue/Vite (Port 5173) und das Node-/Express-Backend (Port 3001). Die SQLite-Datenbank wird beim ersten Start automatisch angelegt. Kein zusätzlicher Einrichtungsbefehl nötig.

Zum Stoppen **Strg+C**. Bei späteren Starts genügt `npm run dev`. Dateien speichern aktualisiert die Vue-Oberfläche automatisch.

Bei einer PowerShell-Meldung über gesperrte Skripte in VS Code als Terminal **Command Prompt** wählen oder `npm.cmd install` / `npm.cmd run dev` verwenden.

Empfohlene VS-Code-Erweiterung: **Vue - Official**.

## Projektaufbau

| Datei/Ordner                           | Aufgabe                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/main.js`                          | Initialisiert Vue und `createPinia()`                                               |
| `src/App.vue`                          | Startseite, Hero, Ergebnisse, Ablauf und Footer                                     |
| `src/components/SiteHeader.vue`        | Navigation und mobiles Menü                                                         |
| `src/components/ServicePackages.vue`   | Paketkarten und Paketauswahl                                                        |
| `src/components/BeforeAfterSlider.vue` | Wiederverwendbarer Vorher-Nachher-Regler                                            |
| `src/components/BookingSection.vue`    | Buchungsformular und Bestätigung                                                    |
| `src/stores/services.js`               | Pinia-Store für die Leistungspakete                                                 |
| `src/stores/booking.js`                | Pinia-Store für Formular, Verfügbarkeit und Buchungsaktionen                        |
| `shared/services.js`                   | Namen, Preise und Leistungen der Pakete; gemeinsam von Frontend und Backend genutzt |
| `shared/calendar.js`                   | Gemeinsame Datumsregeln, Zeitzone Wien                                              |
| `src/assets/main.css`                  | Komplettes Design und responsive Anpassungen                                        |
| `public/`                              | Bilder und Favicon                                                                  |
| `server/app.js`                        | Express-API mit serverseitiger Validierung                                          |
| `server/database.js`                   | SQLite-Verbindung und Datenbankinitialisierung                                      |
| `server/schema.sql`                    | SQL-Tabellenstruktur                                                                |
| `data/glanzwerk.sqlite`                | Lokale Datenbank, wird automatisch erstellt                                         |
| `index.html`                           | Seitentitel und Suchmaschinenbeschreibung                                           |
| `tests/booking.test.js`                | Tests für echte API-/SQLite-Buchungen und Pinia                                     |

## So wird Pinia verwendet

Die Paketauswahl in `ServicePackages.vue` schreibt direkt in den Buchungsstore:

```js
const booking = useBookingStore();
booking.selectedService = "politur";
```

Das Formular greift auf denselben Store zu:

```html
<select v-model="booking.selectedService">
  ...
</select>
<input v-model="booking.form.name" />
```

Die Store-Actions `loadAvailability()`, `submitBooking()` und `startNewBooking()` übernehmen die API-Aufrufe. `dateError` und `canSubmit` sind berechnete Werte. Ladezustände, Fehlermeldungen und Buchungsbestätigung gehören ebenfalls zum Store.

Pinia hält den Zustand während der geöffneten Sitzung. **Buchungen werden dauerhaft serverseitig in SQLite gespeichert**, nicht in localStorage. Bei einem Neuladen wird die Verfügbarkeit erneut geladen. Ein noch nicht abgeschicktes Formular wird nicht dauerhaft gespeichert.

## Datenbank und Buchungsregeln

- Übergabe um 09:00 Uhr; maximal ein Fahrzeug pro Tag.
- Montag bis Samstag; ab morgen bis 90 Tage im Voraus.
- Frontend und Backend verwenden dieselben Datumsfunktionen in der Zeitzone `Europe/Vienna`.
- Der eindeutige Datenbankindex auf `date` verhindert doppelte Tagesbuchungen, auch bei gleichzeitigen Anfragen.
- Das Backend prüft alle Angaben und die Zustimmung zusätzlich zum Formular.
- Die öffentliche API liefert ausschließlich belegte Tage, keine Kundenlisten.
- Buchungen bleiben beim Neustart bestehen. Den Ordner `data` nicht löschen, wenn du sie behalten willst.
- Die Datenbank dieses Downloads ist neu und lokal. Vorhandene Buchungen aus der früheren Online- oder Cloudflare-Version werden nicht automatisch importiert.

Die Datenbank lässt sich beispielsweise mit DBeaver als SQLite-Datei öffnen. Für manuelle Änderungen vorher den Server stoppen. Zum Sichern den Server stoppen und den gesamten `data`-Ordner kopieren.

`server/schema.sql` legt die erste Struktur an. Änderungen an vorhandenen Tabellen brauchen später eine passende SQL-Migration; ein geändertes `CREATE TABLE IF NOT EXISTS` ändert vorhandene Spalten nicht.

## Konfiguration

Optional `.env.example` nach `.env` kopieren. Die Standardwerte funktionieren ohne diese Datei.

```dotenv
API_PORT=3001
HOST=127.0.0.1
DATABASE_PATH=./data/glanzwerk.sqlite
```

Nach Änderungen an `.env` beide Prozesse neu starten. Vite liest `API_PORT` für seine API-Weiterleitung. Das Projekt ist standardmäßig nur auf deinem Rechner erreichbar.

## Prüfen und Produktions-Build

```sh
npm test
npm run build
npm start
```

Nach dem Build stellt das Backend die fertige Vue-Seite und die API gemeinsam unter **http://localhost:3001** bereit. Zuvor den laufenden Entwicklungsserver mit Strg+C stoppen, sonst ist Port 3001 belegt.

Für eine reproduzierbare Neuinstallation kann statt `npm install` auch `npm ci` mit der mitgelieferten `package-lock.json` verwendet werden.

Die Tests nutzen temporäre Datenbanken und ändern keine eigenen Buchungen. Geprüft werden Speicherung, gleichzeitige Buchungen, Eingabeprüfung, Origin-Prüfung, Pinia-Paketauswahl und Erhalt der Eingaben bei Netzwerkfehlern.

## Weiterbearbeiten

- Texte: `src/App.vue` und die einzelnen Komponenten.
- Preise/Leistungen: `shared/services.js`.
- Farben: CSS-Variablen in `src/assets/main.css` unter `:root`.
- Fotos: Dateien in `public/` ersetzen. Vorher/Nachher möglichst mit gleicher Perspektive aufnehmen.
- Terminregeln: `shared/calendar.js` und `server/app.js`; die Texte in der Buchung entsprechend anpassen.

Die früher veröffentlichte Website wird durch lokale Änderungen nicht verändert. Diese Version ist für die lokale Weiterentwicklung vorbereitet; eine Veröffentlichung braucht einen Node-Server mit dauerhaftem Datenspeicher. Sie lässt sich nicht einfach als reine HTML-Datei hochladen, weil die Terminbuchung das Backend benötigt.

## Noch vor dem Kundenstart ergänzen

Firmenname, Adresse, Kontaktangaben, tatsächliche Preise und Öffnungszeiten sowie Impressum und Datenschutz. E-Mail-Bestätigungen, Online-Zahlung und ein Verwaltungs-Dashboard sind noch nicht eingebaut. Die Bestätigung erfolgt derzeit auf der Website.

Die Fotos sind gekennzeichnete Platzhalter fremder Arbeiten. Vor dem öffentlichen Einsatz durch eigene oder passend lizenzierte Fotos ersetzen:

- Hero: https://herrenfahrt.com/pages/detailing-studio-ubersicht
- Innenraum: https://www.imperadetailing.com.au/pre-sale-car-detailing-brisbane
- Konsole/Teppich: https://www.reflectiondetailingco.com/interior-detail

Bei einer `ExperimentalWarning` zu `node:sqlite`: Die lokale SQLite-Anbindung kann je nach Node-Version noch so gekennzeichnet sein. Das ist keine Fehlermeldung.
