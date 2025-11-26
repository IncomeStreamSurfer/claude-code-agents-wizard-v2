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

### 1. Set Up Convex + Next.js Project

```bash
# Create new Convex + Next.js project
npx create-convex@latest my-saas-app

# Select these options:
# - Framework: Next.js (App Router)
# - Auth: Clerk

# Navigate to project
cd my-saas-app

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

```bash
# Clone this repository
git clone https://github.com/IncomeStreamSurfer/claude-code-agents-wizard-v2.git
cd claude-code-agents-wizard-v2

# Checkout the app-generator branch
git checkout app-generator

# Copy the .claude folder to your Convex project
cp -r .claude /path/to/your-saas-project/

# Navigate to your project
cd /path/to/your-saas-project

# Start Claude Code
claude
```

## 📖 Usage

### Option A: Import AI Studio Project

If you have a project from Google AI Studio:

```
You: "I have an AI Studio project at ~/Downloads/my-ai-app. Build it as a SaaS."

Claude: "Great! Let me verify your setup:
1. Have you completed Convex + Clerk setup?
2. What's your Jina API key?
3. Which AI providers? (OpenAI/Google/Anthropic)
4. Confirmed project path: ~/Downloads/my-ai-app"

You: "Yes, setup complete. Jina: jina_xxx. Use OpenAI and Google."

Claude: [Begins automated build process...]
```

### Option B: Build from Requirements

If you have an idea but no existing project:

```
You: "Build me a SaaS for generating marketing copy with AI"

Claude: "Great! I'll help you build an AI marketing copy generator. Let me verify:
1. Have you completed Convex + Clerk setup?
2. What's your Jina API key?
3. Which AI providers would you like?
4. Any specific features you want?"

You: "Setup done. Jina: jina_xxx. Use all providers. I want templates and history."

Claude: [Begins automated build process...]
```

## 🔄 How It Works

### The Automated Workflow

```
USER INPUT → RESEARCH → IMPORT/ANALYZE → CONVEX BACKEND → AI IMPLEMENTATION → NEXT.JS FRONTEND → TEST → DEPLOY
```

**Step 1: Research Phase (Critical!)**
- Research agent scrapes REAL documentation using Jina
- Sources: https://ai-sdk.dev, https://docs.convex.dev
- Verifies current model names, function signatures, imports
- **Never assumes - always verifies from docs**

**Step 2: Project Analysis**
- If AI Studio project: Analyzes React code, identifies AI features, maps to Next.js
- If requirements: Creates feature breakdown and data models

**Step 3: Convex Backend**
- Creates database schema (users, projects, AI generations, files)
- Builds queries, mutations, actions
- Sets up file storage
- Creates AI action wrappers

**Step 4: AI Implementation**
- **Reads research docs first (mandatory!)**
- Implements providers with verified model names
- Creates API routes and hooks
- Never guesses - uses exact documentation

**Step 5: Next.js Frontend**
- Builds pages with App Router
- Integrates Clerk authentication
- Creates dashboard and AI UIs
- Connects to Convex real-time

**Step 6: Testing & Deployment**
- Playwright visual testing
- Verifies auth flow, AI features, database operations
- Ready for Vercel or Digital Ocean deployment

## 🛠️ The Agent System

| Agent | Purpose |
|-------|---------|
| **Orchestrator** | Manages workflow, coordinates agents |
| **research-agent** | Scrapes real docs via Jina - runs FIRST |
| **project-importer** | Analyzes AI Studio projects |
| **convex-builder** | Creates serverless backend |
| **ai-implementor** | Implements AI features from verified docs |
| **nextjs-builder** | Builds frontend with Clerk auth |
| **tester** | Playwright visual testing |
| **stuck** | Human escalation for problems |

## 📁 Output Structure

```
your-saas-app/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout with providers
│   ├── providers.tsx               # Clerk + Convex providers
│   ├── sign-in/[[...sign-in]]/     # Clerk sign in
│   ├── sign-up/[[...sign-up]]/     # Clerk sign up
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard home
│   │   ├── layout.tsx              # Dashboard layout
│   │   ├── projects/               # Project management
│   │   ├── ai/                     # AI tools
│   │   └── settings/               # User settings
│   └── api/ai/                     # AI API routes
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ai/Chat.tsx
│   └── ai/Generator.tsx
├── convex/
│   ├── schema.ts                   # Database schema
│   ├── users.ts                    # User functions
│   ├── projects.ts                 # Project CRUD
│   ├── files.ts                    # File storage
│   └── ai/generate.ts              # AI actions
├── lib/ai/
│   ├── providers.ts                # AI provider config
│   └── models.ts                   # Model definitions (from docs!)
├── hooks/useAI.ts                  # AI React hooks
└── research/                       # Scraped documentation
    ├── ai-sdk-docs.md
    ├── provider-docs.md
    └── convex-docs.md
```

## 🔑 Environment Variables

Your `.env.local` will need:

```bash
# Convex (auto-configured)
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI Providers (as selected)
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
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
