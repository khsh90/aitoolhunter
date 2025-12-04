# AI Tool Hunter

A comprehensive directory of AI tools built with Next.js 14, Appwrite, and modern web technologies.

## Features
- Browse AI tools with filtering by category and type (Free/Paid)
- Admin dashboard for managing tools and categories
- Auto-generation of tool data using multiple AI services
- Responsive design with grid and list views
- Logo fetching from multiple sources

## Tech Stack
- **Framework:** Next.js 14.1.0 with App Router
- **Backend:** Appwrite (Database, Auth, Storage)
- **Styling:** Tailwind CSS
- **AI Services:** Google Gemini, Groq
- **Search:** Brave Search, Google Custom Search
- **Media:** YouTube API, Pexels API

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/khsh90/aitoolhunter.git
cd aitoolhunter
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- Get Appwrite credentials from https://appwrite.io/
- Get Gemini API key from https://makersuite.google.com/app/apikey
- Get Brave Search API key from https://brave.com/search/api/
- Get other API keys as needed

### 4. Setup Appwrite
Run setup scripts to initialize database and collections:
```bash
node scripts/setup-appwrite.js
node scripts/setup-storage.js
node scripts/update-schema.js
```

### 5. Create Admin User
```bash
node scripts/create-admin-user.js your-email@example.com yourpassword "Your Name"
```

### 6. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Admin Access
- **Desktop:** Click top-right corner of header
- **Mobile:** Tap header 4 times within 2 seconds
- Navigate to admin login page

## Deployment

### Appwrite Sites
This project is configured for deployment on Appwrite Sites.

1. Push to GitHub
2. Go to https://appwrite.io/products/sites
3. Connect your GitHub repository
4. Configure environment variables in Appwrite dashboard
5. Deploy!

## Environment Variables Required for Production
See `.env.example` for complete list. All variables must be set in your hosting platform.

## License
MIT License

## Contributing
Pull requests are welcome!
