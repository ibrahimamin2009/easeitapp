# Vercel 500 Error Debugging Guide

Your Flask app is still getting 500 errors. Let's debug this systematically.

## 🔍 Step 1: Check Vercel Function Logs

### How to Access Logs:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your `easeitapp` project
3. Go to **"Functions"** tab
4. Click on **"View Function Logs"**
5. Look for error messages

### What to Look For:
- Import errors
- Database connection errors
- Missing environment variables
- Python path issues

## 🔧 Step 2: Verify Environment Variables

### Check in Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Verify these are set correctly:

```
SECRET_KEY=2a294476907bde61da3d41b00331eb716b869b557d138c815b0c00314818d755
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.taklmbjonsedhqjtosxs.supabase.co:5432/postgres
FLASK_ENV=production
```

### Important Notes:
- Replace `YOUR_PASSWORD` with your actual Supabase password
- No spaces around the `=` sign
- Make sure all three variables are added

## 🧪 Step 3: Test the Health Endpoint

After redeployment, try these URLs:

1. **Health Check**: `https://your-app.vercel.app/health`
   - Should return: `{"status": "healthy", "database_url": "configured", "secret_key": "configured"}`

2. **Main App**: `https://your-app.vercel.app/`
   - Should show login page or redirect to login

## 🚨 Common Issues and Solutions:

### Issue 1: Missing DATABASE_URL
**Error**: `database_url: "missing"`
**Solution**: 
- Add DATABASE_URL environment variable in Vercel
- Make sure it's the complete Supabase connection string

### Issue 2: Database Connection Failed
**Error**: `Database connection error` in logs
**Solution**:
- Verify your Supabase password is correct
- Check if Supabase database is running
- Test connection string format

### Issue 3: Import Errors
**Error**: `Import error` in logs
**Solution**:
- Check if all files are committed to Git
- Verify Python path resolution

### Issue 4: Missing Dependencies
**Error**: `ModuleNotFoundError` in logs
**Solution**:
- Check `requirements.txt` has all needed packages
- Verify Vercel is installing dependencies correctly

## 🔄 Step 4: Redeploy After Fixes

If you made changes:
1. Go to **Deployments** tab in Vercel
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

## 📋 Debugging Checklist:

- [ ] Environment variables are set correctly
- [ ] DATABASE_URL includes your actual Supabase password
- [ ] All files are committed to Git
- [ ] Vercel has redeployed with latest changes
- [ ] Health endpoint returns proper response
- [ ] Function logs show no import errors
- [ ] Supabase database is accessible

## 🆘 If Still Getting 500 Error:

### Option 1: Check Function Logs
The logs will show the exact error. Look for:
- Python traceback
- Database connection errors
- Missing environment variables

### Option 2: Test Database Connection
Try connecting to your Supabase database manually:
1. Go to Supabase dashboard
2. Go to **SQL Editor**
3. Run a simple query: `SELECT 1;`
4. If this works, your database is accessible

### Option 3: Simplify the App
If still having issues, we can create a minimal test version to isolate the problem.

## 📞 Next Steps:

1. **Check the logs first** - this will tell us exactly what's wrong
2. **Verify environment variables** are set correctly
3. **Test the health endpoint** to see what's configured
4. **Share the error logs** if you're still having issues

The improved error handling I added will now show more specific error messages, making it easier to identify the exact problem.
