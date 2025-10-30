# Cloudinary Upload Troubleshooting Guide

## Quick Fix for Production

If you're getting "Failed to upload product image" errors in production, follow these steps:

### 1. Check Environment Variables

Ensure these environment variables are set on your production server:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Verify Configuration

Visit `/admin/upload-test` in your admin panel to run diagnostics and test uploads.

### 3. Test API Endpoints

You can also test directly via API:

```bash
# Check configuration
curl https://your-domain.com/api/upload

# Run diagnostics  
curl https://your-domain.com/api/upload/diagnostics

# Test upload
curl -X POST https://your-domain.com/api/upload/diagnostics
```

## Common Issues & Solutions

### 401 Unauthorized Error
**Problem:** Invalid API credentials
**Solution:** 
- Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are correct
- Check for extra spaces or special characters in environment variables
- Regenerate API credentials in Cloudinary dashboard if needed

### 404 Not Found Error  
**Problem:** Cloud name not found
**Solution:**
- Verify `CLOUDINARY_CLOUD_NAME` is correct (check Cloudinary dashboard)
- Ensure no typos in the cloud name

### 429 Rate Limited Error
**Problem:** Exceeded Cloudinary usage limits
**Solution:**
- Check your Cloudinary dashboard for usage statistics
- Upgrade your Cloudinary plan if needed
- Wait for rate limit reset (usually hourly)

### Timeout/Network Errors
**Problem:** Connection issues to Cloudinary
**Solution:**
- Check server internet connection
- Verify firewall allows outbound HTTPS connections
- Try uploading smaller images
- Check if your hosting provider blocks external API calls

### File Size/Type Errors
**Problem:** Invalid file or too large
**Solution:**
- Ensure file is a valid image (JPEG, PNG, WebP, GIF)
- Keep file size under 10MB
- Check file is not corrupted

## Environment Variable Setup by Platform

### Vercel
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add the three Cloudinary variables
4. Redeploy your application

### Netlify
1. Go to Site Settings → Environment Variables
2. Add the three Cloudinary variables
3. Redeploy your application

### Railway
1. Go to your project → Variables tab
2. Add the three Cloudinary variables
3. Redeploy your application

### Docker/VPS
Add to your `.env` file or export in your shell:
```bash
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret
```

## Getting Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Find your credentials in the "Account Details" section:
   - Cloud Name
   - API Key  
   - API Secret

## Testing Locally

1. Copy `.env.local.example` to `.env.local`
2. Add your Cloudinary credentials
3. Run `npm run dev`
4. Visit `http://localhost:3000/admin/upload-test`
5. Run diagnostics and test uploads

## Advanced Debugging

### Enable Detailed Logging
The upload API now includes detailed console logging. Check your server logs for:
- File validation details
- Cloudinary connection status
- Upload progress and errors

### Manual API Testing
Use curl or Postman to test the upload API directly:

```bash
curl -X POST \
  -F "file=@/path/to/image.jpg" \
  -F "folder=yuumpy/test" \
  https://your-domain.com/api/upload
```

### Check Cloudinary Dashboard
- Monitor usage and limits
- Check upload activity
- Verify account status

## Support

If you're still having issues:
1. Check the detailed error logs in your server console
2. Run the diagnostics at `/admin/upload-test`
3. Verify all environment variables are set correctly
4. Test with a small (< 1MB) JPEG image first
5. Check your Cloudinary account status and limits

## Security Notes

- Never commit API secrets to version control
- Use environment variables for all credentials
- Regenerate API keys if they're compromised
- Consider using signed uploads for additional security