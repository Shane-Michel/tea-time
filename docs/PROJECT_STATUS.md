# Tea Time · Project Review & Next Steps

_Last updated: 2025-11-19_

## 1. Current Snapshot

### Frontend
- **Stack**: React 19 on Vite (`src/main.jsx`) rendering a single `App` component.
- **UI**: `src/App.jsx` is a static, marketing-style landing page that highlights planned studies, features, and a CTA, with all copy and data hard-coded.
- **Styling**: Global styles live in `src/App.css`; `src/index.css` is empty. There is no component library, theme system, or responsive layout utilities beyond manual CSS rules.
- **Routing & State**: No React Router, global state, or data fetching. Buttons/links do not navigate anywhere.

### Backend
- The README references a PHP + SQLite API, user accounts, search, and SEO helpers, but there is no `/api` directory or backend code in the repository yet.

### Data & Content
- Studies, feature blurbs, and topics are represented as static arrays in `App.jsx`. There are no schemas or JSON files for studies, readings, or devotional content.

### Tooling & Quality
- ESLint is configured but there are no formatters, tests, or Storybook/docs. There is no CI configuration or deployment script.

## 2. Gaps vs. Product Vision
1. **Missing application shell** – There is no authenticated area, navigation, or study reader experience beyond the hero section described in `App.jsx`.
2. **No persistence or accounts** – User registration/login, study progress, notes, and bookmarks (all promised in the README) are absent.
3. **Bible/search functionality** – No NIV text storage, search indexes, or topical library implementation exists.
4. **Backend/API layer** – No PHP routes, SQLite schema, or migration scripts to store users, studies, or notes.
5. **SEO & deployment** – `index.html` lacks the meta/OG tags noted in the README, and there is no deployment automation for the target host.

## 3. Recommended Next Steps

### Phase 1 · Frontend Foundations
- Introduce React Router with routes for Home, Studies, Reader, Notes, Account, and Admin (if needed).
- Establish a shared layout (navigation, footer) and move button/card styles into reusable components.
- Configure global typography/theme tokens (e.g., CSS variables or Tailwind) so the devotional brand can be reused consistently.

### Phase 2 · Study & Reading Experience
- Define data models for studies, days, readings, prompts, and reflection questions.
- Create JSON or Markdown seeds that power the Matthew, Esther, and Fasting plans, and build components to render multi-day journeys with progress indicators.
- Add ability to track completion state locally (context + localStorage) as a placeholder until the backend lands.

### Phase 3 · Accounts & Persistence
- Scaffold the PHP backend with SQLite migrations for users, study_progress, notes, bookmarks, and bible tables (as outlined in the README).
- Implement REST endpoints for auth, study data, progress updates, notes CRUD, and bookmarks.
- On the frontend, replace temporary local state with authenticated API calls and introduce secure session management.

### Phase 4 · Bible & Search Utilities
- Import the NIV text into SQLite, add full-text search indexes, and expose endpoints for verse lookup and topic searches.
- Build UI components for search, verse detail, and topical browsing, including filters mentioned in the hero copy.

### Phase 5 · Polish, SEO, and Deployment
- Add meta tags, OG data, and sitemap generation matching the planned deployment domain.
- Write automated tests (unit + integration) for both frontend and backend flows.
- Set up CI (GitHub Actions) to run lint/build/test and configure deployment scripts for the PHP hosting environment.

## 4. Suggested Supporting Docs/Artifacts
- Technical architecture diagram (frontend routes, backend services, data flow).
- Content authoring guide for adding new studies and topics.
- Runbook for deploying updates to tea-time.shanemichel.net.

Documenting these steps now makes it easier for contributors to focus on the highest-impact work: building the actual study experience, persistence, and spiritual tools that the README already promises.
