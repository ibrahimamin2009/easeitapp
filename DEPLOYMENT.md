# Vercel Deployment Guide

This guide will help you deploy your Flask Yarn Management System to Vercel.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. Git repository (GitHub, GitLab, or Bitbucket)
3. A database service (recommended: PostgreSQL on Vercel, Railway, or Supabase)

## Database Setup

Since SQLite doesn't work in serverless environments, you'll need a cloud database:

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string

### Option 2: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string

### Option 3: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

## Deployment Steps

### 1. Push to Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `pip install -r requirements.txt`

### 3. Environment Variables

In your Vercel project settings, add these environment variables:

```
SECRET_KEY=your-secure-secret-key-here
DATABASE_URL=your-database-connection-string
FLASK_ENV=production
```

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## Post-Deployment

1. Visit your deployed URL
2. Create an admin account by going to `/register`
3. Set up your first admin user
4. The system will automatically create sample data

## Important Notes

### File Uploads
- File uploads are stored in `/tmp` directory in serverless environments
- Consider using cloud storage (AWS S3, Cloudinary) for production
- Current implementation works for demo purposes

### Database
- The app will automatically create tables on first run
- Sample users and data will be created if none exist

### Security
- Change the default SECRET_KEY in production
- Use HTTPS (automatically provided by Vercel)
- Consider adding rate limiting for production use

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL environment variable
   - Ensure database is accessible from Vercel

2. **Build Failures**
   - Check requirements.txt for correct package versions
   - Ensure all dependencies are listed

3. **Static Files Not Loading**
   - Check vercel.json routes configuration
   - Ensure static files are in the correct directory

### Logs
- Check Vercel dashboard for deployment logs
- Use Vercel CLI: `vercel logs`

## Production Recommendations

1. **Database**: Use a managed PostgreSQL service
2. **File Storage**: Use cloud storage (AWS S3, Cloudinary)
3. **Monitoring**: Add error tracking (Sentry)
4. **Backup**: Set up automated database backups
5. **Security**: Add rate limiting and CSRF protection

## Support

If you encounter issues:
1. Check the Vercel documentation
2. Review the deployment logs
3. Ensure all environment variables are set correctly
