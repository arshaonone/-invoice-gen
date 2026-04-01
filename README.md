# invoice-gen.net

A professional SaaS invoice generator built with **Next.js 14**, **MongoDB**, **Tailwind CSS**, and **Framer Motion**.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Edit `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/invoice-gen   # or your MongoDB Atlas URI
NEXTAUTH_SECRET=any-random-secret-string
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
├── app/
│   ├── (dashboard)/        Dashboard layout group (auth-protected)
│   │   ├── dashboard/      Overview stats + charts
│   │   ├── invoices/       Invoice history, create, edit
│   │   ├── settings/       Account + branding settings
│   │   └── pricing/        Plan selection
│   ├── api/                API routes (invoices, auth, dashboard, user)
│   ├── login/              Sign in page
│   ├── register/           Sign up page
│   └── page.tsx            Landing page
├── components/
│   ├── invoice/            Invoice creator + 3 templates
│   ├── dashboard/          Dashboard widgets
│   ├── landing/            Landing page sections
│   ├── auth/               Login + register forms
│   ├── settings/           Settings UI
│   ├── pricing/            Pricing page
│   └── ui/                 Shared UI (Sidebar, ThemeToggle, MobileNav)
├── lib/                    mongodb, auth, utils, pdf helpers
├── models/                 Mongoose schemas (User, Invoice)
└── types/                  TypeScript type augmentations
```

---

## ✨ Features

- **Invoice Generator** — Live 2-panel editor with 3 templates (Minimal, Modern, Bold)
- **PDF Export** — html2canvas + jsPDF multi-page PDF generation
- **Print Support** — Browser print with clean invoice layout
- **Auto Calculations** — Qty × Price × Tax with discount
- **14+ Currencies** — USD, EUR, GBP, BDT, INR, and more
- **EN / Bangla** — Full multi-language invoice labels
- **Dark / Light Mode** — System preference + toggle
- **Dashboard** — Revenue charts, stats, recent invoices
- **Invoice History** — Search, filter by status, edit, delete
- **Auth** — Email/password + Google OAuth (NextAuth.js)
- **Settings** — Business profile, logo, brand color, currency defaults
- **Pricing** — Free (5/month) vs Pro (unlimited)
- **Mobile Responsive** — Sidebar collapses, drawer navigation

---

## 🔑 Optional Features Setup

### Google OAuth
1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` to redirect URIs
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

### MongoDB Atlas (Cloud)
Replace `MONGODB_URI` in `.env.local` with your Atlas connection string.

---

## 🌐 Deployment (Vercel)

```bash
# Push to GitHub, then:
vercel --prod

# Set env vars in Vercel dashboard:
# MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL (your domain), GOOGLE_* (optional)
```

---

## 📦 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | Full-stack React framework |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| MongoDB + Mongoose | Database |
| NextAuth.js | Authentication |
| jsPDF + html2canvas | PDF generation |
| Recharts | Revenue charts |
| React Hook Form | Form management |
| Lucide React | Icons |
| react-hot-toast | Notifications |
