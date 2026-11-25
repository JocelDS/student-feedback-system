# Student Feedback System

**IT 412 Platform Technologies - Final Project: Cloud PaaS Web App & Basic API**

A full-stack web app where students submit feedback (suggestions, complaints, appreciation, general feedback) and an administrator reviews and deletes it.

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), JavaScript, HTML, CSS |
| Backend | Node.js + Express |
| Database | Supabase (managed PostgreSQL) |
| Hosting | Render (PaaS) |
| Source control | GitHub |
| API testing | Postman |

- Live frontend URL: `https://<your-frontend>.onrender.com` *(fill in after you deploy)*
- Live API URL: `https://<your-api>.onrender.com` *(fill in after you deploy)*
- GitHub repo: `https://github.com/<your-username>/student-feedback-system` *(fill in)*

> This repository has **not** been deployed yet. The URLs above are placeholders until you complete the Render steps and confirm the site opens.

---

## 1. How the project is organized

```
student-feedback-system/
├── backend/                 Express API
│   ├── src/
│   │   ├── server.js        App setup, CORS, security headers, error handling
│   │   ├── supabase.js      Supabase client (service key, server only)
│   │   ├── middleware/auth.js   Checks the admin token
│   │   └── routes/
│   │       ├── feedback.js  GET / POST / GET :id / DELETE :id
│   │       └── auth.js      Admin login
│   ├── scripts/hash-password.js
│   ├── supabase/schema.sql  Creates the feedback table
│   └── .env.example
├── frontend/                React app
│   ├── src/pages/           Home, SubmitFeedback, ViewFeedback, AdminLogin, AdminDashboard
│   ├── src/components/      Navbar, ProtectedRoute, Spinner, ConfirmModal, CategoryBadge
│   ├── src/api.js           All calls to the backend
│   └── .env.example
├── docs/                    Part 1 reflection + architecture diagram
├── render.yaml              Optional one-click Render setup
└── README.md
```

**How a request flows:** the browser loads the React app. When a student submits the form, React sends a `POST /api/feedback` request to Express. Express validates the data, saves it to Supabase using a secret key that never leaves the server, and answers with a JSON response. The React app never talks to Supabase directly.

---

## 2. Before you start

Install: **Node.js 18 or newer** (nodejs.org), **Git**, and **Postman**. Create free accounts on **Supabase**, **GitHub**, and **Render**.

---

## 3. Set up Supabase (the database)

1. In Supabase, click **New project**, give it a name, set a database password, and wait until it finishes creating.
2. Open **SQL Editor** > **New query**. Copy everything from `backend/supabase/schema.sql`, paste it, and click **Run**. This creates the `feedback` table (`id`, `student_name`, `category`, `message`, `created_at`) and turns on Row Level Security with no public policies, so nobody can touch the data except your backend.
3. Open **Project Settings** > **API** (or **API Keys**). Copy two values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **service_role key** (a long secret key)

   Treat the service_role key like a password. Never put it in the frontend or on GitHub.

---

## 4. Run the backend locally

```bash
cd backend
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```

Open `backend/.env` and fill in:

| Variable | What to put |
|----------|-------------|
| `SUPABASE_URL` | Project URL from step 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from step 3 |
| `ADMIN_USERNAME` | The admin username you want, e.g. `admin` |
| `ADMIN_PASSWORD_HASH` | Run `npm run hash-password -- "YourStrongPassword"` and paste the output |
| `JWT_SECRET` | A long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_ORIGIN` | `http://localhost:5173` for local development |

Start it:

```bash
npm run dev
```

Check http://localhost:5000/health. You should see `{"status":"ok"}`.

---

## 5. Run the frontend locally

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm run dev
```

Open http://localhost:5173. Try submitting feedback, check it appears under **View Feedback**, then sign in at **Admin** with the username and the *plain* password you hashed in step 4.

---

## 6. Test the API with Postman

Create a Postman variable `baseUrl` (local: `http://localhost:5000`, later your Render API URL).

| # | Request | Body / headers | Expected |
|---|---------|----------------|----------|
| 1 | `POST {{baseUrl}}/api/feedback` | JSON: `{"student_name":"Ana Reyes","category":"Suggestion","message":"Please extend library hours."}` | **201 Created** |
| 2 | `GET {{baseUrl}}/api/feedback` | none | **200 OK**, list includes the new record |
| 3 | `GET {{baseUrl}}/api/feedback/<id from #1>` | none | **200 OK** |
| 4 | `GET {{baseUrl}}/api/feedback/22222222-2222-4222-8222-222222222222` | none | **404 Not Found** |
| 5 | `POST {{baseUrl}}/api/feedback` | `{"student_name":"","category":"x","message":"hi"}` | **400 Bad Request** with a `details` list |
| 6 | `DELETE {{baseUrl}}/api/feedback/<id>` | no token | **401 Unauthorized** |
| 7 | `POST {{baseUrl}}/api/auth/login` | `{"username":"admin","password":"YourStrongPassword"}` | **200 OK** with a `token` |
| 8 | `DELETE {{baseUrl}}/api/feedback/<id>` | header `Authorization: Bearer <token>` | **200 OK** |

Take a screenshot of each result for your submission. Status code **500** is only returned for unexpected server or database failures.

---

## 7. Push to GitHub

```bash
# from the project root
git init
git add .
git commit -m "Student Feedback System"
git branch -M main
git remote add origin https://github.com/<your-username>/student-feedback-system.git
git push -u origin main
```

Before pushing, run `git status` and confirm that no `.env` file is listed. The `.gitignore` already excludes them. The project requires a **public** repository.

---

## 8. Deploy on Render

You will deploy **two** services: the API first, then the frontend.

### 8a. Backend (Web Service)

1. Render dashboard > **New +** > **Web Service** > connect your GitHub repo.
2. Settings: **Root Directory** `backend`, **Runtime** Node, **Build Command** `npm install`, **Start Command** `npm start`, **Instance type** Free.
3. Under **Environment**, add: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, and `CLIENT_ORIGIN` (use a temporary value such as `http://localhost:5173` for now). Optionally add `NODE_VERSION` = `20`.
4. Click **Create Web Service**. When the build finishes, open `https://<your-api>.onrender.com/health` and confirm you see `{"status":"ok"}`.

### 8b. Frontend (Static Site)

1. **New +** > **Static Site** > same repo.
2. Settings: **Root Directory** `frontend`, **Build Command** `npm install && npm run build`, **Publish Directory** `dist`.
3. Environment: `VITE_API_URL` = your API URL from 8a (no trailing slash).
4. Go to **Redirects/Rewrites** and add: Source `/*`, Destination `/index.html`, Action **Rewrite**. (This makes page refreshes work for routes like `/admin`.)
5. Click **Create Static Site** and wait for the deploy.

### 8c. Connect them (do not skip)

Go back to the backend service > **Environment** and change `CLIENT_ORIGIN` to your frontend URL (for example `https://student-feedback-web.onrender.com`, no trailing slash). Save so it redeploys. Without this, the browser blocks the frontend's requests (a CORS error).

Alternative: `render.yaml` in the project root can create both services at once via **New +** > **Blueprint**. You still enter the secret values in the dashboard.

### 8d. Verify

Open the frontend URL, submit feedback, open **View Feedback**, then log in as admin and delete a record. Then check the table in Supabase (**Table Editor** > `feedback`) to confirm the data is really stored in the cloud database.

---

## 9. Troubleshooting

| Problem | Likely cause and fix |
|---------|----------------------|
| First load takes 30 to 60 seconds | Render free services sleep when idle. Open the API URL once before demoing. |
| "Cannot reach the server" in the app | `VITE_API_URL` is wrong or missing. Fix it, then redeploy the static site (it is read at build time). |
| CORS error in browser console | `CLIENT_ORIGIN` on the backend does not exactly match the frontend URL. |
| Backend exits with "Missing environment variables" | Add every variable listed in step 4 on Render. |
| Admin login always fails | The hash was generated for a different password, or was truncated when pasted. Generate it again. |
| 500 on `/api/feedback` | `SUPABASE_URL` or the service_role key is wrong, or `schema.sql` was not run. |
| Refreshing `/admin` shows "Not Found" | Add the `/*` to `/index.html` rewrite rule (step 8b.4). |

---

## 10. Security notes

- All database access goes through the Express backend. Row Level Security is enabled on `feedback` with no public policies.
- The service_role key, JWT secret, and admin password hash exist only as backend environment variables. The admin password is stored only as a bcrypt hash.
- Admin routes need a signed token that expires after 2 hours. Login attempts are rate limited.
- Inputs are validated on both the frontend and the backend. React escapes displayed text, which protects against script injection.
- Limitation: the admin token is kept in `localStorage`, which is acceptable for a school project but a production system would typically use secure HTTP-only cookies.
- `GET /api/feedback` is public by design, because the project has a public "View Feedback" page. Student names are therefore visible to everyone.

---

## 11. Rubric checklist

- [ ] **Part 1 (20):** `docs/REFLECTION.md` and `docs/architecture.svg` (export to PDF/Word if your instructor wants a document)
- [ ] **Part 2 (30):** Public GitHub repo, successful Render build log, live `.onrender.com` URL
- [ ] **Part 3 (25):** Screenshot of rows in the Supabase `feedback` table, and the same record shown in the web app
- [ ] **Part 4 (25):** Postman screenshots for the 8 tests above (200, 201, 400, 404)
