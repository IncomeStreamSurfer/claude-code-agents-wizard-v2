# Claude Code Directory Builder System 🚀

**One-Shot Directory Website Generator**: From topic to deployed website in one automated workflow.

Turn any topic into a complete, SEO-optimized directory website with just a topic name and a Jina API key. The system automatically researches, designs, builds, and deploys a full NextJS directory with 50-100+ pages optimized for Google.

## 🎯 What Does This Do?

Give it:
- **A topic** ("Irish heritage sites", "Coworking spaces in London", "Best coffee shops in NYC")
- **Jina API key** (for web research)
- **HTML/CSS/JS design** (optional - it'll generate one if you don't have it)

Get:
- **Complete NextJS directory website**
- **50-100+ SEO-optimized pages** (homepage, category pages, tag pages, individual item pages)
- **Comprehensive data** researched from real sources
- **Clickbait titles** optimized for Google ("Best X in Y", "Everything You Need to Know")
- **Dynamic routing** for all pages
- **Search & filter functionality**
- **Responsive design**
- **Ready to deploy** to Vercel, Digital Ocean, Netlify, etc.

## ⚡ Quick Start

### Prerequisites

1. **Claude Code CLI** installed ([get it here](https://docs.claude.com/en/docs/claude-code))
2. **Node.js** (for NextJS)
3. **Jina API Key** ([get free key at jina.ai](https://jina.ai))
4. **GitHub account** (optional, for deployment)

### Installation

```bash
# Clone this repository
git clone https://github.com/IncomeStreamSurfer/claude-code-agents-wizard-v2.git
cd claude-code-agents-wizard-v2

# Checkout the directory-builder branch
git checkout directory-builder-system

# Start Claude Code in this directory
claude
```

## 🚀 Usage

Once Claude Code is running in this directory:

```
You: "Make me a directory about [YOUR TOPIC]"
```

**Claude will ask you for:**
1. **Jina API Key** - For researching and scraping data
2. **Number of items** - How many directory entries (default: 50)
3. **HTML/CSS/JS design** - Provide your own OR let the system generate one

**Then Claude automatically:**
1. Generates/saves design (if needed)
2. Researches topic and creates comprehensive JSON schema
3. Spawns 10+ parallel agents to research and create all data
4. Builds complete NextJS website with SEO optimization
5. Pushes to GitHub
6. Gives you deployment instructions

## 📖 Example Session

```
You: "Make me a directory about Irish heritage sites"

Claude: "Great! I'll help you build a directory about Irish heritage sites. I need:
1. ✅ Topic: Irish heritage sites
2. ❓ What's your Jina API key?
3. ❓ Do you have HTML/CSS/JS design code, or should I generate one?"

You: "Here's my Jina key: jina_xxxxx. Generate a design for me."

Claude: "Perfect! How many heritage sites do you want in the directory? (Default: 50)"

You: "50 sites"

Claude:
✅ Generating design...
✅ Creating schema from research...
✅ Spawning 10 data agents in parallel...
✅ Building NextJS website...
✅ Pushing to GitHub...

COMPLETE! Your Irish heritage sites directory is ready:
- 50 heritage sites researched
- 92 total pages generated:
  * 1 homepage
  * 50 individual site pages
  * 10 category pages ("Best Castles in Ireland")
  * 31 tag pages ("Top Family-Friendly Sites")
- GitHub: https://github.com/you/irish-heritage-sites
- Deploy: vercel deploy or push to Digital Ocean
```

## 🏗️ How It Works

### The Automated Workflow

```
USER INPUT → DESIGN → SCHEMA → DATA (PARALLEL) → NEXTJS → GITHUB
```

**Step 1: Design Generation (if needed)**
- `design-generator` agent creates HTML/CSS/JS design
- Or uses your provided design

**Step 2: Schema Creation**
- `schema-creator` agent researches 5-7 real examples
- Creates comprehensive JSON schema (40+ fields)
- Populates 3-5 example items

**Step 3: Parallel Data Generation**
- Spawns N `data-generator` agents simultaneously
- Each agent researches and creates 5 items
- 10 agents = 50 items in parallel (10x faster!)

**Step 4: NextJS Website Build**
- `nextjs-builder` agent creates complete site
- **SEO-OPTIMIZED pages:**
  - Homepage with search
  - Individual page for EVERY item
  - Category page for EVERY category ("Best X in Y")
  - Tag page for EVERY unique tag ("Top Z Sites")
  - Search page with filters
- All pages have clickbait meta titles/descriptions
- Sitemap with all pages
- Schema.org markup
- Dynamic routing

**Step 5: GitHub Deployment**
- Orchestrator pushes to GitHub
- Returns repository URL
- Provides deployment instructions

## 🎨 SEO Features (The Whole Point!)

### Every Directory Gets 90-150+ Pages

**Example: 50 heritage sites with 30 unique tags and 8 categories:**
- 1 homepage
- 50 individual item pages
- 8 category pages
- 30 tag pages
- 1 search page
- **Total: 90 pages** all optimized for Google

### Clickbait Titles for Google Rankings

**Individual Pages:**
- "Kilkenny Castle - Everything You Need to Know | Heritage Guide"
- "Rock of Cashel Complete Guide - Hours, Tickets & Best Time"
- "Blarney Castle 2025: Skip the Line Tickets, Map & Tips"

**Category Pages (Target "Best X in Y"):**
- "Best Castles in Ireland - Top 25 Castles to Visit in 2025"
- "Best National Parks in Ireland - Complete Guide with Maps"
- "Best Historic Houses in Ireland - 15 Must-See Estates"

**Tag Pages (Target Long-Tail Keywords):**
- "Top Family-Friendly Heritage Sites - 32 Amazing Options"
- "Medieval Castles in Ireland - Complete Guide to 18 Sites"
- "Free Heritage Sites in Ireland - 12 Free Attractions"

### Complete SEO Implementation

- ✅ Unique meta title for every page
- ✅ Compelling meta description for every page
- ✅ Sitemap.xml with all pages
- ✅ robots.txt
- ✅ Schema.org JSON-LD markup
- ✅ Open Graph tags
- ✅ Semantic HTML
- ✅ Internal linking
- ✅ Image alt text
- ✅ Proper heading hierarchy

## 🛠️ The Agent System

### Main Orchestrator (CLAUDE.md)
- Collects user inputs
- Coordinates all agents
- Manages workflow
- Handles GitHub deployment

### design-generator
- Creates HTML/CSS/JS design
- Tailwind CSS based
- Responsive and beautiful
- Topic-appropriate aesthetics

### schema-creator
- Researches topic with Jina
- Creates comprehensive schema
- Populates example data
- 40+ fields per item

### data-generator (Parallel Agents)
- Spawned 10+ at once
- Each creates 5 items
- Uses Jina for research
- Follows schema exactly
- Real, comprehensive data

### nextjs-builder
- Converts design to NextJS
- Generates ALL pages
- SEO optimization
- Dynamic routing
- Search/filter
- Responsive
- Production-ready

## 📁 Output Structure & Data Storage

### Where Your Data Lives

**All directory data is stored as JSON files:**

```
your-directory-site/
├── app/
│   ├── page.tsx (Homepage - displays ALL items)
│   ├── [slug]/page.tsx (Individual item pages - reads one JSON file each)
│   ├── category/[category]/page.tsx (Category pages - filters JSON by category)
│   ├── tag/[tag]/page.tsx (Tag pages - filters JSON by tag)
│   ├── search/page.tsx (Search page - searches across all JSON)
│   ├── layout.tsx (Layout with header/footer)
│   └── sitemap.ts (Dynamic sitemap - lists all JSON files as pages)
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ItemCard.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── data.ts (Reads ALL JSON files from /public/sites/)
│   └── seo.ts (SEO utilities)
├── public/
│   └── sites/                    ← YOUR DATA STORED HERE
│       ├── item-1.json           (50 JSON files)
│       ├── item-2.json
│       ├── item-3.json
│       └── ... (47 more files)
├── package.json
└── next.config.js
```

### How Data is Used

**1. JSON files = Source of Truth**
- All your directory data lives in `/public/sites/*.json`
- Each JSON file = one item in your directory
- Files follow the schema created by `schema-creator` agent

**2. NextJS reads files at build time**
```typescript
// lib/data.ts reads ALL JSON files
export function getAllItems() {
  const sitesDirectory = path.join(process.cwd(), 'public/sites');
  const filenames = fs.readdirSync(sitesDirectory);

  return filenames.map(filename => {
    const fileContents = fs.readFileSync(path.join(sitesDirectory, filename), 'utf8');
    return JSON.parse(fileContents);
  });
}
```

**3. Pages are generated dynamically from JSON**
- **Homepage**: Shows all 50 items (reads all JSON files)
- **Individual pages**: Shows one item each (reads one JSON file)
- **Category pages**: Shows items filtered by category
- **Tag pages**: Shows items filtered by tags

**4. Categories and Tags are extracted automatically**
```typescript
// System reads all JSON files and extracts unique values
export function getAllCategories() {
  const items = getAllItems();
  const categories = new Set();
  items.forEach(item => {
    item.categories.forEach(cat => categories.add(cat));
  });
  return Array.from(categories);
  // Example: ["castles", "parks", "abbeys", "museums"]
}

export function getAllTags() {
  const items = getAllItems();
  const tags = new Set();
  items.forEach(item => {
    item.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
  // Example: ["family-friendly", "free-admission", "medieval", "outdoor", etc.]
}
```

### 🔄 Adding More Items Later (Easy!)

**Want to add more items after the initial build?**

**Option 1: Add JSON files manually**
```bash
# Just add a new JSON file to /public/sites/
# Make sure it follows the same schema

/public/sites/new-item.json
```

**Option 2: Run the system again**
```
You: "Add 20 more items to my directory"

Claude:
- Reads existing schema
- Spawns 4 data-generator agents (20 ÷ 5 = 4)
- Creates 20 new JSON files in /public/sites/
- You now have 70 items total
```

**Then rebuild:**
```bash
npm run build
```

**What happens automatically:**
- Homepage now shows 70 items (was 50)
- 20 new individual item pages created
- If new categories exist → new category pages created
- If new tags exist → new tag pages created
- Sitemap updated with all new pages
- All pages regenerated with new data

**Example:**
- Started with: 50 items = 90 pages
- Added: 20 items with 5 new tags
- Now have: 70 items = 115 pages (homepage + 70 items + categories + 45 tags)

### 📊 Data Flow

```
JSON FILES (Source of Truth)
    ↓
NextJS Build Process
    ↓
Reads all /public/sites/*.json
    ↓
Extracts categories and tags
    ↓
Generates Static Pages:
├── Homepage (all items)
├── Individual pages (one per JSON file)
├── Category pages (filtered by category)
└── Tag pages (filtered by tag)
    ↓
User visits site → Super fast static pages
```

### 🎯 Key Benefits

1. **JSON = Database**: No need for actual database, JSON files are your data store
2. **Easy to edit**: Just edit JSON files directly to update content
3. **Version control**: All data is in git, easy to track changes
4. **Portable**: Move your entire directory by copying JSON files
5. **Scalable**: Add as many JSON files as you want
6. **Static = Fast**: Pre-generated pages load instantly
7. **SEO-friendly**: All content is in HTML at build time

## 🚢 Deployment Options

### Vercel (Easiest)
```bash
cd your-directory-site
vercel deploy
```

### Digital Ocean App Platform
1. Push to GitHub (done automatically)
2. Connect repository in DO dashboard
3. Configure build settings
4. Deploy

### Netlify
```bash
cd your-directory-site
netlify deploy
```

### Traditional Hosting
```bash
npm run build
# Upload .next/out folder to hosting
```

## 💡 Use Cases

**Tourism & Travel:**
- Heritage sites directory
- Hotel/accommodation listings
- Restaurant guides
- Tourist attraction catalogs
- City guides

**Business:**
- Coworking space directories
- Office space listings
- Business service providers
- Consultant directories

**Local:**
- Coffee shop guides
- Bar/nightlife directories
- Shopping directories
- Service provider lists

**Niche:**
- Equipment rental catalogs
- Event venue directories
- Course/class listings
- Tool/resource directories

## 🎓 Why This Works

**Your 200k Context Window:**
- Manages entire workflow
- Coordinates all agents
- Tracks progress
- Ensures quality

**Specialized Agents:**
- Each has one job
- Works in own context
- No context pollution
- Expert-level output

**Parallel Execution:**
- 10 agents creating 5 items each
- 50 items in parallel
- 10x faster than sequential
- Scales to any size

**SEO-First Approach:**
- Every page optimized
- Clickbait titles
- Meta descriptions
- Comprehensive coverage
- Ranks on Google

## 🔥 Pro Tips

1. **More items = More pages = More traffic**
   - 50 items → 90+ pages
   - 100 items → 150+ pages
   - More pages = more chances to rank

2. **Let it generate the design**
   - Unless you have specific branding
   - Generated designs are beautiful
   - Optimized for conversion

3. **Use descriptive topics**
   - "Irish heritage sites" ✅
   - "Heritage sites" ❌ (too vague)

4. **Deploy immediately**
   - Get it live and start ranking
   - Iterate and improve later

5. **Add more data over time**
   - Run the system again with more items
   - Merge with existing site

## 🤝 Contributing

This is an open system! Improvements welcome:
- Better SEO strategies
- New page types
- Design templates
- Agent optimizations

## 📝 License

MIT - Use it, modify it, profit from it!

## 🙏 Credits

Built by [Income Stream Surfer](https://www.youtube.com/incomestreamsurfers)

Part of the Claude Code Agent Orchestration System v2.

Powered by:
- Claude Code's agent system
- Jina AI for research
- Next.js for blazing fast sites
- Tailwind CSS for beautiful designs

---

**Ready to build a directory?** Just run `claude` in this directory and say:
```
"Make me a directory about [YOUR TOPIC]"
```

🚀 From topic to deployed website in one shot!
