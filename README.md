# MediMind

MediMind is a medicine reminder frontend for elderly patients and their care
partners. It is built with React Native and Expo, and runs in the browser
through `react-native-web` for easy demonstrations.

The frontend is designed to connect to the MediMind backend described in
`attached_assets/api-contract_1788295708183.md`. It expects the backend to
provide the documented `/api` routes and response envelopes.

## Phase 4 Frontend Setup

Phase 4 delivers the patient-facing application experience:

- Expo React Native project setup
- Browser support through `react-native-web`
- React Navigation screen and tab navigation
- Zustand authentication state management
- Secure JWT persistence on native platforms
- Browser-safe token persistence for web demos
- Contract-driven API client
- Loading, empty, error, retry, and refresh states
- Large, high-contrast controls for accessibility and ease of use

## Overview

After signing in, a patient can see the medicines scheduled for the current
day, mark doses as taken or skipped, manage their medicines, update reminder
times, review adherence progress, edit their profile, and contact trusted
people during an emergency.

The frontend does not include a backend server or local mock API. All
authentication, medicine data, reminders, adherence records, profile data,
emergency contacts, and SOS events are loaded from the configured backend.
This keeps the frontend behavior aligned with the API contract.

## Tech Stack

- **React Native** — shared mobile UI primitives
- **Expo** — application runtime and web bundling
- **React Native Web** — browser rendering
- **React Navigation**
  - Native stack navigation for auth and secondary screens
  - Bottom tabs for the main patient experience
- **Zustand** — lightweight global authentication state
- **Expo Secure Store** — native JWT persistence
- **Browser localStorage** — web-only token persistence fallback
- **TypeScript** — static type checking
- **Ionicons via Expo Vector Icons** — accessible visual navigation cues

## Features

### Authentication

- Splash screen checks for an existing token with `GET /api/auth/me`
- Login with email and password
- Registration with full name, email, and password
- Friendly client-side validation messages
- JWT stored after successful login or registration
- Sign out clears the stored token and returns to login

Authenticated requests include:

```http
Authorization: Bearer <token>
```

### Home Dashboard

- Loads today’s schedule from `GET /api/reminders/today`
- Displays medicine name, dosage, time, and status
- Supports `Taken` and `Skip` actions
- Sends dose updates to:

```http
POST /api/adherence/:reminder_id/mark
```

- Pull-to-refresh support
- Empty state for days with no scheduled doses

### Medicine List

- Loads medicines from `GET /api/medicines`
- Supports server-side search using `?search=`
- Displays dosage, frequency, and instructions
- Provides an entry point to add a medicine
- Pull-to-refresh support

### Add Medicine

The form submits the exact fields expected by the contract:

- `name`
- `dosage`
- `form`
- `frequency_per_day`
- `start_date`
- `instructions`
- `reminder_times`
- `days_of_week`

The request is sent to:

```http
POST /api/medicines
```

Reminder times are validated in `HH:MM` 24-hour format before submission.

### Reminder Settings

- Loads the user’s reminders from `GET /api/reminders`
- Enables or disables individual reminders
- Changes reminder times with `PUT /api/reminders/:id`
- Validates updated times before sending them

### Profile and Adherence

- Loads profile data from `GET /api/profile`
- Updates supported profile fields with `PUT /api/profile`
- Loads adherence metrics from `GET /api/adherence/stats`
- Displays adherence rate, taken doses, and current streak
- Supports editing:
  - Full name
  - Phone number
  - Date of birth

### Emergency SOS

- Loads emergency contacts from `GET /api/emergency-contacts`
- Sends an SOS event to `POST /api/sos`
- Shows the contacts returned by the backend after an SOS request
- Provides large `Call now` actions using the device phone handler
- Includes clear empty and retryable error states

## Environment Variables

Create a local `.env` file in the project root, or configure the variable in
your Replit environment:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url
```

`EXPO_PUBLIC_API_URL` should be the backend root URL. The frontend appends the
contract paths itself, including `/api`. For example, if the backend root is
`https://api.example.com`, requests are made to:

```text
https://api.example.com/api/auth/login
https://api.example.com/api/reminders/today
```

Do not commit `.env` or `.env.local` files. A safe template is available in
`.env.example`.

If `EXPO_PUBLIC_API_URL` is missing, the app still renders the frontend, but
API-backed actions show a clear configuration error instead of silently using
fake data.

## Getting Started

### Prerequisites

- Node.js with npm
- A running MediMind backend
- The backend URL available for `EXPO_PUBLIC_API_URL`

### Install dependencies

```bash
npm install
```

### Configure the backend URL

```bash
cp .env.example .env
```

Then replace the placeholder value in `.env`:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url
```

Restart the Expo process after changing environment variables.

### Run the browser demo

```bash
npm run dev
```

The project starts Expo web on port `5000` and binds to all hosts needed for
the Replit preview.

The equivalent web script is:

```bash
npm run web
```

### Type-check the project

```bash
npm run typecheck
```

### Build for hosting

The frontend is exported as a static web application:

```bash
npm run build
```

The generated files are written to `dist/`. Any static hosting provider can
serve that directory, including Vercel, Netlify, Cloudflare Pages, or an
Nginx/Apache web server.

#### Vercel

This repository includes `vercel.json`, which tells Vercel to:

1. Run `npm run build`
2. Publish the generated `dist/` directory

When importing the GitHub repository into Vercel, add this project environment
variable in the Vercel project settings before deploying:

```text
EXPO_PUBLIC_API_URL=https://your-backend-url
```

The variable is embedded into the browser bundle during the build, so a new
deployment is required after changing it.

The repository intentionally does not commit a generated npm lockfile. The
previous lockfile contained Replit-internal package-firewall URLs that are not
reachable from Vercel or other external CI/build systems. Without that
platform-specific lockfile, npm resolves the dependencies from the public
registry during deployment.

## Navigation

The application is organized into authenticated and unauthenticated flows.

### Unauthenticated flow

- Splash
- Login
- Register

### Authenticated flow

Bottom tabs:

- Today
- Medicines
- SOS
- Profile

Stack screens available from the authenticated area:

- Add Medicine
- Reminder Settings

## API Integration

The API client lives in `src/api.ts`. It:

1. Reads the base URL from `EXPO_PUBLIC_API_URL`
2. Sends JSON request bodies
3. Adds the bearer token to authenticated requests
4. Parses the documented `{ data: ... }` success envelope
5. Parses the documented `{ error: { code, message } }` failure envelope
6. Converts network and API failures into user-friendly errors

Implemented contract routes include:

| Area | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Today | `GET /api/reminders/today` |
| Medicines | `GET /api/medicines`, `POST /api/medicines`, `GET /api/medicines/:id` |
| Reminders | `GET /api/reminders`, `PUT /api/reminders/:id` |
| Adherence | `POST /api/adherence/:reminder_id/mark`, `GET /api/adherence/stats` |
| Profile | `GET /api/profile`, `PUT /api/profile` |
| Emergency | `GET /api/emergency-contacts`, `POST /api/sos` |

The frontend only sends fields defined by the API contract. Family member
features and other P2 routes are not included in this Phase 4 frontend.

## Project Structure

```text
.
├── App.tsx                 # Navigation and application screens
├── src/
│   ├── api.ts              # Contract-based API client
│   ├── components.tsx      # Shared buttons, fields, states, and UI pieces
│   ├── storage.ts          # SecureStore/native and localStorage/web persistence
│   ├── store.ts            # Zustand authentication store
│   ├── theme.ts            # Colors, typography, radii, and shared styles
│   └── types.ts            # API response and domain types
├── app.json                # Expo project configuration
├── babel.config.js         # Expo Babel configuration
├── package.json            # Scripts and dependencies
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment variable template
└── attached_assets/
    └── api-contract_*.md   # Backend API contract
```

## Accessibility and UX Notes

The interface is intentionally optimized for older adults:

- Large text and touch targets
- Strong contrast between text, controls, and background
- Short, plain-language labels
- Clear visual states for pending, taken, skipped, and missed doses
- Friendly validation and error messages
- Retry actions for failed requests
- Pull-to-refresh on data lists
- Confirmation feedback after profile updates and SOS events
- No dependency on color alone to communicate medicine status

## Backend Expectations

For the complete experience, the backend should follow the attached API
contract, including:

- `{ data: ... }` success envelopes
- `{ error: { code, message } }` failure envelopes
- JWT authentication
- CORS permission for the frontend origin
- The documented `/api` endpoints and snake_case field names

The frontend cannot complete login or load patient data until a compatible
backend is available and configured.