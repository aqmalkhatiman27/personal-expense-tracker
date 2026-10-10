# Personal Expense Tracker

A personal, single-currency expense tracker built for the Adnexio Software Engineering Conversion Bootcamp #13 final assignment.

**Stack:** Laravel 13 + SQLite + Sanctum personal access tokens (backend), React 19 + Vite 8 (frontend).

## Features

- Sign in and sign out using Sanctum bearer tokens; `/expenses` and `/categories` are protected.
- List, create, view (through the edit form), update and delete **your own** expenses.
- Expense fields: description, amount, date, category, payment method and optional note.
- List, create and delete **your own** categories. Categories in use cannot be deleted (HTTP 409).
- Select from four shared seeded payment methods: Cash, Debit Card, E-Wallet and Online Transfer.
- Form Request validation and JSON validation messages.
- Two separate demo accounts to demonstrate ownership restrictions.

The UI shows Malaysian ringgit (MYR). Budgets, income, charts, attachments, exports and recurring expenses are outside the assignment MVP scope.

## Requirements

- PHP 8.3+ with SQLite extensions; Composer
- Node.js version compatible with the installed Vite 8 version, and npm
- Two free terminal windows

## First-time setup on a **new clone / empty database**

From the repository root:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
```

**Warning:** The root `DatabaseSeeder` creates fixed demonstration user accounts. **Do not rerun `php artisan db:seed` or `php artisan migrate:fresh --seed` against an existing populated database.** The latter destroys existing data. For a current working project, keep the existing `.env` and SQLite database; do not reset anything.

In terminal 1, from `backend/`:

```bash
php artisan serve
```

In terminal 2, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** (or the URL Vite prints). The Vite dev server proxies `/api` requests to Laravel at `http://127.0.0.1:8000`. Keep both terminals running. You don't need to change CORS settings or install a React routing package for this local setup.

### Demo credentials (development only)

| Account | Email | Password |
|---|---|---|
| Demo User | `demo@example.com` | `password` |
| Second Demo User | `second@example.com` | `password` |

These accounts and credentials are **for local demonstration only**. Never expose this application and these credentials on a public production server.

## Existing local project: how to run without losing data

If you've already seeded and tested the backend, **skip migrations, seeding, `key:generate` and `.env` setup**. In separate terminals, simply run `php artisan serve` from `backend/` and `npm run dev` from `frontend/` (run `npm install` once if dependencies aren't installed). Your seeded categories, payment methods and expenses remain intact.

## Routes

### React pages

| URL | Purpose |
|---|---|
| `/login` | Sign in (no registration) |
| `/expenses` | List and delete personal expenses |
| `/expenses/new` | Create an expense |
| `/expenses/:id/edit` | View and update an expense |
| `/categories` | List, create and delete categories |

### Laravel REST API

All routes except `POST /api/login` require `Authorization: Bearer <token>`.

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/login` | Issue personal access token |
| GET | `/api/me` | Current user |
| POST | `/api/logout` | Revoke current token (204) |
| GET | `/api/expenses` | List own expenses |
| POST | `/api/expenses` | Create own expense (201) |
| GET | `/api/expenses/{expense}` | Show owned expense |
| PUT | `/api/expenses/{expense}` | Update owned expense |
| DELETE | `/api/expenses/{expense}` | Delete owned expense (204) |
| GET | `/api/categories` | List own categories |
| POST | `/api/categories` | Create own category (201) |
| DELETE | `/api/categories/{category}` | Delete unused owned category (204 or 409) |
| GET | `/api/payment-methods` | List shared methods |

API collection/read responses use a `data` property. Validation errors use Laravel's normal 422 JSON format. Attempts to access another user's expense or category return 404. Category names are unique per user. Expense `user_id` and category `user_id` are assigned by the server, not by the client.

## Testing and code quality

From `backend/`:

```bash
php artisan test
./vendor/bin/pint --test
```

From `frontend/`:

```bash
npm run lint
npm run build
```

The added Laravel feature tests use the in-memory SQLite test database specified in `backend/phpunit.xml` and cover authentication, expense CRUD, validation/ownership, category rules and payment-method listing. Manual browser testing is still necessary for the React integration.

## Suggested demonstration (3–5 minutes)

1. Log in as Demo User. Explain that Sanctum protects the API and user-specific records.
2. Open Expenses and show existing seeded expenses.
3. Create an expense, edit it, then delete it through the UI.
4. Open Categories; create a category, and show the 409 message when attempting to delete a category used by an expense.
5. Log out, then log in as Second Demo User to show that the expense lists are different.

## Architecture and implementation choices

- Eloquent relationships enforce ownership in the existing expense controller; Form Requests validate amounts, dates and category ownership.
- `CategoryController` uses the authenticated user's relationship for all operations. The `expenses()->exists()` check prevents deletion of a referenced category.
- `PaymentMethodController` provides read-only shared reference data.
- React's `ExpenseForm` is reused for create and edit; components are split into `components/`, `pages/` and `lib/`.
- React uses `useState` and `useEffect` for API requests with loading/error states. A small History API router supports the required five URLs **without adding a dependency** such as React Router.
- Authentication tokens are held in `sessionStorage` for this local development MVP; logout revokes the token on Laravel. **Production applications should review cookie-based auth and XSS hardening instead of copying this storage choice automatically.**
- The Vite `/api` proxy is a **development-only** setup; deploying the built frontend to a different server requires a corresponding reverse proxy or API URL configuration.

### Learning follow-up (after the presentation)

Without looking at the code, explain why `$request->user()->expenses()->findOrFail($id)` returns 404 for another user's record, why `StoreExpenseRequest` checks category ownership, and why `logout()` deletes only the current Sanctum token. Then adapt the expense listing to sort by date without changing ownership scoping. An alternative frontend routing approach is React Router, but it adds a package and is unnecessary for this bounded five-page MVP.
