# Setup Checklist - AI Tool Hunter

Use this checklist to ensure everything is properly configured.

## ✅ Environment Variables

Check your `.env.local` file has all these variables:

```bash
# Appwrite Configuration
- [ ] NEXT_PUBLIC_APPWRITE_ENDPOINT
- [ ] NEXT_PUBLIC_APPWRITE_PROJECT_ID
- [ ] APPWRITE_API_KEY
- [ ] NEXT_PUBLIC_APPWRITE_DATABASE_ID
- [ ] NEXT_PUBLIC_APPWRITE_COLLECTION_CATEGORIES
- [ ] NEXT_PUBLIC_APPWRITE_COLLECTION_TOOLS

# AI APIs
- [ ] NEXT_PUBLIC_GEMINI_API_KEY
- [ ] GROQ_API_KEY

# Search APIs
- [ ] BRAVE_SEARCH_API_KEY
- [ ] YOUTUBE_API_KEY

# Image APIs
- [ ] PEXELS_API_KEY
- [ ] GOOGLE_SEARCH_API_KEY (can reuse Gemini key)
- [ ] GOOGLE_SEARCH_ENGINE_ID (optional - see GOOGLE_SEARCH_SETUP.md)
```

## ✅ Appwrite Database Schema

Go to Appwrite Console and verify:

### Database: `ai-tool-hunter`
- [ ] Database exists
- [ ] Database ID matches `.env.local`

### Collection: `categories`
- [ ] Collection exists
- [ ] Has attribute: `name` (String, size: 100, required)
- [ ] Permissions: Any (Read), Users (CRUD)

### Collection: `tools`

**Basic Fields:**
- [ ] `name` (String, 255, required)
- [ ] `description` (String, 1000, required)
- [ ] `category` (String, 50, required)
- [ ] `tool_type` (String, 10, required)
- [ ] `image_url` (URL, 2000)
- [ ] `video_url` (URL, 2000)
- [ ] `website_url` (URL, 2000)
- [ ] `date_added` (DateTime, required)

**Futurepedia Fields:**
- [ ] `keyFeatures` (String, 5000, array)
- [ ] `pros` (String, 5000, array)
- [ ] `cons` (String, 5000, array)
- [ ] `whoIsUsing` (String, 5000, array)
- [ ] `uncommonUseCases` (String, 5000, array)
- [ ] `pricingTiers` (String, 10000) - stores JSON
- [ ] `whatMakesUnique` (String, 2000)
- [ ] `ratings` (String, 2000) - stores JSON
- [ ] `dataSource` (String, 50)

**Indexes:**
- [ ] name_search (fulltext on name)
- [ ] category_index (key on category)
- [ ] date_index (key on date_added, DESC)

**Permissions:**
- [ ] Any (Read), Users (CRUD)

> 📖 See [APPWRITE_DATABASE_SCHEMA.md](APPWRITE_DATABASE_SCHEMA.md) for detailed setup instructions

## ✅ Google Custom Search (Optional)

For better image quality:

- [ ] Created Custom Search Engine at https://programmablesearchengine.google.com/
- [ ] Enabled "Image search" in search engine settings
- [ ] Copied Search Engine ID to `.env.local`
- [ ] Enabled Custom Search API in Google Cloud Console

> 📖 See [GOOGLE_SEARCH_SETUP.md](GOOGLE_SEARCH_SETUP.md) for step-by-step guide

## ✅ Installation

- [ ] Ran `npm install` successfully
- [ ] No dependency errors in console

## ✅ Testing

### 1. Start Development Server
```bash
- [ ] npm run dev
- [ ] Server starts without errors
- [ ] Accessible at http://localhost:3000
```

### 2. Test Admin Dashboard
```bash
- [ ] Navigate to http://localhost:3000/admin
- [ ] Can login successfully
- [ ] Dashboard loads without errors
- [ ] Can see existing categories
- [ ] Can see existing tools (if any)
```

### 3. Test Auto-Generate (Futurepedia Path)
```bash
- [ ] Enter tool name: "Notion" or "ChatGPT"
- [ ] Click "Auto-Generate All"
- [ ] Check terminal for logs showing Futurepedia scraping
- [ ] Verify "✨ Futurepedia Data" in logs
- [ ] Form populates with:
  - [ ] Description
  - [ ] Image URL (high quality)
  - [ ] Video URL
  - [ ] Website URL
  - [ ] Category (auto-created if needed)
  - [ ] Tool Type (Free/Paid)
- [ ] Check state variables have extended data:
  - [ ] keyFeatures array populated
  - [ ] pros array populated
  - [ ] cons array populated
  - [ ] pricingTiers array populated
  - [ ] ratings object populated
- [ ] Click "Save Tool"
- [ ] Tool saves successfully
- [ ] No console errors
```

### 4. Test Auto-Generate (API Fallback Path)
```bash
- [ ] Enter unknown tool name
- [ ] Click "Auto-Generate All"
- [ ] Check terminal for logs showing API fallback
- [ ] Form populates with basic data:
  - [ ] Description (AI-generated)
  - [ ] Image URL (Google Search → Clearbit → Pexels → Favicon)
  - [ ] Video URL
  - [ ] Website URL
  - [ ] Category
  - [ ] Tool Type
- [ ] Click "Save Tool"
- [ ] Tool saves successfully
```

### 5. Test Tool Detail Page
```bash
- [ ] Go to http://localhost:3000
- [ ] Find and click on a saved tool
- [ ] Tool detail page loads
- [ ] All fields display correctly:
  - [ ] Tool name and image
  - [ ] Description
  - [ ] Category and type badges
  - [ ] Data source badge (if Futurepedia)
  - [ ] Website button works
  - [ ] YouTube video embeds (if available)
  - [ ] Key Features section (if available)
  - [ ] Pros & Cons section (if available)
  - [ ] Who's Using section (if available)
  - [ ] Pricing Tiers section (if available)
  - [ ] What Makes Unique section (if available)
  - [ ] Ratings Grid section (if available)
```

### 6. Test Image Quality
```bash
- [ ] Check console logs show image strategy used
- [ ] If Google Search configured: "✅ Found high-quality image via Google"
- [ ] If not configured: Falls back to Clearbit/Pexels/Favicon
- [ ] Images are clear and high-resolution (not tiny favicons)
- [ ] Images load without 404 errors
```

### 7. Test Quota Display
```bash
- [ ] Quota widget appears at top of admin page
- [ ] Shows usage for all APIs (Gemini, Brave, YouTube, etc.)
- [ ] Percentages display correctly
- [ ] Color coding works (green → yellow → red)
```

## ✅ Console Logs (What to Look For)

### Expected Success Logs:
```
✅ Positive indicators:
- "🔍 Attempting to scrape [Tool] from Futurepedia..."
- "✅ Found tool at: https://www.futurepedia.io/tool/..."
- "✅ Successfully scraped data for [Tool]"
- "🖼️ Fetching image for [Tool]..."
- "✅ Found high-quality image via Google"
- "Features: X, Pros: Y, Cons: Z"
```

### Expected Fallback Logs:
```
ℹ️ Normal fallbacks:
- "❌ Tool not found on Futurepedia"
- "ℹ️ Falling back to standard API method..."
- "Google Custom Search Engine ID not configured"
- "❌ Google Custom Search failed" (will try next strategy)
```

### Problem Indicators:
```
❌ Issues to investigate:
- Red error messages in console
- "Failed to fetch..."
- "Quota exceeded" (check quota limits)
- "Attribute not found" (check Appwrite schema)
- "Invalid document structure" (check field types)
```

## 🐛 Common Issues

### Issue: "Attribute not found in Appwrite"
**Solution:** Create missing attributes in Appwrite Console (see APPWRITE_DATABASE_SCHEMA.md)

### Issue: Images are low quality
**Solution:**
1. Set up Google Custom Search Engine ID
2. Verify "Image search" is enabled in your search engine
3. Check console logs to see which strategy is being used

### Issue: Pricing/Ratings not displaying
**Solution:**
1. Verify fields exist in Appwrite (pricingTiers, ratings as String type)
2. Check they're being saved as JSON strings
3. Verify parsing in tool detail page

### Issue: Auto-generate is slow
**Solution:** This is normal for Futurepedia scraping (15-20 seconds). API fallback is faster (3-5 seconds).

### Issue: "Unknown tool" error
**Solution:**
1. Tool not found on Futurepedia (normal)
2. Will fall back to API method automatically
3. Or use "Manual Entry" to add manually

## ✅ Production Deployment

Before deploying to production:

- [ ] All environment variables set in production environment
- [ ] Appwrite project is in production mode
- [ ] Google Search Engine ID configured (optional)
- [ ] All API keys are valid and have quota
- [ ] Database schema is complete
- [ ] Test on production URL
- [ ] Monitor API quota usage
- [ ] Consider caching images to reduce API calls

## 📚 Documentation Reference

- **Setup & Configuration:** [QUICK_START.md](QUICK_START.md)
- **Database Schema:** [APPWRITE_DATABASE_SCHEMA.md](APPWRITE_DATABASE_SCHEMA.md)
- **Google Search Setup:** [GOOGLE_SEARCH_SETUP.md](GOOGLE_SEARCH_SETUP.md)
- **Technical Details:** [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md)

---

## ✅ All Done?

If all checkboxes are checked, you're ready to go! 🎉

Start adding AI tools and enjoy the enhanced image quality and rich Futurepedia data!
