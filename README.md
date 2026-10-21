# Independent Minds Initiative

> **"Teach people how to think, not what to think."**  
> *Think independently. Question fearlessly. Learn continuously. Lead meaningfully.*

A scalable, modern web platform for the **Independent Minds Initiative**, built with **TypeScript**, **Next.js (App Router)**, and **Tailwind CSS**. It replicates the exact custom design system, background, typography, and interactive components from the initiative's visual identity, while adding an enterprise-grade, JWT-secured Admin Portal, dynamic topic filtering, media management, 30-day automatic article expiration, and community application forwarding to `independentmindsinitiative@gmail.com`.

---

## ✦ Core Features

### 1. High-Fidelity Design System
- **Exact Colors & Theme**: Deep Navy (`#071727`), Navy2 (`#0c2033`), Panel (`#10283d`), Cream (`#f4eddf`), Muted Text (`#b4c0c8`), and Accent Gold (`#d9bd78`).
- **Typography**: Georgia serif headings with refined Arial/sans-serif body copy.
- **Orbital Graphics & Animations**: Dynamic rotating dashed orbits with center core and smooth hover lift animations on cards and interactive buttons.
- **Mobile Responsive Drawer**: Mobile hamburger menu with smooth transitions and backdrop blur navigation header.

### 2. Dynamic Insights & Knowledge Engine
- **11 Topic Filters**: Geopolitics, Society, Economics, Business, History, Science & Technology, Climate & Environment, Politics & Governance, Philosophy & Ideas, Culture & Media, and Psychology & Personal Growth.
- **Dynamic Content Delivery**: Connects to the backend REST API (`/api/articles`) to deliver live articles.
- **Seeded Foundation**: Pre-seeded with the 11 original foundational topics.

### 3. Automated 30-Day Article Expiration Engine
- **30-Day Lifecycle Timeout**: Every article published through the portal is assigned an automatic 30-day expiration date (`createdAt + 30 days`).
- **Automatic Purging**: Expired articles are automatically purged on query so stale content never lingers on the public site.
- **Admin Expiration Dashboard**: Displays live countdowns (`29d 22h remaining`), a **"+30 Days Renewal"** button to extend lifecycle on demand, and an instant deletion action.

### 4. JWT-Secured Admin Control Portal (`/admin`)
- **Authentication**: Cryptographically signed JSON Web Tokens (JWT) stored in HTTP-only cookies (`imi_admin_token`) and supported via Bearer header.
- **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Default Administrative Credentials**:
  - **Username**: `admin`
  - **Password**: `AdminPassword!2026#`
- **Protected Actions**: Only authenticated administrators can upload media, share links, publish articles, extend expiration, or view community applications.

### 5. Multi-Layer Sliding Window Rate Limiting
- **Login Defense**: Maximum 5 login attempts per 15-minute sliding window per IP. Exceeding triggers HTTP 429 with `Retry-After`.
- **Media Upload Limiter**: Maximum 30 uploads/links per 15 minutes.
- **Community Form Anti-Spam**: Maximum 5 join submissions per 10 minutes per IP.

### 6. Media & Link Management (Multer + ImageKit CDN)
- **Multer Single Media Upload**: Configured with memory storage and a 25MB limit per upload, strictly enforcing single media parsing.
- **ImageKit CDN Integration**: Uploaded media streams directly to ImageKit's global CDN with automatic optimization and real-time delivery.
- **ImageKit Asset Deletion**: Deleting media removes the asset from both the database and ImageKit via `imagekit.deleteFile`.
- **External Link Registry**: Register and categorize YouTube videos, Google Drive resources, or research links.
- **One-Click URL Copy & Delete**: Copy media URLs directly to clipboard or delete records and files instantly.

### 7. Community Applications & Email Dispatch
- **Target Recipient**: All applications submitted on the homepage are routed to **`independentmindsinitiative@gmail.com`**.
- **Admin Inbox**: Every registration is persisted in the database so submissions are never dropped, with applicant name, email, city, role interest, motivation, and timestamp.
- **Direct Reply Action**: One-click button in the admin inbox to draft a reply to the applicant.
- **Nodemailer Integration**: Supports Gmail SMTP (or any standard SMTP provider like SendGrid/Resend) with an administrative test button to verify delivery.

---

## ✦ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+ or higher

### Installation

1. Navigate to the project directory:
   ```bash
   cd independent-minds-initiative
   ```

2. Dependencies are already installed. If needed, install via:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local` (pre-configured with defaults):
   ```env
   PORT=3000
   JWT_SECRET=imi_super_secret_jwt_key_2026_independent_minds_initiative
   ADMIN_DEFAULT_USERNAME=admin
   ADMIN_DEFAULT_PASSWORD=AdminPassword!2026#

   # ImageKit Media Storage (Multer + ImageKit single upload)
   IMAGEKIT_PUBLIC_KEY=your_public_key
   IMAGEKIT_PRIVATE_KEY=your_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

   # SMTP Configuration (optional for live Gmail sending)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=independentmindsinitiative@gmail.com
   SMTP_PASS=your-google-app-password
   SMTP_FROM="Independent Minds Initiative" <independentmindsinitiative@gmail.com>
   ```

### Running the Application

- **Production Mode (Recommended for testing production features)**:
  ```bash
  npm run build
  npm run start
  ```

- **Development Mode**:
  ```bash
  npm run dev
  ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the website.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the Admin Portal.

---

## ✦ Setting up Gmail SMTP for Live Email Notifications

To enable real-time email dispatch to `independentmindsinitiative@gmail.com`:

1. Sign in to your Google Account at [myaccount.google.com](https://myaccount.google.com).
2. Go to **Security** > **2-Step Verification** (must be enabled).
3. At the bottom, click **App passwords**.
4. Generate a new password (e.g., name it `Independent Minds Portal`).
5. Copy the 16-character code and paste it into `.env.local`:
   ```env
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```
6. In `/admin` > **Settings & Email Engine**, click **"Send Test Verification Email"** to confirm delivery.

---

## ✦ API Reference Summary

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/articles` | `GET` | Public | Returns active non-expired articles (filtered by `?category=...`) |
| `/api/articles` | `POST` | Admin JWT | Publishes article with 30-day auto-expiration |
| `/api/articles/[id]` | `DELETE` | Admin JWT | Deletes article immediately |
| `/api/articles/[id]` | `PATCH` | Admin JWT | Extends article expiration by +30 days |
| `/api/media` | `GET` | Public | Retrieves stored media and links |
| `/api/media` | `POST` | Admin JWT | Uploads file (multipart) or saves link (JSON) |
| `/api/media/[id]` | `DELETE` | Admin JWT | Deletes media item and physical file |
| `/api/join` | `POST` | Public (Rate Limited) | Registers interest & dispatches email to `independentmindsinitiative@gmail.com` |
| `/api/admin/applications` | `GET` | Admin JWT | Lists all community submissions |
| `/api/auth/login` | `POST` | Public (Rate Limited) | Authenticates admin & sets JWT cookie |
| `/api/auth/logout` | `POST` | Admin JWT | Clears session cookie |
| `/api/auth/me` | `GET` | Admin JWT | Verifies current admin session |
