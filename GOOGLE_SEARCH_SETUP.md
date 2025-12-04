# Google Custom Search Setup Guide

This guide will help you set up Google Custom Search API to get high-quality images for AI tools.

## Why Google Custom Search?

The project now uses Google Custom Search API to find high-quality product images and logos for AI tools. This provides much better images than favicons or generic placeholders.

## Setup Steps

### 1. Get a Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Create a Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click **"Add"** or **"Get Started"** to create a new search engine
3. Configure your search engine:
   - **Search engine name**: AI Tool Hunter Image Search (or any name you like)
   - **What to search**: Select **"Search the entire web"**
   - Click **"Create"**

4. After creation, you'll be taken to the control panel. Now configure these settings:
   - Go to **"Setup"** tab (left sidebar)
   - Under **"Basic"** section:
     - Make sure **"Search the entire web"** is enabled
     - Toggle **"Image search"** to **ON** (this is crucial!)
     - Toggle **"SafeSearch"** to **ON** (recommended)

5. Get your Search Engine ID:
   - Still in the **"Setup" > "Basic"** section
   - Look for **"Search engine ID"** field
   - It looks like: `a12b3c4d5e6f7g8h9` (alphanumeric, usually starts with a letter)
   - Click the **copy icon** next to it, or select and copy the ID

   **Visual Location:**
   ```
   Setup > Basic
   ├── Search engine name
   ├── Edition
   ├── Search engine ID: [a1b2c3d4e5f6g7h8] 📋 <- Copy this!
   └── Websites to search
   ```

6. (Optional) Test your search engine:
   - Click the **"Public URL"** button to see it in action
   - Try searching for "ChatGPT logo" to verify image search works

### 3. Update Environment Variables

Add these to your `.env.local` file:

```bash
# Google Custom Search API for better tool images
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

**Note**: You can reuse your existing Gemini API key if you prefer:
```bash
GOOGLE_SEARCH_API_KEY=AIzaSyAtsZG3GvkqJOo1jTBMVLRfoAFs7rBuCM4
```

### 4. Free Tier Limits

Google Custom Search API free tier includes:
- **100 queries per day** - FREE
- Additional queries cost $5 per 1000 queries

This should be sufficient for most use cases since images are cached.

## How It Works

The image fetching strategy now works as follows:

1. **Google Custom Search** - Searches for official logos and high-quality images
2. **Clearbit Logo API** - Falls back to company logos
3. **Pexels API** - Generic tech/AI images as fallback
4. **Google Favicon** - Small favicon as backup
5. **UI Avatars** - Generated placeholder with tool name

## Testing

To test if it's working:

1. Add the environment variables
2. Restart your development server
3. Go to admin dashboard
4. Try auto-generating a tool
5. Check the console logs to see which image source was used

## 🎯 Step-by-Step Visual Guide

### Finding the Search Engine ID

When you're on the Programmable Search Engine control panel:

1. **Look at the left sidebar** - You'll see tabs:
   - Overview
   - **Setup** ← Click here
   - Look and feel
   - Statistics
   - Monetization

2. **In the Setup tab**, you'll see sections:
   - **Basic** ← This is where the ID is
   - Sites to search
   - Features
   - Administration

3. **In the Basic section**, scroll down to find:
   ```
   Search engine ID
   [a1b2c3d4e5f6g7h8i9]  [📋 Copy]
   ```

4. The ID is typically **15-20 characters long** and contains:
   - Letters (a-z)
   - Numbers (0-9)
   - Sometimes underscores (_)
   - Example: `a1b2c3d4e5f6g7h8i9` or `abc123def456ghi`

### Common ID Format Examples
- ✅ Correct: `017576662512468239146:omuauf_lfve`
- ✅ Correct: `a1b2c3d4e5f6g7h8i9`
- ✅ Correct: `abc123_def456:ghi789`
- ❌ Wrong: `AIzaSy...` (this is an API key, not Search Engine ID)
- ❌ Wrong: `12345` (too short)

## 🧪 Testing Your Setup

After adding the Search Engine ID to `.env.local`:

1. **Restart your dev server**:
   ```bash
   # Press Ctrl+C to stop the server
   npm run dev
   ```

2. **Test in admin dashboard**:
   - Go to `http://localhost:3000/admin`
   - Enter a tool name (e.g., "Notion")
   - Click "Auto-Generate All"
   - **Check the server console** (not browser console) for logs:
   ```
   🖼️  Fetching image for Notion...
     Strategy 1: Trying Google Custom Search...
     🔍 Searching Google Images for: Notion logo site:notion.so
     ✅ Found high-quality image via Google: https://...
   ```

3. **Verify image quality**:
   - The image should be clear and high-resolution
   - Should be the actual product logo, not a favicon
   - Preview it by hovering over the image in the admin form

## Troubleshooting

### "Google Custom Search Engine ID not configured"
**Problem**: Logs show this message
**Solution**:
- Make sure you've set `GOOGLE_SEARCH_ENGINE_ID` in `.env.local`
- Verify there are no extra spaces or quotes around the ID
- Restart your dev server after adding the variable
- Check the variable name is exactly: `GOOGLE_SEARCH_ENGINE_ID`

### "Quota exceeded" or "429 error"
**Problem**: Hit the 100 queries/day limit
**Solution**:
- The system will automatically fall back to Clearbit, Pexels, or placeholders
- Reset happens at midnight Pacific Time
- Consider caching images in Appwrite Storage to reduce API calls

### Images not loading or 403 errors
**Problem**: API key or permissions issue
**Solution**:
- Check that your API key has **Custom Search API** enabled in Google Cloud Console
- Go to: APIs & Services > Library > Search for "Custom Search API" > Enable
- Verify the Search Engine ID is correct (copy it again from the dashboard)
- Make sure **"Image search"** is enabled in your search engine settings

### Wrong images showing up
**Problem**: Getting irrelevant images
**Solution**:
- The search query includes the tool name + "logo" + website domain
- Make sure "Search the entire web" is enabled in your search engine
- Check that SafeSearch is ON to filter inappropriate content
- Try testing with the "Public URL" feature to see what images Google finds

### Search Engine ID looks wrong
**Problem**: Confused about which ID to copy
**Solution**:
- The Search Engine ID is **NOT** the same as your API key
- API Key: Starts with `AIza...` (around 39 characters)
- Search Engine ID: Alphanumeric string, often contains `:` or `_`
- Location: Setup > Basic > "Search engine ID" field
- If you see "cx" parameter in the public URL, that's also your ID:
  ```
  https://cse.google.com/cse?cx=a1b2c3d4e5f6g7h8
                              ↑ This is your ID
  ```

## 💡 Pro Tips

1. **Reuse your Gemini API key**: If you already have the Gemini key working, you can use it for Google Custom Search too (they're the same):
   ```bash
   GOOGLE_SEARCH_API_KEY=AIzaSyAtsZG3GvkqJOo1jTBMVLRfoAFs7rBuCM4
   ```

2. **Monitor your usage**: Check the Statistics tab in your search engine dashboard to see how many queries you've used

3. **Cache in production**: Consider saving fetched images to Appwrite Storage to avoid repeated API calls for the same tool

4. **Fallback is automatic**: If Google Search fails for any reason, the system automatically tries Clearbit, Pexels, and favicons

## ⚙️ Optional: Disable Google Search

If you don't want to set up Google Custom Search, the system will work fine without it. It will automatically skip to the other image sources (Clearbit, Pexels, etc.).

**Simply leave `GOOGLE_SEARCH_ENGINE_ID` empty or don't set it at all:**
```bash
# Don't add this line at all, or leave it empty:
# GOOGLE_SEARCH_ENGINE_ID=
```

The image service will detect it's not configured and skip to the next strategy.
