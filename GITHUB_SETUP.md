# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" button (top right) → "New repository"
3. Repository name: `highdeium` (or whatever you prefer)
4. Make it **Public** (required for free deployments)
5. Don't initialize with README (we already have files)
6. Click "Create repository"

## Step 2: Get Your Code Ready

Your Replit project is already set up with:
- ✅ `.gitignore` file (hides sensitive files)
- ✅ `README.md` (project description)
- ✅ Deployment configs for Railway/Render
- ✅ All source code organized

## Step 3: Push to GitHub

### Option A: Use Replit's Git Integration
1. In Replit, open the Shell tab (bottom of screen)
2. Run these commands one by one:

```bash
git init
git add .
git commit -m "Initial commit - Highdeium book platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/highdeium.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Option B: Download and Upload
1. In Replit, click the three dots menu → "Download as zip"
2. Extract the zip file on your computer
3. In GitHub, click "uploading an existing file"
4. Drag all files from the extracted folder
5. Commit the files

## Step 4: Verify Upload

Check that these important files are in your GitHub repo:
- `package.json` (dependencies)
- `client/` folder (frontend code)
- `server/` folder (backend code)
- `shared/schema.ts` (database schema)
- `railway.json` (Railway config)
- `render.yaml` (Render config)

## Step 5: Deploy to Free Hosting

Now you can deploy to any of these platforms:

### Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your `highdeium` repository
5. Railway auto-detects Node.js and deploys

### Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. "New" → "Web Service"
4. Connect your `highdeium` repository
5. Render uses the `render.yaml` config automatically

## Troubleshooting

**If git commands don't work in Replit:**
1. Try refreshing the page
2. Use the download/upload method instead
3. Or use GitHub's web interface to create files

**If deployment fails:**
1. Check the build logs on your hosting platform
2. Make sure all environment variables are set
3. Verify your GitHub repo has all the files

**Need help?**
- GitHub has excellent documentation
- Railway and Render have step-by-step guides
- All platforms offer free customer support