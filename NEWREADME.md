# Coach Manager

Admin-Tool zur Verwaltung von Athleten, Trainingsdaten und Wettkampfvorbereitung.

## Übersicht

Das Coach Manager System ist eine spezialisierte Anwendung für die Verwaltung von:

- **Athleten** mit vollständigen Profilen
- **Gürtelgrade** und **Gewichtsklassen**
- **Gruppen** und **Wettkämpfe**
- **Reisemöglichkeiten** und **Ausstattung**

## Features

### Admin Panel

- ⚙️ Verwaltung aller Master-Daten (Gürtelgrade, Gewichtsklassen, Gruppen, etc.)
- 📋 Einfaches Interface für Add/Delete/Edit Operationen
- 📱 Vollständig mobil-optimiert

### Athletenverwaltung (Coach-Ansicht)

- 👥 Übersicht aller Athleten mit Suchfunktion
- 📝 Erstellen und Bearbeiten von Athletenprofilen
- 🏷️ Verknüpfung mit allen Master-Daten
- ✅ Tracking von:
  - Startgebühr (bezahlt / ausstehend)
  - Übernachtung (ja / nein)
  - Ausstattung (Multiple-Select)

### Dashboard

- 📊 Schnelle Statistiken
- 🔗 Navigation zu Admin und Athletenverwaltung
- 🚪 Logout Button

## Technologie Stack

- **Frontend:** Nuxt 4 + Vue 3 + TypeScript
- **Backend:** Nuxt Server API (H3)
- **Datenbank:** SQLite mit better-sqlite3
- **Styling:** Tailwind CSS 4
- **Authentifizierung:** Admin-basiert (Single Admin)

## Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Öffne http://localhost:3000 und melde dich mit dem Admin-Passwort an.

## Projekt Struktur

```
app/
  pages/
    admin/          # Admin Verwaltung
    athletes/       # Athletenverwaltung
    index.vue       # Dashboard
  components/
    admin/          # Admin-Komponenten
    athletes/       # Athlete-Komponenten

server/
  api/
    belts/          # API für Gürtelgrade
    weight-classes/ # API für Gewichtsklassen
    groups/         # API für Gruppen
    competitions/   # API für Wettkämpfe
    travel-options/ # API für Reisen
    equipment/      # API für Ausstattung
    athletes/       # API für Athleten

types/
  models.ts         # TypeScript Models
```

## API Endpoints

### Master Data

- `GET /api/belts` - Alle Gürtelgrade
- `POST /api/belts` - Neuer Gürtelgrad (Admin)
- `PATCH /api/belts/[id]` - Gürtelgrad bearbeiten (Admin)
- `DELETE /api/belts/[id]` - Gürtelgrad löschen (Admin)

Ähnliche Endpoints für:

- `/api/weight-classes`
- `/api/groups`
- `/api/competitions`
- `/api/travel-options`
- `/api/equipment`

### Athletes

- `GET /api/athletes` - Alle Athleten
- `POST /api/athletes` - Neuen Athleten erstellen (Admin)
- `GET /api/athletes/[id]` - Athletendetails
- `PATCH /api/athletes/[id]` - Athlet bearbeiten (Admin)
- `DELETE /api/athletes/[id]` - Athlet löschen (Admin)

## Mobile Optimierung

Die Anwendung ist vollständig mobile-optimiert:

- 📱 Responsive Grid Layouts
- 🎯 Touch-freundliche Buttons
- 📐 Optimierte Modals für kleine Bildschirme
- 🎨 Lesbare Typografie auf allen Geräten

## Deployment

Das Projekt ist vorbereitet für Docker-Deployment auf Mittwald:

- `Dockerfile` - Docker-Konfiguration
- `docker-compose.yml` - Compose-Konfiguration
- Deployment erfolgt nach Freigabe

## Admin-Verwaltung

Die Anwendung hat ein Admin-only System mit:

- Passwort-basierte Authentifizierung
- Admin Middleware Protection
- Session-basierte Auth

## Datenmodell

### Athlete

```typescript
- id: number
- name: string (erforderlich)
- belt_id?: number
- weight_class_id?: number
- group_id?: number
- competition_id?: number
- travel_option_id?: number
- equipment_ids?: number[] (Many-to-Many)
- entry_fee_paid: boolean
- overnight_stay: boolean
- notes?: string
- created_at: timestamp
- updated_at: timestamp
```

## Lizenz

Privat
