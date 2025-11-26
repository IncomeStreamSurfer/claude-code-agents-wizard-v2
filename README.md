Join the Skool - https://www.skool.com/iss-ai-automation-school-6342/about

# Claude Code SaaS App Generator 🚀

**From AI Studio Project to Production SaaS in One Automated Workflow**

Transform any Google AI Studio project OR your requirements into a complete, production-ready SaaS application with authentication, AI features, real-time database, and deployment - all automated with Claude Code agents.

## 🎯 What Does This Do?

**Give it:**
- An **AI Studio project folder** (exported from Google AI Studio)
- OR a **description of what you want to build**
- Your **Jina API key** (for documentation research)
- Your **AI provider API keys** (OpenAI, Google, Anthropic)

**Get:**
- Complete **Next.js SaaS application**
- **Clerk authentication** (sign-up, sign-in, protected routes)
- **Convex serverless backend** (real-time database)
- **AI features** using Vercel AI SDK (verified from real docs!)
- **User dashboard** with project management
- **File uploads** and storage
- Ready to **deploy** to Vercel or Digital Ocean

## ⚡ Prerequisites (MUST Complete First!)

### 1. Clone This Repository FIRST

```bash
# Clone the SaaS generator repository
git clone https://github.com/IncomeStreamSurfer/claude-code-agents-wizard-v2.git
cd claude-code-agents-wizard-v2

# Checkout the app-generator branch
git checkout app-generator

# Now create the Convex project INSIDE this folder
npx create-convex@latest my-saas-app

# Select these options:
# - Framework: Next.js (App Router)
# - Auth: Clerk

# Navigate to project
cd my-saas-app

# Copy the .claude folder from parent into your project
cp -r ../.claude ./

# Start once to initialize Convex dashboard
npm run dev
# Wait for it to open Convex dashboard, then Ctrl+C to stop
```

### 2. Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Give it a name and click "Create application"
4. Configure providers - recommend **Google** and **Email** for now
5. Copy the setup prompt shown (you'll give this to Claude Code)
6. Go to **Configure** (top right) → **JWT Templates**
7. Click **Add new template**
8. Name: `convex`, Type: Select `Convex`
9. Save the template

Your environment variables should include:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### 3. Get Your API Keys

**Jina AI** (required for documentation research):
- Get free key at [jina.ai](https://jina.ai)
- This is used to scrape real, current documentation

**AI Providers** (at least one required):
- **OpenAI**: [platform.openai.com](https://platform.openai.com)
- **Google AI**: [makersuite.google.com](https://makersuite.google.com)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)

## 🚀 Installation

If you followed the prerequisites above, you already have everything set up!

```bash
# You should already be in your project directory (my-saas-app)
# with the .claude folder copied in

# Start Claude Code
claude

# Then give it your inputs (see "Required Inputs" section below)
```

**Alternative: Add to existing Convex project**
```bash
# Clone generator repo somewhere
git clone https://github.com/IncomeStreamSurfer/claude-code-agents-wizard-v2.git
cd claude-code-agents-wizard-v2
git checkout app-generator

# Copy .claude to your existing project
cp -r .claude /path/to/your-existing-convex-project/

# Navigate to your project and start
cd /path/to/your-existing-convex-project
claude
```

## 📖 Usage

### Required Inputs (Have These Ready!)

Before starting, gather ALL of these:

```
1. CLERK CREDENTIALS (from clerk.com dashboard):
   - Clerk Domain: https://your-app-name.clerk.accounts.dev
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   - CLERK_SECRET_KEY=sk_test_xxxxx

2. AI PROVIDER API KEY (at least one):
   - Google AI: AIzaSyxxxxxxxxxxxxxxxxx (from makersuite.google.com)
   - OpenAI: sk-xxxxxxxxxxxxxxxx (from platform.openai.com)
   - Anthropic: sk-ant-xxxxxxxx (from console.anthropic.com)

3. JINA API KEY (for documentation research):
   - Get from jina.ai
   - Format: jina_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

4. CONVEX PROJECT DIRECTORY:
   - Path to your Convex+Next.js app (from npx create-convex@latest)
   - Example: /Users/yourname/my-saas-app

5. APP DESCRIPTION:
   - What should your app do?
   - Which AI model to use (e.g., "gemini-3-pro-image-preview")
```

### Example: Complete Input

Here's exactly what you'd give Claude Code:

```
Make me an app where a user can upload several images and then it uses
Google Gemini to generate 8 thumbnail variations using the images they
uploaded as a base image.

Clerk info:
- Domain: https://your-app.clerk.accounts.dev
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
- CLERK_SECRET_KEY=sk_test_xxxxx

Google AI API key: AIzaSyxxxxxxxxxxxxxxxxx

Jina API key: jina_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Convex Next.js app directory: /Users/yourname/my-thumbnail-app

Model to use: gemini-3-pro-image-preview
```

### Option A: Import AI Studio Project

If you have a project from Google AI Studio:

```
You: "I have an AI Studio project at ~/Downloads/my-ai-app. Build it as a SaaS.

Clerk info:
- Domain: https://my-app.clerk.accounts.dev
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
- CLERK_SECRET_KEY=sk_test_xxxxx

Google API key: AIzaSyxxxxxxxxxxxxxxxxx
Jina API key: jina_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Project directory: /Users/me/my-saas-app"

Claude: [Begins automated 10-step build process...]
```

### Option B: Build from Requirements

If you have an idea but no existing project:

```
You: "Build me a SaaS for generating marketing copy with AI

Clerk info:
- Domain: https://my-app.clerk.accounts.dev
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
- CLERK_SECRET_KEY=sk_test_xxxxx

OpenAI API key: sk-xxxxxxxxxxxxxxxx
Jina API key: jina_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Project directory: /Users/me/copywriter-saas

Features: templates, history, multiple tones"

Claude: [Begins automated 10-step build process...]
```

## 🔄 How It Works

### The Automated 10-Step Workflow

```
INPUT → DESIGN → ENV SETUP → RESEARCH → BACKEND → AI → LANDING PAGES → FRONTEND → TEST → DEPLOY → REPORT
```

| Step | Agent | What Happens |
|------|-------|--------------|
| 0 | Orchestrator | Collects all inputs (Clerk, API keys, Jina, directory) |
| 1 | design-generator | Creates beautiful SaaS UI (dashboard, landing, auth) |
| 2 | convex-builder | Sets up .env.local and enables Clerk in auth.config.ts |
| 3 | research-agent | Scrapes REAL documentation via Jina (model names, APIs) |
| 4 | convex-builder | Creates database schema, functions, file storage |
| 5 | ai-implementor | Implements AI features using VERIFIED model names |
| 6 | landing-page-generator | Spawns 5 agents IN PARALLEL to create 60+ SEO pages |
| 7 | nextjs-builder | Builds complete frontend using design + landing pages |
| 8 | tester | Playwright visual testing of all features |
| 9 | Orchestrator | Pushes to GitHub |
| 10 | Orchestrator | Reports what was built + deployment instructions |

**Step 1: Design Generation (NEW!)**
- Creates modern SaaS design system
- Dashboard UI with sidebar, stats, upload area, results grid
- Landing page with hero, CTAs, social proof
- Auth pages with split layout
- Dark mode support, Tailwind CSS

**Step 3: Research Phase (Critical!)**
- Research agent scrapes REAL documentation using Jina
- Sources: https://ai-sdk.dev, https://docs.convex.dev
- Verifies current model names, function signatures, imports
- **Never assumes - always verifies from docs**

**Step 6: Landing Page Generation (Growth Engine!)**
- Calculates 50-60+ landing pages needed
- Spawns 5 agents IN PARALLEL:
  - Agent 1: 12 feature pages
  - Agent 2: 12 use case pages
  - Agent 3: 12 industry pages
  - Agent 4: 12 comparison pages ("ChatGPT Alternative")
  - Agent 5: 12 problem/solution pages
- Each page has clickbait SEO title, CTAs, social proof

**Step 7: Next.js Frontend**
- Uses design from Step 1
- Builds pages with App Router
- Integrates Clerk authentication
- Creates dashboard matching design
- Builds ALL 60+ landing pages
- Connects to Convex real-time

## 🛠️ The Agent System

| Agent | Purpose |
|-------|---------|
| **Orchestrator** | Manages workflow, coordinates agents, handles GitHub |
| **design-generator** | Creates beautiful SaaS UI (dashboard, landing, auth) |
| **research-agent** | Scrapes real docs via Jina - never guesses model names |
| **project-importer** | Analyzes AI Studio projects |
| **convex-builder** | Creates serverless backend + env setup |
| **ai-implementor** | Implements AI features from verified docs |
| **landing-page-generator** | Creates 10-15 SEO pages (spawned in parallel!) |
| **nextjs-builder** | Builds frontend using design + landing pages |
| **tester** | Playwright visual testing |
| **stuck** | Human escalation for problems |

## 📁 Output Structure

```
your-saas-app/
├── design/                         # Generated design system
│   ├── design-system.css           # Colors, typography, spacing
│   ├── dashboard.html              # Dashboard UI design
│   ├── landing.html                # Landing page design
│   ├── auth.html                   # Auth pages design
│   └── components.html             # Component examples
├── landing-pages/                  # SEO landing page data
│   ├── features/                   # Feature pages JSON
│   ├── use-cases/                  # Use case pages JSON
│   ├── industries/                 # Industry pages JSON
│   ├── comparisons/                # "Alternative to X" pages JSON
│   └── problems/                   # Problem/solution pages JSON
├── research/                       # Scraped documentation
│   ├── ai-sdk-docs.md
│   ├── provider-docs.md
│   └── implementation-guide.md
├── app/
│   ├── page.tsx                    # Homepage (uses design)
│   ├── layout.tsx                  # Root layout with providers
│   ├── sign-in/[[...sign-in]]/     # Clerk sign in
│   ├── sign-up/[[...sign-up]]/     # Clerk sign up
│   ├── dashboard/                  # Dashboard (matches design)
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── (marketing)/                # Landing pages (60+ pages!)
│   │   ├── features/[slug]/
│   │   ├── use-cases/[slug]/
│   │   ├── industries/[slug]/
│   │   ├── vs/[slug]/              # Comparison pages
│   │   └── solutions/[slug]/
│   ├── sitemap.ts                  # All 60+ pages in sitemap
│   └── api/ai/                     # AI API routes
├── components/
│   ├── landing/                    # Landing page components
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   └── CTA.tsx
│   └── dashboard/                  # Dashboard components
│       ├── Sidebar.tsx
│       ├── StatsCard.tsx
│       └── UploadArea.tsx
├── convex/
│   ├── schema.ts                   # Database schema
│   ├── uploads.ts                  # File storage
│   └── ai/                         # AI actions
└── lib/ai/
    ├── providers.ts                # AI provider config
    └── models.ts                   # Model definitions (from docs!)
```

## 🔑 Environment Variables

Your `.env.local` will need:

```bash
# Convex (auto-configured by create-convex)
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# AI Providers (at least one required)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**Important:** After building, you MUST set the Clerk JWT domain in Convex Dashboard:
```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Digital Ocean
```bash
doctl apps create --spec .do/app.yaml
```

Or tell Claude Code to deploy for you!

## 💡 Why This Stack?

### Convex - Serverless Backend
- **No server to manage** - Convex handles infrastructure
- **Real-time by default** - Data syncs instantly across clients
- **Better security** - Backend logic runs on Convex's secure servers
- **Type safety** - Full TypeScript support end-to-end

### AI SDK - Unified AI Interface
- **One interface, all providers** - Same code for OpenAI, Google, Anthropic
- **Streaming built-in** - Real-time AI responses
- **React hooks** - useChat, useCompletion ready to use
- **Edge-ready** - Works with serverless functions

### Clerk - Authentication
- **Ready in minutes** - OAuth, email, social login
- **Secure by default** - Handles sessions, tokens, security
- **Beautiful UI** - Customizable sign-in/up components
- **Convex integration** - JWT templates for seamless auth

## 🎓 Resources

- **[AI SDK Documentation](https://ai-sdk.dev/docs)** - Vercel AI SDK
- **[Convex Documentation](https://docs.convex.dev)** - Convex backend
- **[Clerk Documentation](https://clerk.com/docs)** - Authentication
- **[ISS AI Automation School](https://www.skool.com/iss-ai-automation-school-6342/about)** - Community

## 🤝 Contributing

Improvements welcome:
- New agent types
- Better prompts
- Additional providers
- UI templates

## 📝 License

MIT - Use it, modify it, profit from it!

## 🙏 Credits

Built by [Income Stream Surfer](https://www.youtube.com/incomestreamsurfers)

Powered by:
- Claude Code's agent system
- Jina AI for documentation research
- Vercel AI SDK
- Convex serverless backend
- Clerk authentication
- Next.js App Router

---

**Ready to build a SaaS?**

1. Complete the prerequisites (Convex + Clerk setup)
2. Copy the `.claude` folder to your project
3. Run `claude` in your project directory
4. Tell Claude what you want to build!

```
"Build me a SaaS for [YOUR IDEA]"
```

or

```
"Import my AI Studio project from [PATH]"
```

🚀 From idea to production SaaS in one automated workflow!
