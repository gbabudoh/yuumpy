# Cloudinary Setup Guide for VPS Deployment

## 🔧 Problem: Image Upload Not Working

If product image uploads are failing on your deployed site, it's likely because Cloudinary environment variables are not configured on your VPS server.

## ✅ Solution: Configure Cloudinary on Your VPS

### Step 1: Get Your Cloudinary Credentials

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign in (or create an account)
2. Navigate to your **Dashboard**
3. Copy these values:
   - **Cloud Name** (e.g., `yuumpy-cloud`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### Step 2: Add Environment Variables on Your VPS (Cloudpanel)

1. **Log in to Cloudpanel** on your VPS
2. Navigate to your **Node.js site solution** (yuumpy)
3. Go to **Settings** → **Environment Variables**
4. Add these three environment variables:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important Notes:**
- Replace the placeholder values with your actual Cloudinary credentials
- Do NOT include quotes around the values
- Make sure there are no extra spaces

### Step 3: Restart Your Node.js Application

After adding the environment variables:

1. In Cloudpanel, go to your **Node.js site**
2. Click **Restart** or **Reload**
3. Wait for the application to restart (usually takes 10-30 seconds)

### Step 4: Verify Configuration

You can verify Cloudinary is working by:

1. **Check the test endpoint:**
   ```
   https://yuumpy.com/api/upload/test
   ```
   
   This will show you the configuration status:
   - ✅ **Configured**: All environment variables are set correctly
   - ❌ **Not Configured**: Missing one or more environment variables

2. **Try uploading a product image:**
   - Go to Admin Dashboard → Products → Add/Edit Product
   - Try uploading an image
   - You should now see a Cloudinary URL instead of an error

## 🔍 Troubleshooting

### Issue: "Cloudinary is not configured" Error

**Solution:**
- Double-check all three environment variables are set in Cloudpanel
- Make sure there are no typos in variable names (they are case-sensitive)
- Restart your Node.js application after adding/modifying variables

### Issue: "Invalid API Key" Error

**Solution:**
- Verify your API Key and API Secret are correct in Cloudinary Dashboard
- Make sure you copied the complete values (they're long strings)
- Check that you didn't accidentally include quotes or extra spaces

### Issue: "Cloud name not found" Error

**Solution:**
- Verify your Cloud Name is correct
- Cloud Name is usually the name you chose when creating your Cloudinary account
- It should not include the `.cloudinary.com` suffix

### Issue: Images Still Not Uploading

**Solution:**
1. Check your VPS server logs for detailed error messages
2. Verify you restarted the Node.js application after setting environment variables
3. Check the `/api/upload/test` endpoint to see configuration status
4. Verify your Cloudinary account is active and not suspended

## 📋 Environment Variables Checklist

Make sure these are set in your Cloudpanel:

- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

## 🚀 Alternative: Using .env File (Advanced)

If you prefer managing environment variables via `.env.local` file:

1. SSH into your VPS
2. Navigate to your application directory
3. Create or edit `.env.local`:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart your Node.js application

**Note:** Cloudpanel's environment variables are recommended as they're easier to manage through the UI.

## 💡 Quick Test

After setup, test the configuration:

```bash
curl https://yuumpy.com/api/upload/test
```

Expected response:
```json
{
  "success": true,
  "cloudinary": {
    "configured": true,
    "status": "✅ Configured",
    "details": {
      "cloudName": "✅ Set (your-cloud-name)",
      "apiKey": "✅ Set",
      "apiSecret": "✅ Set"
    }
  }
}
```

---

## 📞 Still Having Issues?

1. Check server logs in Cloudpanel for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure you restarted the application after making changes
4. Test the `/api/upload/test` endpoint to see configuration status

