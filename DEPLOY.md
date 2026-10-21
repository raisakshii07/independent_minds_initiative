# Render Deployment Guide: Independent Minds Initiative

This guide outlines how to deploy the **Independent Minds Initiative** platform to **[Render](https://render.com)** on the free tier with automated SSL, global CDN, and zero configuration issues.

---

## ✦ Pre-Deployment Checklist

Before deploying, make sure you have:
1. **GitHub Repository**: Push this project folder to your GitHub account.
2. **MongoDB Atlas URI**: Ensure you have created a database user and whitelisted `0.0.0.0/0` under Network Access.
3. **ImageKit Keys**: Free account at [imagekit.io](https://imagekit.io) (Public Key, Private Key, URL Endpoint).
4. **Gmail App Password**: For sending emails to `independentmindsinitiative@gmail.com`.

---

## ✦ Step 1: Push Code to GitHub

If you haven't pushed the codebase to GitHub yet, run these commands in the project folder:

```bash
cd C:\Users\jainj\.gemini\antigravity\scratch\independent-minds-initiative

git init
git add .
git commit -m "feat: complete independent minds platform with admin portal, imagekit, mongodb"

# Create a repository on github.com, then link and push:
git branch -M main
git remote add origin https://github.com/<your-username>/independent-minds-initiative.git
git push -u origin main
```

---

## ✦ Step 2: Deploy on Render

### Option A: Using Render Blueprint (Automatic via `render.yaml` - Recommended)

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** in the top-right corner and select **Blueprint**.
3. Connect your GitHub account and select the `independent-minds-initiative` repository.
4. Render will automatically detect the [`render.yaml`](./render.yaml) file and pre-configure:
   - **Service Name**: `independent-minds-initiative`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/articles`
5. You will see prompt fields for your secret environment variables. Fill in:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `IMAGEKIT_PUBLIC_KEY`: Your ImageKit Public Key.
   - `IMAGEKIT_PRIVATE_KEY`: Your ImageKit Private Key.
   - `IMAGEKIT_URL_ENDPOINT`: Your ImageKit URL Endpoint (`https://ik.imagekit.io/your_id`).
   - `ADMIN_DEFAULT_PASSWORD`: Your desired admin password (e.g. `AdminPassword!2026#`).
   - `SMTP_PASS`: Your 16-character Google App Password.
6. Click **Apply**. Render will automatically build and deploy your site!

---

### Option B: Manual Web Service Setup on Render

If you prefer setting up manually without Blueprints:

1. In Render Dashboard, click **New +** > **Web Service**.
2. Select **Build and deploy from a Git repository** and pick your repository.
3. Configure the following fields:
   - **Name**: `independent-minds-initiative`
   - **Region**: Any (e.g. `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
4. Scroll down to **Advanced** > **Health Check Path**:
   - Set to: `/api/articles`
5. In the **Environment Variables** section, add:

| Key | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production environment |
| `JWT_SECRET` | `generate-a-random-32-char-string` | Used to sign admin session tokens |
| `ADMIN_DEFAULT_USERNAME` | `admin` | Admin portal username |
| `ADMIN_DEFAULT_PASSWORD` | `YourSecurePassword2026!` | Admin portal password |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `IMAGEKIT_PUBLIC_KEY` | `public_...` | From imagekit.io developer options |
| `IMAGEKIT_PRIVATE_KEY` | `private_...` | From imagekit.io developer options |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/...` | From imagekit.io developer options |
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP Server |
| `SMTP_PORT` | `465` | SSL Port |
| `SMTP_USER` | `independentmindsinitiative@gmail.com` | Target receiver |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | 16-char Gmail App Password |
| `SMTP_FROM` | `"Independent Minds Initiative" <independentmindsinitiative@gmail.com>` | Sender header |

6. Click **Create Web Service**.

---

## ✦ Step 3: Verification After Deployment

Once Render finishes building (`Build succeeded`):

1. **Visit your live URL**: Render will provide a free URL (e.g. `https://independent-minds-initiative.onrender.com`).
2. **Access Admin Portal**: Open `https://your-app.onrender.com/admin` and log in with your admin credentials.
3. **Upload an Article & Media**: Test creating an article with a 30-day expiration timer and uploading an image via ImageKit.
4. **Test the Join Community Form**: Submit the form on the homepage and check that the submission appears in the Admin Portal inbox and delivers to `independentmindsinitiative@gmail.com`.

---

## ✦ Custom Domain Setup (Optional)

To connect your own domain (e.g., `independentmindsinitiative.org`):

1. In Render Dashboard, click your service and go to **Settings** > **Custom Domains**.
2. Click **Add Custom Domain** and enter your domain name.
3. Add the `CNAME` or `A` records provided by Render to your DNS provider (Namecheap, GoDaddy, Cloudflare, etc.).
4. Render automatically generates and renews a free **Let's Encrypt SSL Certificate**.
