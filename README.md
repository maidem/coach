# Trainerbelegungsplan

Minimalistischer Monatsbelegungsplan für Trainer mit Self-Service-Check-in. Admins verwalten Pläne, Slots, Trainer und Gruppen — Trainer checken sich selbst per PIN ein.

## Tech-Stack

| Bereich            | Technologie                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| Frontend & Backend | Nuxt 4 (Vue 3 + Nitro)                                                        |
| Datenbank          | SQLite via `better-sqlite3` (WAL-Modus, FK-Constraints)                       |
| Styles             | Tailwind CSS v4 (Lime-Akzente, minimalistisch)                                |
| Auth               | Signierte Session-Cookies (HMAC-SHA256) + bcryptjs für PINs                   |
| Container          | Multi-Stage Dockerfile, Image in GHCR (`ghcr.io/maidem/trainerbelegungsplan`) |
| CI/CD              | GitHub Actions → Build + Push GHCR → SSH-Deploy auf Mittwald                  |

---

## Funktionen

### Admin-Bereich (Login erforderlich)

- **Trainer verwalten** — Name, Anzeigefarbe (Hex) und 4–8-stellige PIN pro Trainer; PINs werden nie im Klartext gespeichert
- **Gruppen verwalten** — Gruppen anlegen und mehrere Trainer zuweisen (many-to-many)
- **Monatspläne anlegen** — Ein Plan pro Kalendermonat (Jahr + Monat eindeutig)
- **Slots erstellen & bearbeiten** — Datum, Start-/Endzeit, Gruppe, ein oder mehrere Trainer, optionale Notiz
- **Check-in zurücksetzen** — Admin kann Check-in jedes Trainers rückgängig machen

### Öffentlicher Bereich (kein Login)

- **Pläne ansehen** — Kalenderansicht aller Slots eines Monats
- **Self-Service-Check-in** — Trainer wählt sich selbst aus und gibt PIN ein; pro Trainer wird der individuelle Check-in-Zeitstempel gespeichert
- **Check-in rückgängig machen** — Trainer kann eigenen Check-in mit PIN selbst widerrufen (rate-limited)

### Multi-Trainer-Slots

Ein Slot kann mehreren Trainern zugewiesen werden. Jeder Trainer hat seinen eigenen Check-in-Status. In der UI werden alle Trainer des Slots mit Farbmarkierung und Haken-Badge angezeigt.

---

## Datenmodell

```
plans          — Monatspläne (year, month, title)
  └── slots    — Einzeltermine (date, start_time, end_time, group_id, note)
        └── slot_trainers  — Trainer-Zuweisung + individueller checked_in_at

trainers       — Name, color, pin_hash
groups         — Name, description
  └── group_trainers  — many-to-many Trainer-Zuweisung
```

---

## Lokal entwickeln

**Voraussetzungen:** Node 22 (empfohlen via [Volta](https://volta.sh/)), npm

```bash
npm install
cp .env.example .env
# Passwörter setzen:
echo "ADMIN_PASSWORD=$(openssl rand -base64 18)" >> .env
echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
npm run dev
```

App läuft unter http://localhost:3000.

> **Hinweis zu `better-sqlite3`:** Bei Node-Versionswechsel kann das native Modul inkompatibel werden.
> Fix: `volta run --node 22 npm rebuild better-sqlite3`

---

## Umgebungsvariablen

| Variable         | Standard        | Beschreibung                                                                                |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------- |
| `DATABASE_PATH`  | `./data/app.db` | Pfad zur SQLite-Datei                                                                       |
| `ADMIN_PASSWORD` | _(leer)_        | Admin-Login-Passwort. Ohne diesen Wert sind alle Admin-Endpunkte deaktiviert (503).         |
| `SESSION_SECRET` | _(leer)_        | HMAC-Geheimnis für Session-Cookies. Ohne diesen Wert sind alle Admin-Endpunkte deaktiviert. |
| `NODE_ENV`       | _(ungesetzt)_   | `production` in Docker — aktiviert Secure-Flag am Cookie                                    |
| `NITRO_PORT`     | `3000`          | Server-Port                                                                                 |
| `NITRO_HOST`     | `0.0.0.0`       | Bind-Adresse (Docker)                                                                       |

---

## Sicherheit

Das Repo kann öffentlich sein. Alle sensiblen Daten liegen ausschließlich in Env-Vars.

- **Admin-Auth:** Cookie `tbp_admin`, HMAC-SHA256-signiert, 12 h TTL, `httpOnly + sameSite=lax + secure` (Produktion)
- **PINs:** Bcryptjs Cost 10, nie im Klartext gespeichert oder übertragen
- **Rate-Limiting** (IP-basiert, In-Memory):
  - Login: 8 Anfragen/Min
  - Check-in / Undo: 10 Anfragen/Min
  - Antwort 429 mit `Retry-After`-Header
- **Schreibende Endpunkte** (CRUD Trainer/Gruppen/Pläne/Slots) erfordern Admin-Session
- **Check-in-Validierung:** Trainer muss dem Slot zugewiesen sein; andernfalls wird er beim Check-in automatisch hinzugefügt

---

## Docker (lokal)

```bash
docker build -t trainerbelegungsplan .
docker run --rm -p 3000:3000 \
  -e ADMIN_PASSWORD=changeme \
  -e SESSION_SECRET=$(openssl rand -hex 32) \
  -v $(pwd)/data:/data \
  trainerbelegungsplan
```

---

## Deployment auf Mittwald

**Einmalige Server-Einrichtung:**

1. `docker-compose.yml` aus diesem Repo auf den Server kopieren
2. `.env`-Datei im selben Verzeichnis anlegen:

```bash
cat > .env <<EOF
ADMIN_PASSWORD=$(openssl rand -base64 18)
SESSION_SECRET=$(openssl rand -hex 32)
EOF
```

3. GHCR-Login und Start:

```bash
echo "<GHCR_TOKEN>" | docker login ghcr.io -u maidem --password-stdin
docker compose pull && docker compose up -d
```

**GitHub Secrets für automatisches Deployment** (`Settings → Secrets and variables → Actions`):

| Secret              | Beschreibung                      |
| ------------------- | --------------------------------- |
| `MITTWALD_SSH_HOST` | Hostname/IP des Mittwald-Servers  |
| `MITTWALD_SSH_USER` | SSH-Benutzer                      |
| `MITTWALD_SSH_KEY`  | Privater SSH-Key (PEM)            |
| `MITTWALD_SSH_PORT` | Optional, Standard: 22            |
| `MITTWALD_APP_DIR`  | z. B. `/opt/trainerbelegungsplan` |

Bei jedem Push auf `main` baut die Pipeline das Image, pusht es nach `ghcr.io/maidem/trainerbelegungsplan:latest` und deployt via SSH (`docker compose pull && docker compose up -d`).

---

## API-Übersicht

| Methode  | Pfad                                     | Zugriff          | Beschreibung                             |
| -------- | ---------------------------------------- | ---------------- | ---------------------------------------- |
| `POST`   | `/api/auth/login`                        | Öffentlich       | Admin-Login (rate-limited)               |
| `POST`   | `/api/auth/logout`                       | Admin            | Session beenden                          |
| `GET`    | `/api/auth/me`                           | Öffentlich       | Auth-Status abfragen                     |
| `GET`    | `/api/trainers`                          | Öffentlich       | Alle Trainer auflisten                   |
| `POST`   | `/api/trainers`                          | Admin            | Trainer erstellen                        |
| `PATCH`  | `/api/trainers/[id]`                     | Admin            | Trainer bearbeiten                       |
| `DELETE` | `/api/trainers/[id]`                     | Admin            | Trainer löschen                          |
| `GET`    | `/api/groups`                            | Öffentlich       | Gruppen mit Trainern                     |
| `POST`   | `/api/groups`                            | Admin            | Gruppe erstellen                         |
| `PATCH`  | `/api/groups/[id]`                       | Admin            | Gruppe + Trainer-Zuweisung bearbeiten    |
| `DELETE` | `/api/groups/[id]`                       | Admin            | Gruppe löschen                           |
| `GET`    | `/api/plans`                             | Öffentlich       | Pläne mit Slot-Zählern                   |
| `POST`   | `/api/plans`                             | Admin            | Plan erstellen                           |
| `GET`    | `/api/plans/[id]`                        | Öffentlich       | Plan mit allen Slots und Check-in-Status |
| `DELETE` | `/api/plans/[id]`                        | Admin            | Plan löschen                             |
| `POST`   | `/api/plans/[id]/slots`                  | Admin            | Slot erstellen (inkl. `trainer_ids[]`)   |
| `PATCH`  | `/api/plans/[id]/slots/[slotId]`         | Admin            | Slot bearbeiten                          |
| `DELETE` | `/api/plans/[id]/slots/[slotId]`         | Admin            | Slot löschen                             |
| `POST`   | `/api/plans/[id]/slots/[slotId]/checkin` | Öffentlich       | Trainer-Check-in per PIN (rate-limited)  |
| `DELETE` | `/api/plans/[id]/slots/[slotId]/checkin` | Öffentlich/Admin | Check-in widerrufen                      |
