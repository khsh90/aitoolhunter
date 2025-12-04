# Quick Start Guide - AI Tool Hunter

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Your `.env.local` should already have most variables configured. To enable better images, add:

```bash
# Optional: For high-quality images (100 free searches/day)
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

**Get Search Engine ID**: https://programmablesearchengine.google.com/

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 How to Use

### Adding a New AI Tool

1. Navigate to `/admin` page
2. Login with your credentials
3. Enter the tool name
4. Click **"Auto-Generate All"** button
5. Review the generated data
6. Click **"Save Tool"**

### What Happens During Auto-Generate?

The system tries two methods:

#### Method 1: Futurepedia Scraping (Preferred)
- Searches Futurepedia for the tool
- Extracts rich data: features, pros, cons, pricing, ratings
- Gets high-quality images
- Shows "✨ Futurepedia Data" badge

#### Method 2: API Fallback
- Searches web for official website
- Generates description with AI
- Finds YouTube tutorials
- Detects pricing and category
- Fetches images using multiple strategies

## 🖼️ Image Strategy

Images are fetched in this order:

1. **Google Custom Search** (if configured) ⭐ Best quality
2. **Clearbit Logo** - Company logos
3. **Pexels** - Generic tech images
4. **Google Favicon** - Small icons
5. **Placeholder** - Generated avatar

## 🎯 Key Features

### Admin Dashboard
- ✨ Auto-generate tool data
- 📊 Quota tracking for all APIs
- 🎨 Rich text editor for descriptions
- 📁 Image upload or URL
- ✏️ Edit existing tools
- 🗑️ Delete tools
- 📂 Manage categories

### Public Directory
- 🔍 Search and filter tools
- 📊 Analytics chart
- 🎴 Grid or list view
- 🏷️ Category badges
- 💰 Free/Paid indicators

### Tool Detail Pages
- 🎥 YouTube video embed
- ⭐ Key features list
- ✅ Pros and ❌ Cons
- 👥 Who's using it
- 💰 Pricing tiers
- 💡 What makes it unique
- 📊 Ratings grid (9 metrics)
- 🔗 Visit website button

## 🔑 API Keys You Have

All these are already configured in your `.env.local`:

- ✅ Appwrite (Database)
- ✅ Gemini AI (Description generation)
- ✅ Brave Search (Web search)
- ✅ YouTube API (Video search)
- ✅ Groq AI (Fallback)
- ✅ Pexels (Images)

**Optional to add**:
- ⏳ Google Custom Search Engine ID (for better images)

## 📊 Quota Limits (All FREE)

| Service | Limit | Reset |
|---------|-------|-------|
| Gemini | 15 requests/min | Per minute |
| Brave Search | 2000/month | Monthly |
| YouTube | 10,000/day | Daily |
| Groq | 30 requests/min | Per minute |
| Pexels | 200/hour | Hourly |
| Google Search | 100/day | Daily |

## 🐛 Troubleshooting

### "Unknown tool" error
- Tool not found on Futurepedia or web
- Try a different tool name
- Click "Manual Entry" to add it manually

### Images not loading
1. Check if Google Search Engine ID is set (optional)
2. Verify API keys are valid
3. Check browser console for errors
4. System will use placeholder if all strategies fail

### Auto-generate is slow
- Futurepedia scraping uses Puppeteer (browser automation)
- First scrape takes 10-20 seconds
- Subsequent API fallbacks are faster (2-5 seconds)
- This is normal behavior

### Build errors
```bash
npm run build
```
If errors occur, check TypeScript types in:
- `lib/services/types.ts`
- Component prop interfaces

## 📁 Important Files

```
├── app/
│   ├── page.tsx              # Main directory
│   ├── tool/[id]/page.tsx    # Tool detail page
│   └── admin/page.tsx        # Admin dashboard
├── components/
│   ├── tool-detail/          # Detail page components
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── services/             # API services
│   │   ├── futurepedia-scraper.ts  # Web scraping
│   │   ├── image.ts          # Image fetching
│   │   ├── google-image-search.ts  # Google Images
│   │   ├── gemini.ts         # AI generation
│   │   └── types.ts          # TypeScript types
│   ├── ai.ts                 # Main AI orchestrator
│   └── appwrite.ts           # Database client
└── .env.local                # Environment variables
```

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js` or use CSS variables in `app/globals.css`

### Modify Auto-Generate Logic
Edit `lib/ai.ts` - main orchestration logic

### Add New Data Fields
1. Update `lib/services/types.ts`
2. Modify `app/admin/page.tsx` (admin form)
3. Update `app/tool/[id]/page.tsx` (display)
4. Add to Appwrite database schema

### Custom Image Sources
Add new strategy in `lib/services/image.ts`

## 📚 Learn More

- [Full Improvements Summary](IMPROVEMENTS_SUMMARY.md)
- [Google Search Setup](GOOGLE_SEARCH_SETUP.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Appwrite Documentation](https://appwrite.io/docs)

## 🆘 Need Help?

Check the console logs - they show detailed progress:
```
🔍 Attempting to scrape from Futurepedia...
✅ Found tool at: https://...
🖼️ Fetching image for Tool Name...
  Strategy 1: Trying Google Custom Search...
  ✅ Found high-quality image
```

This helps debug what's happening during auto-generation!
