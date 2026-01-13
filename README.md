# Era Design Manager

A powerful web application for managing and organizing "In My [X] Era" designs for Print-on-Demand sellers.

## Features

- 📦 **Bulk Import** - Import thousands of designs at once
- 🏷️ **Smart Organization** - Categorize designs into niches
- 🤖 **AI-Powered Suggestions** - Get intelligent design recommendations
- 📊 **Visual Dashboard** - Track your organization progress
- 🔍 **Advanced Search** - Find designs quickly
- 📋 **Bulk Operations** - Assign multiple designs at once

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Database**: JSON file storage
- **AI**: OpenRouter API (GPT-4o-mini)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/era-manager.git
cd era-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
OPENROUTER_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add your `OPENROUTER_API_KEY` environment variable
6. Click "Deploy"

### Important Notes

- Your `data.json` file is **not** included in the repository (it's in `.gitignore`)
- You'll need to manually import your designs on each deployment
- For production use, consider migrating to a proper database (PostgreSQL, MongoDB, etc.)

## Usage

### Importing Designs

1. Go to **Import** page
2. Paste your list of design names (one per line)
3. Click "Import Designs"

### Creating Niches

1. Go to **Niches** page
2. Click "Create Niche"
3. Enter a name (e.g., "School", "Medical", "Sports")

### Assigning Designs

**Method 1: Search & Add**
1. Open a niche
2. Click "Search to Add"
3. Search for designs and click to add

**Method 2: Bulk Paste**
1. Open a niche
2. Click "Bulk Paste"
3. Paste a list of design names
4. Click "Process Bulk List"

### AI Suggestions

- Each niche automatically shows AI-suggested designs
- Suggestions are based on existing designs in the niche
- Click any suggestion to instantly add it

## Project Structure

```
era-manager/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── niches/       # Niche pages
│   │   ├── import/       # Import page
│   │   └── ...
│   ├── components/       # React components
│   └── lib/              # Utilities and database
├── data.json             # JSON database (gitignored)
├── .env.local            # Environment variables (gitignored)
└── package.json
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
