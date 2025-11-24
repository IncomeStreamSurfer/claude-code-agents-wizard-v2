# Claude Code Service Website Generator 🚀

**One-Shot Service Website Builder**: From service niche to deployed website with hundreds of local SEO pages in one automated workflow.

Turn any service business into a complete, SEO-optimized service website with just a service niche, service area, and Jina API key. The system automatically discovers locations, researches services, generates 200-500+ service+location pages with Unsplash images, and deploys a full NextJS website optimized for local SEO and Google rankings.

## 🎯 What Does This Do?

Give it:
- **A service niche** ("Plumber", "Electrician", "Carpet Cleaning", "HVAC", "Roofing")
- **A service area** ("Galway, Ireland", "Austin, Texas", "Manchester, UK")
- **Your business name** (optional - for personalized content with real business info)
- **Jina API key** (for research and Unsplash image scraping)
- **HTML/CSS/JS design** (optional - it'll generate one if you don't have it)

Get:
- **Complete NextJS service website**
- **200-500+ SEO-optimized pages** (homepage, service pages, location pages, service+location combinations)
- **Real Unsplash images** on every page (3-5 per page, free images only)
- **Personalized content** with your real business info, reviews, and testimonials (if business name provided)
- **Complete database setup** - Local PostgreSQL + Digital Ocean Managed PostgreSQL with Prisma ORM
- **Working contact forms** connected to database (contact, quote requests, callback requests)
- **Comprehensive local SEO** for every service in every location
- **Clickbait titles** optimized for Google ("Emergency Plumber Athenry - 24/7 Fast Response")
- **Dynamic routing** for all service+location combinations
- **Click-to-call functionality** and trust signals
- **Responsive design** with strong CTAs
- **Ready to deploy** to Digital Ocean (database auto-configured)

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

# Checkout the service-website-generator branch
git checkout service-website-generator

# Start Claude Code in this directory
claude
```

## 🚀 Usage

Once Claude Code is running in this directory:

```
You: "Make me a service website for [SERVICE NICHE] in [SERVICE AREA]"
```

**Claude will ask you for:**
1. **Service Niche** - What service business (e.g., "Plumber", "Electrician")
2. **Service Area** - Main city/region (e.g., "Galway, Ireland", "Austin, Texas")
3. **Business Name** (Optional) - Your actual business name for personalization
4. **Jina API Key** - For research and Unsplash images
5. **HTML/CSS/JS design** (Optional) - Provide your own OR let the system generate one

**Then Claude automatically:**
1. Researches your business (if name provided) - gathers real info, reviews, testimonials
2. Generates/saves design (if needed)
3. Discovers 20-50+ locations within service radius
4. Researches service niche and creates 5-15 common services
5. Sets up complete database (local PostgreSQL + Digital Ocean Managed PostgreSQL)
6. Spawns 20-30 parallel agents to generate all service+location pages with free Unsplash images
7. Builds complete NextJS website with working forms and database integration
8. Tests with Playwright
9. Pushes to GitHub
10. Gives you deployment instructions

## 📖 Example Session

```
You: "Make me a service website for plumbers in Galway"

Claude: "Great! I'll help you build a service website for plumbers in Galway. I need:
1. ✅ Service Niche: Plumber
2. ✅ Service Area: Galway, Ireland
3. ❓ What's your Jina API key?
4. ❓ Do you have HTML/CSS/JS design code, or should I generate one?"

You: "Here's my Jina key: jina_xxxxx. Generate a design for me."

Claude:
✅ Generating service-focused design...
✅ Discovering locations in Galway area (50km radius)...
✅ Found 30 locations: Athenry, Oranmore, Loughrea, Tuam, etc.
✅ Researching plumbing services...
✅ Found 10 common services: Emergency Plumbing, Bathroom Installation, Drain Cleaning, etc.
✅ Calculating pages: 10 services × 30 locations = 300 pages
✅ Spawning 25 page generator agents in parallel...
✅ Scraping Unsplash for images via Jina...
✅ Building NextJS website...
✅ Testing with Playwright...
✅ Pushing to GitHub...

COMPLETE! Your plumbing service website is ready:
- 300 service+location pages generated
- 10 services covered
- 30 locations covered in Galway area
- All pages with 3-5 Unsplash images
- 350+ total pages including main pages
- All optimized for local SEO:
  * "Emergency Plumber Athenry - 24/7 Fast Response"
  * "Bathroom Installation Oranmore - Free Quote"
  * "Drain Cleaning Loughrea - Same Day Service"
- GitHub: https://github.com/you/plumber-galway
- Deploy: vercel deploy or push to Digital Ocean
```

## 🏗️ How It Works

### The Automated Workflow

```
USER INPUT → BUSINESS RESEARCH → DESIGN → LOCATIONS → SERVICES → DATABASE → PAGES (PARALLEL + UNSPLASH) → NEXTJS → TEST → GITHUB
```

**Step 1: Business Research (if business name provided)**
- `business-researcher` agent researches your actual business
- Scrapes official website, Google Reviews, business directories
- Gathers real company history, qualifications, testimonials
- Collects team info, awards, unique selling points
- Saves comprehensive business profile for personalization

**Step 2: Design Generation (if needed)**
- `design-generator` agent creates service-focused HTML/CSS/JS design
- Includes trust signals, testimonials, CTAs, click-to-call
- Or uses your provided design

**Step 3: Location Discovery**
- `location-generator` agent researches service area
- Discovers 20-50+ locations within appropriate radius
- Uses logic: Ireland/UK = 50km, US = 30 miles, adjusts for service type
- Creates comprehensive locations list

**Step 4: Service Schema Creation**
- `service-schema-creator` agent researches service niche
- Identifies 5-15 common services (e.g., for plumbers: Emergency, Bathroom Installation, Drain Cleaning, etc.)
- Creates comprehensive JSON schema for service pages
- Includes fields for: descriptions, benefits, process, FAQs, images, SEO

**Step 5: Database Setup**
- `database-agent` sets up complete database infrastructure
- Installs/checks doctl CLI for Digital Ocean
- Sets up local PostgreSQL (Docker or native) for development
- Provisions Digital Ocean Managed PostgreSQL for production
- Configures Prisma ORM with comprehensive schema
- Creates tables: ContactForm, QuoteRequest, CallbackRequest, PageView, EmailSubscriber
- Sets up API routes for all forms
- Configures environment variables
- Creates helper functions and documentation

**Step 6: Parallel Page Generation with Unsplash**
- Spawns N `service-page-generator` agents simultaneously
- Each agent creates 10-15 service+location page combinations
- 10 services × 30 locations = 300 pages = 25 agents in parallel
- **Each agent scrapes Unsplash via Jina for 3-5 FREE images per page** (no premium images)
- All pages get unique content optimized for local SEO
- Business personalization applied if business profile exists

**Step 7: NextJS Website Build**
- `nextjs-builder` agent creates complete site
- **SEO-OPTIMIZED pages:**
  - Homepage with service overview
  - Main services page
  - Main locations page
  - Individual service+location pages (300+)
  - Service category pages
  - Location pages
- All pages have clickbait meta titles/descriptions
- Click-to-call buttons throughout
- Trust signals and strong CTAs
- Sitemap with all pages
- Schema.org markup
- Dynamic routing

- All pages integrated with database forms
- Business profile data incorporated throughout

**Step 8: Playwright Testing**
- Tests all page types for errors
- Validates local SEO meta tags
- Checks Unsplash images load correctly
- Tests click-to-call functionality
- Tests form submissions to database
- Verifies mobile responsiveness

**Step 9: GitHub Deployment**
- Orchestrator pushes to GitHub
- Returns repository URL
- Provides deployment instructions

## 🎨 SEO Features (The Whole Point!)

### Every Service Website Gets 200-500+ Pages

**Example: Plumber in Galway with 10 services and 30 locations:**
- 1 homepage
- 1 main services page
- 1 main locations page
- 10 service category pages
- 30 location pages
- 300 service+location combination pages
- **Total: 343 pages** all optimized for local SEO

### Clickbait Titles for Google Rankings

**Service+Location Pages (Target "Service in Location"):**
- "Emergency Plumber Athenry - 24/7 Fast Response | Call Now"
- "Bathroom Installation Galway - Transform Your Bathroom | Free Quote"
- "Drain Cleaning Oranmore - Same Day Service Available"

**Service Category Pages:**
- "Emergency Plumbing Services in Galway - 24/7 Response"
- "Bathroom Installation Services - Expert Fitters Across Galway"

**Location Pages:**
- "Plumbing Services in Athenry - All Plumbing Needs Covered"
- "Local Plumbers Serving Oranmore - Fast, Reliable Service"

### Complete Local SEO Implementation

- ✅ Unique meta title for every page with location
- ✅ Compelling meta description for every page
- ✅ Location mentioned 3-5 times in page content
- ✅ Service-specific keywords throughout
- ✅ Sitemap.xml with all pages
- ✅ robots.txt
- ✅ Schema.org JSON-LD markup for local business
- ✅ Open Graph tags
- ✅ Click-to-call buttons
- ✅ Trust signals (qualifications, guarantees, years experience)
- ✅ Real Unsplash images (3-5 per page)

## 🛠️ The Agent System

### Main Orchestrator (CLAUDE.md)
- Collects user inputs (including optional business name)
- Coordinates all agents
- Manages workflow
- Handles testing and GitHub deployment

### business-researcher
- Researches specific business when name provided
- Scrapes official website, Google Reviews, directories
- Gathers real company history and background
- Collects genuine testimonials and reviews
- Verifies qualifications and certifications
- Identifies unique selling points
- Personalizes entire website with real data

### design-generator
- Creates service-focused HTML/CSS/JS design
- Tailwind CSS based
- Includes trust signals, CTAs, click-to-call
- Service-business optimized

### location-generator
- Discovers locations in service area
- Uses appropriate radius (50km for Ireland, 30 miles for US, etc.)
- Finds 20-50+ towns, cities, suburbs, neighborhoods
- Creates comprehensive locations list with metadata

### service-schema-creator
- Researches service niche
- Identifies 5-15 common services
- Creates comprehensive page schema
- Defines content structure for all pages

### database-agent
- Sets up local PostgreSQL (Docker or native)
- Provisions Digital Ocean Managed PostgreSQL
- Configures Prisma ORM with full schema
- Creates 5 database tables
- Sets up API routes for forms
- Creates helper functions
- Configures local + production environments
- Seamless dev-to-prod workflow

### service-page-generator (Parallel Agents)
- Spawned 20-30 at once
- Each creates 10-15 service+location pages
- **Scrapes Unsplash via Jina** for 3-5 **FREE** images per page (no premium)
- Generates unique, location-specific content
- Incorporates business profile data if available
- Follows schema exactly
- Real, comprehensive data

### nextjs-builder
- Converts design to NextJS
- Generates ALL pages
- Local SEO optimization
- Dynamic routing
- Click-to-call functionality
- Trust signals and CTAs
- Responsive
- Production-ready

### playwright-tester
- Tests all page types
- Validates local SEO
- Checks Unsplash images load
- Tests click-to-call buttons
- Verifies mobile responsiveness
- Reports errors and issues

## 📁 Output Structure

```
your-service-site/
├── app/
│   ├── page.tsx (Homepage)
│   ├── services/page.tsx (Main services page)
│   ├── locations/page.tsx (Main locations page)
│   ├── [service-slug]/page.tsx (Service category pages)
│   ├── [location-slug]/page.tsx (Location pages)
│   ├── [service-slug]-[location-slug]/page.tsx (Service+location pages - 300+)
│   ├── layout.tsx (Layout with header/footer, click-to-call)
│   └── sitemap.ts (Dynamic sitemap)
├── components/
│   ├── Header.tsx (with click-to-call button)
│   ├── Footer.tsx
│   ├── ServiceCard.tsx
│   ├── LocationCard.tsx
│   ├── TrustSignals.tsx
│   └── CTAButton.tsx
├── lib/
│   ├── data.ts (Reads ALL JSON files from /public/pages/)
│   └── seo.ts (Local SEO utilities)
├── public/
│   └── pages/                    ← YOUR DATA STORED HERE
│       ├── emergency-plumber-athenry.json
│       ├── emergency-plumber-oranmore.json
│       ├── bathroom-installation-athenry.json
│       └── ... (300 JSON files)
├── package.json
└── next.config.js
```

## 🚢 Deployment Options

### Vercel (Easiest)
```bash
cd your-service-site
vercel deploy
```

### Digital Ocean App Platform
1. Push to GitHub (done automatically)
2. Connect repository in DO dashboard
3. Configure build settings
4. Deploy

### Netlify
```bash
cd your-service-site
netlify deploy
```

## 💡 Use Cases

**Home Services:**
- Plumbing services
- Electrical services
- HVAC companies
- Roofing contractors
- Landscaping services
- Cleaning services
- Handyman services

**Professional Services:**
- Legal services
- Accounting services
- Real estate agents
- Insurance agents
- Financial advisors

**Specialty Services:**
- Pest control
- Pool services
- Locksmith services
- Appliance repair
- Auto repair

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
- 25 agents creating 12 pages each
- 300 pages in parallel
- 25x faster than sequential
- Scales to any size

**Local SEO-First Approach:**
- Every page optimized for "service + location"
- Hundreds of keyword combinations
- Clickbait titles
- Real Unsplash images
- Comprehensive coverage
- Ranks on Google for local searches

**Unsplash Integration:**
- Real, high-quality images on every page
- Scraped automatically via Jina
- Proper attribution
- Professional appearance
- Builds trust with visitors

## 🔥 Pro Tips

1. **More locations = More pages = More traffic**
   - 20 locations × 10 services = 200 pages
   - 50 locations × 10 services = 500 pages
   - More pages = more chances to rank

2. **Let it generate the design**
   - Unless you have specific branding
   - Generated designs are service-focused
   - Optimized for conversions

3. **Use specific service areas**
   - "Plumber in Galway" ✅
   - "Plumber" ❌ (too vague)

4. **Deploy immediately**
   - Get it live and start ranking
   - Iterate and improve later

5. **Target multiple service types**
   - Run the system for different services
   - Build multiple sites for different niches

## 🤝 Contributing

This is an open system! Improvements welcome:
- Better local SEO strategies
- New service types
- Design templates
- Agent optimizations

## 📝 License

MIT - Use it, modify it, profit from it!

## 🙏 Credits

Built by [Income Stream Surfer](https://www.youtube.com/incomestreamsurfers)

Part of the Claude Code Agent Orchestration System v2.

Powered by:
- Claude Code's agent system
- Jina AI for research and Unsplash scraping
- Unsplash for high-quality images
- Next.js for blazing fast sites
- Tailwind CSS for beautiful designs

---

**Ready to build a service website?** Just run `claude` in this directory and say:
```
"Make me a service website for [SERVICE] in [CITY]"
```

🚀 From service niche to deployed website with 300+ local SEO pages in one shot!
