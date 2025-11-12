# Autonomous Business Builder 🚀

An autonomous company of AI agents that can ideate, design, implement, and deploy complete business applications from scratch.

## 🎯 What Is This?

This is a **fully autonomous business-building system** powered by Claude Code's agent orchestration. A complete "company" of specialized AI agents work together to transform ideas into production-ready applications:

- **CPO** handles product vision
- **Sr Product Manager** creates PRDs (yes, actual PRDs)
- **Marketing Agent** does brand identity and color palettes
- **UX Designer** builds style guides
- **Product Designer** turns those into UI designs
- **Software Architect** creates implementation plans and manages Linear tickets
- **DBA** designs and implements database schemas (Convex)
- **Frontend Developer** builds Next.js UIs with real-time Convex integration
- **Backend Developer** implements Convex functions and external APIs
- **App Security Engineer** reviews commits and code scanning, secret scanning, and vulnerability scanning
- **Sr QA Engineer** writes test plans and executes integration testing and Playwright tests
- **DevOps Engineer** handles infrastructure as code and deploys to Digital Ocean

And most importantly:
- **Stuck Agent** - Your direct line to control. The ONLY time agents stop to ask you questions is when they hit a true blocker or need an API key.

## ⚡ Key Features

- **Semi-Autonomous**: Agents work independently but escalate to you for critical decisions, API keys, or technical blockers
- **NO Fallbacks**: When agents hit problems, they ask you - no assumptions, no workarounds, no placeholders
- **NO Hardcodes**: Everything uses environment variables - prices, config, API keys, everything
- **Production-Ready**: Deploys actual working applications to Digital Ocean
- **Integrated Tooling**: Uses Stripe CLI, Digital Ocean CLI, GitHub CLI, Linear API, Playwright
- **Real Testing**: QA agent actually runs the app, monitors logs, and uses Playwright for visual verification
- **Convex Dashboard Monitoring**: Backend and QA agents use Playwright to open and verify the Convex dashboard

## 🚀 Quick Start

### Prerequisites

1. **Claude Code CLI** installed ([get it here](https://docs.claude.com/en/docs/claude-code))
2. **Node.js 18+**
3. **API Keys** (agents will ask when needed):
   - OpenRouter API key (for AI features)
   - Stripe keys (if building payment features)
   - GitHub token (for repo management)
   - Digital Ocean token (for deployment)
   - Linear API key (for ticket management)

### Installation

```bash
# Clone this repository
cd autonomous-business-builder

# Start Claude Code
claude
```

That's it! The agents are automatically loaded from `.claude/`

## 📖 How to Use

### Building a Business

Just tell Claude what you want to build:

```
You: "Build a SaaS platform for [your idea]"
```

Claude will automatically:
1. Create a detailed todo list for the entire pipeline
2. Invoke **cpo** to refine the business idea
3. Invoke **product-manager** to create a comprehensive PRD
4. Invoke **marketing** for brand identity
5. Invoke **ux-designer** for style guide
6. Invoke **product-designer** for UI designs
7. Invoke **software-architect** for technical plan + Linear tickets
8. Invoke **dba** to implement database schema
9. Invoke **frontend-dev** to build Next.js UI
10. Invoke **backend-dev** to implement Convex functions
11. Invoke **security-engineer** for security review
12. Invoke **qa-engineer** to test everything (runs app + Playwright tests)
13. Invoke **devops-engineer** to deploy to production

At any point, if an agent needs input, they'll invoke the **stuck agent** who will ask you clear questions with specific options.

### The Workflow

```
YOU: "Build X"
    ↓
ORCHESTRATOR: Creates comprehensive todos
    ↓
CPO: Business idea and market analysis
    ↓
PRODUCT MANAGER: Detailed PRD
    ↓
MARKETING: Brand guidelines
    ↓
UX DESIGNER: Style guide & design system
    ↓
PRODUCT DESIGNER: Complete UI designs
    ↓
SOFTWARE ARCHITECT: Technical architecture + Linear tickets
    ↓
DBA: Implements Convex schema
    ↓
FRONTEND DEV: Builds Next.js pages
    ↓
BACKEND DEV: Implements Convex functions
    │   Uses Playwright to verify Convex dashboard
    ↓
SECURITY ENGINEER: Security review
    ↓
QA ENGINEER: Runs app, monitors logs, Playwright tests
    │   Uses Playwright to test UI and Convex dashboard
    ↓
DEVOPS ENGINEER: Deploys to Digital Ocean
    ↓
DONE: Live production application! ✅
```

## 🛠️ How It Works

### Agent Architecture

Each agent is defined in `.claude/agents/*.md` with:
- **name**: Agent identifier
- **description**: What they do
- **tools**: Tools they have access to
- **model**: AI model (sonnet for most)

### The Orchestrator

The main `CLAUDE.md` file instructs Claude to act as the orchestrator with its 200k context window. It maintains the big picture and delegates tasks to specialized agents.

### Communication Flow

Agents communicate via document handoffs:
- CPO creates `business-concept.md`
- PM creates `prd.md`
- Marketing creates `brand-guidelines.md`
- UX creates `style-guide.md`
- Designer creates `ui-designs.md`
- Architect creates `technical-architecture.md`
- Etc...

Each agent reads previous outputs and creates the next deliverable.

### The "Stuck" Agent

This is the **safety net**. ANY agent that hits a problem invokes the stuck agent, which is the ONLY agent that can ask you questions. This ensures:
- No silent failures
- No placeholder implementations
- No blind workarounds
- You stay in control

## 📁 Repository Structure

```
.
├── .claude/
│   ├── CLAUDE.md                     # Main orchestrator instructions
│   ├── AGENT_MEMORY.md              # Shared agent context (Jina info, etc.)
│   └── agents/
│       ├── cpo.md                   # Chief Product Officer
│       ├── product-manager.md       # Sr Product Manager
│       ├── marketing.md             # Marketing Agent
│       ├── ux-designer.md           # UX Designer
│       ├── product-designer.md      # Product Designer
│       ├── software-architect.md    # Software Architect
│       ├── dba.md                   # Database Administrator
│       ├── frontend-dev.md          # Frontend Developer
│       ├── backend-dev.md           # Backend Developer
│       ├── security-engineer.md     # Security Engineer
│       ├── qa-engineer.md           # QA Engineer
│       ├── devops-engineer.md       # DevOps Engineer
│       └── stuck.md                 # Human escalation agent
├── .mcp.json                        # Playwright MCP configuration
├── .gitignore
└── README.md
```

## 🎓 Technology Stack

All businesses are built with:
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Convex (serverless functions + real-time DB)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Payments**: Stripe (when applicable)
- **Hosting**: Digital Ocean App Platform
- **CI/CD**: GitHub Actions
- **Testing**: Playwright

## 🚨 The "No Fallbacks" Rule

**This is the key differentiator:**

Traditional AI: Hits error → tries workaround → might fail silently
**This system**: Hits error → asks you → you decide → proceeds correctly

Every agent is **hardwired** to invoke the stuck agent rather than use fallbacks. You stay in control.

## 💡 Example Session

```
You: "Build a todo app with team collaboration features"

Orchestrator creates todos:
  [ ] CPO - Refine business idea
  [ ] Product Manager - Create PRD
  [ ] Marketing - Brand identity
  [in progress] UX Designer - Style guide
  [ ] Product Designer - UI designs
  [ ] Software Architect - Technical plan
  [ ] DBA - Database schema
  [ ] Frontend Dev - Next.js UI
  [ ] Backend Dev - Convex functions
  [ ] Security - Security review
  [ ] QA - Test everything
  [ ] DevOps - Deploy to production

CPO (in own context): Researches market, creates business concept
→ Returns: business-concept.md

Product Manager (in own context): Creates comprehensive PRD
→ Returns: prd.md

Marketing (in own context): ERROR - Need brand direction
→ Invokes stuck agent

Stuck Agent asks YOU:
  "The todo app can be positioned as:
   - Professional/Enterprise (serious, productivity-focused)
   - Fun/Casual (playful, colorful, friendly)
   - Minimal/Zen (calm, focused, simple)
   Which direction for the brand?"

You choose: "Fun/Casual"

Stuck: Returns your decision to Marketing

Marketing: Proceeds with fun/casual brand identity
→ Returns: brand-guidelines.md

UX Designer: Creates playful design system
→ Returns: style-guide.md

... continues through entire pipeline ...

Backend Dev: Implements functions, uses Playwright to verify Convex dashboard
→ Screenshot: Functions deployed ✓
→ Screenshot: Database tables created ✓
→ Screenshot: Function logs show no errors ✓

QA Engineer: Runs app locally, monitors logs, runs Playwright tests
→ npm run dev: Server started ✓
→ npx convex dev: Backend running ✓
→ Playwright test: Homepage loads ✓
→ Playwright test: Login works ✓
→ Screenshot: All tests passing ✓
→ Returns: test-report.md

DevOps: Deploys to Digital Ocean
→ App deployed to: https://todo-collab.ondigitalocean.app

DONE! Your todo collaboration app is LIVE! ✅
```

## 📝 Environment Variables

ALL configuration uses environment variables. The system creates:
- `.env.example` with all required variables
- Digital Ocean app-wide variables for production
- GitHub secrets for CI/CD

Example:
```bash
# Application
NEXT_PUBLIC_APP_NAME=TodoCollab
NEXT_PUBLIC_APP_URL=https://todo-collab.ondigitalocean.app

# Convex
CONVEX_DEPLOYMENT=prod:...
NEXT_PUBLIC_CONVEX_URL=https://...

# Stripe (if applicable)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Auth
AUTH_SECRET=...
```

**NO HARDCODED VALUES EVER!**

## 🔍 Jina Integration

ALL agents have access to Jina for documentation lookup:

```bash
# Search for docs
curl "https://s.jina.ai/?q=Stripe+llm.txt" \
  -H "Authorization: Bearer jina_db539c74a0c04d69bd7307c388a042809H-c8gFGa6pNMBfg43XKn6C4sHWc"

# Fetch specific page
curl "https://r.jina.ai/https://docs.stripe.com/api" \
  -H "Authorization: Bearer jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo"
```

Agents use this to research best practices, find implementation guides, and lookup API documentation.

## ⚙️ CLI Integrations

### GitHub CLI (`gh`)
DevOps agent uses this for:
- Repository creation
- Secrets management
- GitHub Actions setup

### Digital Ocean CLI (`doctl`)
DevOps agent uses this for:
- App creation and deployment
- Environment variable configuration
- Domain and SSL setup

### Linear CLI (`linear`)
Software Architect uses this for:
- Creating project and tickets
- Assigning tasks to dev agents
- Tracking progress

### Stripe CLI (`stripe`)
Backend developer uses this for:
- Webhook testing locally
- Event simulation

## 🎯 Best Practices

1. **Let the agents work** - They'll ask when they need you
2. **Provide clear direction** - When stuck agent asks, be specific
3. **Have your API keys ready** - Stripe, OpenRouter, GitHub, DO, Linear
4. **Trust the process** - Each agent specializes in their domain
5. **Review the deliverables** - Check PRDs, designs, and test reports

## 🔥 Pro Tips

- Agents maintain context through document handoffs
- The orchestrator tracks progress with todos
- Each agent gets a fresh context for their specialized task
- Playwright tests are actually visual - screenshots prove functionality
- Backend and QA agents open Convex dashboard to verify deployments
- QA agent actually runs the app and monitors logs in real-time
- Security review happens automatically before deployment
- Everything deploys with proper CI/CD

## 🆘 Troubleshooting

### Agent won't start
Check that you're in the `autonomous-business-builder` directory

### Agent asks for API key
This is normal! Provide the requested key. The stuck agent will guide you.

### Build fails
The stuck agent will ask you how to proceed. Common issues:
- Missing dependencies
- Environment variables not set
- Package conflicts

### Deployment fails
DevOps agent will invoke stuck agent. Common causes:
- Digital Ocean not authenticated
- Environment variables not set in DO
- Build failing in production

## 🤝 Contributing

Want to add new agents or improve existing ones?
1. Agent definitions are in `.claude/agents/*.md`
2. Follow the existing format
3. Add Jina research capabilities
4. Wire up stuck agent escalation
5. Test thoroughly!

## 📜 License

MIT - Use it, modify it, build amazing things!

## 🙏 Credits

Built for autonomous business creation.

Powered by:
- Claude Code's agent orchestration system
- Convex for real-time backend
- Next.js for frontend
- Playwright for visual testing
- Digital Ocean for hosting
- Jina for documentation lookup

---

**Ready to build your business?**

```bash
cd autonomous-business-builder
claude
```

Then just tell Claude what you want to build! 🚀

**The agents will handle the rest - from idea to production!**
