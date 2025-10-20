# Claude Code SEO Page Generator 🚀

An intelligent orchestration system that automatically generates 50 SEO-optimized landing pages for any business in parallel using Claude Code and design agents.

## 🎯 What Is This?

This is a **Claude Code-powered SEO content generation system** that transforms raw project information into 50 conversion-optimized, design-consistent landing pages - all generated in parallel.

**The System:**
- **🧠 Claude (You)** - The orchestrator with 200k context handling discovery, strategy, and agent orchestration
- **🎨 Design Agents (10 parallel)** - Each generates 5 SEO pages simultaneously using the project's design system
- **📊 CTA Database** - All call-to-action queries stored and tracked for conversion optimization

**Total Output:** 50 SEO-optimized landing pages + conversion tracking data, generated in parallel

## ⚡ Key Features

- **Parallel Generation**: 10 agents spawn simultaneously → 50 pages generated 10x faster
- **Design Consistency**: All pages use the discovered design system automatically
- **SEO-Optimized**: Built-in schema markup, meta tags, keyword optimization
- **Conversion-Focused**: 2-3 CTAs per page, database tracking
- **Zero Manual Design**: Automatically analyzes and applies existing brand patterns
- **Business-Aligned**: Strategy based on actual project discovery (20+ pages scanned)

## 🚀 Quick Start

### Prerequisites

1. **Claude Code CLI** installed ([get it here](https://docs.claude.com/en/docs/claude-code))
2. **Your SaaS/Application repository** with documentation and design files

### Installation & Setup

#### Step 1: Backup Your Existing Claude Config (Important!)

If you already have Claude Code set up in your project:

```bash
cd /path/to/your/project

# Back up your existing Claude config
cp -r .claude ~/Desktop/.claude.backup
# OR
cp -r .claude ./claude-backup

# Remove the existing configuration
rm -rf .claude
```

**This preserves your existing setup in case you need it later.**

#### Step 2: Import This Repository

```bash
# Copy this repository's .claude directory into your project
git clone https://github.com/IncomeStreamSurfer/claude-code-agents-wizard-v2.git
cd claude-code-agents-wizard-v2
git checkout design-agent

# Copy the .claude folder to your project
cp -r .claude /path/to/your/project/.claude
cp .mcp.json /path/to/your/project/.mcp.json

# Navigate to your project
cd /path/to/your/project
```

#### Step 3: Generate Your SEO Pages

```bash
# Start Claude Code in your project directory
claude

# Tell Claude to generate SEO pages
You: "Generate 50 SEO pages for my [SaaS/Application name]"

# Claude will:
# 1. Scan your project documentation
# 2. Analyze your design system
# 3. Generate content strategy (10 pillars, 50 subpillars)
# 4. Spawn 10 design agents in parallel
# 5. Generate 50 SEO pages with CTAs
# 6. Store all conversion data
```

### Example: Adding to Existing Project

```bash
# Your SaaS project structure
/my-saas/
├── README.md
├── docs/
├── src/
├── pages/
└── .git/

# Step 1: Backup existing Claude config (if you have one)
cp -r .claude ~/Desktop/.claude.backup 2>/dev/null || true

# Step 2: Get the SEO generator
cd ~
git clone https://github.com/IncomeStreamSurfer/claude-code-agents-wizard-v2.git
cd claude-code-agents-wizard-v2
git checkout design-agent

# Step 3: Copy to your project
cp -r .claude /path/to/my-saas/.claude
cp .mcp.json /path/to/my-saas/.mcp.json

# Step 4: Generate SEO pages
cd /path/to/my-saas
claude

# In Claude: "Generate 50 SEO pages for my SaaS"
```

### Restoring Your Original Setup (Optional)

If you want to go back to your original Claude Code setup:

```bash
# Remove the SEO generator config
rm -rf .claude

# Restore from backup
cp -r ~/Desktop/.claude.backup .claude
# OR if you backed up in project
cp -r ./claude-backup .claude
```

## 📖 How It Works

### The Complete Workflow

```
YOU: "Generate 50 SEO pages for my [project]"
    ↓
CLAUDE discovers & analyzes:
  - Reads 20+ project pages/docs
  - Extracts business model, value prop, audience
  - Analyzes design system (colors, typography, components)
  - Checks for database configuration
    ↓
CLAUDE generates strategy:
  - Creates 10 pillar topics (main content pillars)
  - Creates 50 subpillar topics (5 per pillar)
  - Aligns with business offerings and audience needs
    ↓
CLAUDE analyzes design system:
  - Extracts CSS framework (Tailwind, Bootstrap, etc.)
  - Documents brand colors and typography
  - Identifies component patterns
  - Prepares design brief for agents
    ↓
CLAUDE spawns 10 design agents simultaneously:
  - Agent 1: Generates 5 pages for pillar 1
  - Agent 2: Generates 5 pages for pillar 2
  - ... (all work in parallel)
  - Agent 10: Generates 5 pages for pillar 10
    ↓
DESIGN AGENTS generate pages:
  - 1000-2000 words of SEO-optimized content
  - 2-3 conversion-focused CTAs per page
  - Design system applied consistently
  - Schema markup included
  - Internal linking structure
    ↓
CLAUDE collects & organizes:
  - 50 pages generated ✓
  - CTA data stored in database ✓
  - Design consistency verified ✓
  - Ready for deployment ✓
```

## 🛠️ What Claude Does

### Step 1: Discovery Phase
Claude reads your project to understand:
- **Business Model**: What does this project do?
- **Value Proposition**: What problems does it solve?
- **Target Audience**: Who are the ideal customers?
- **Design System**: Colors, typography, components, patterns
- **Database**: Where to store conversion data

### Step 2: Strategy Phase
Claude generates content strategy:
- **10 Pillar Topics** - Main content pillars aligned with business
- **50 Subpillar Topics** - Specific, actionable topics for each page
- Example for SaaS email tool:
  - Pillar: "Email Automation Fundamentals"
    - Subpillar 1: Getting Started with Email Automation
    - Subpillar 2: Building Your First Workflow
    - Subpillar 3: Email Template Design
    - Subpillar 4: Automation Rules & Logic
    - Subpillar 5: Scheduling & Send Optimization

### Step 3: Design Analysis
Claude extracts design system:
- CSS Framework (Tailwind, Bootstrap, custom)
- Color palette and brand colors
- Typography hierarchy
- Component patterns
- Spacing and layout rules

### Step 4: Agent Orchestration
Claude spawns 10 design agents in parallel:
- Each agent receives 5 subpillar topics
- Each agent receives complete design system
- Each agent receives database schema
- All agents work simultaneously

### Step 5: Collection & Reporting
Claude aggregates results:
- Collects 50 generated pages
- Stores all CTAs in database
- Verifies design consistency
- Reports results

## 🎨 What Design Agents Do

Each design agent generates 5 SEO-optimized landing pages:

**Per Page:**
- SEO-optimized title (60 chars, includes keywords)
- Meta description (160 chars, includes CTA hint)
- H1 (keyword-rich, matches search intent)
- 1000-2000 words of high-quality content
- 2-3 conversion-focused CTAs
- Internal linking to related pages
- Schema.org markup
- Design system components applied

**Per Agent:**
- All 5 pages use brand design system
- Consistent color scheme across pages
- Matching typography and spacing
- Responsive design (mobile, tablet, desktop)
- 15 total CTAs (stored in database)

## 📊 Output Structure

```
/output/
├── pillar-1/
│   ├── subpillar-1.html
│   ├── subpillar-2.html
│   ├── subpillar-3.html
│   ├── subpillar-4.html
│   └── subpillar-5.html
├── pillar-2/
│   ├── subpillar-1.html
│   ├── subpillar-2.html
│   ├── subpillar-3.html
│   ├── subpillar-4.html
│   └── subpillar-5.html
... (8 more pillar folders)
└── database/
    └── cta_queries.json (or database storage)
```

**Database Schema Example:**
```json
{
  "cta_queries": [
    {
      "id": 1,
      "pillar": "Email Automation Fundamentals",
      "subpillar": "Getting Started with Email Automation",
      "page_slug": "/email-automation/getting-started",
      "cta_text": "Start Free 14-Day Trial",
      "cta_type": "primary"
    },
    {
      "id": 2,
      "pillar": "Email Automation Fundamentals",
      "subpillar": "Getting Started with Email Automation",
      "page_slug": "/email-automation/getting-started",
      "cta_text": "Schedule Demo",
      "cta_type": "secondary"
    }
    // ... 123 more CTAs
  ]
}
```

## 💡 Example: Email Automation SaaS

**Input:** Product that automates email workflows for teams

**Discovery:**
- Business: Email workflow automation
- Audience: Marketing teams, agencies, business owners
- Value Prop: Save 20+ hours/week on email management
- Design: Tailwind CSS, blue primary (#2563EB), modern sans-serif

**Generated Pillars:**
1. Email Automation Fundamentals
2. Workflow Integration Patterns
3. Team Collaboration Features
4. Analytics & Reporting
5. Security & Compliance
6. API & Developer Tools
7. Templates & Presets
8. Troubleshooting & Support
9. Migration Guides
10. Industry-Specific Solutions

**Generated Subpillars (50 total):**
- Getting Started with Email Automation
- Building Your First Workflow
- Email Template Design
- Automation Rules & Logic
- Scheduling & Send Optimization
- ... (45 more)

**Output:**
- 50 SEO pages generated
- 125 CTAs tracked in database
- All pages design-consistent
- Ready for deployment

## 🚀 Usage

### Generate Pages

```bash
claude

You: "Generate 50 SEO pages for my SaaS tool"

Claude will:
1. Scan your project documentation
2. Generate pillar strategy
3. Analyze design system
4. Spawn 10 design agents
5. Generate 50 pages in parallel
6. Store CTAs in database
7. Report results
```

## 📁 Repository Structure

```
.
├── .claude/
│   ├── CLAUDE.md              # SEO orchestrator instructions
│   └── agents/
│       └── design-agent.md    # Design agent specification
├── .mcp.json                  # Playwright/MCP config
├── .gitignore
└── README.md
```

## 🎓 Learn More

### Resources

- **[SEO Grove](https://seogrove.ai)** - AI-powered SEO automation platform
- **[ISS AI Automation School](https://www.skool.com/iss-ai-automation-school-6342/about)** - Learn AI automation
- **[Income Stream Surfers YouTube](https://www.youtube.com/incomestreamsurfers)** - Tutorials and breakdowns

### Support

- Join the [ISS AI Automation School community](https://www.skool.com/iss-ai-automation-school-6342/about)
- Subscribe to [Income Stream Surfers on YouTube](https://www.youtube.com/incomestreamsurfers)
- Check out [SEO Grove](https://seogrove.ai) for automated SEO solutions

## 🤝 Contributing

This system is open! Feel free to:
- Improve orchestrator discovery logic
- Enhance design agent prompts
- Add database integrations
- Submit PRs with improvements

## 📝 How It Works Under the Hood

**Claude Code Subagent System:**

1. **CLAUDE.md** - Main Claude orchestrator instructions (200k context)
2. **design-agent.md** - Design agent specification (parallel execution)
3. **Each agent** gets own clean context window
4. **Parallel execution** - 10 agents work simultaneously
5. **Database integration** - CTAs persisted for tracking

**Why This Works:**
- **200k context (Claude)** = Discovery + strategy + orchestration
- **Fresh contexts (10 agents)** = Each generates 5 pages independently
- **Parallel execution** = 50 pages 10x faster than sequential
- **Design system** = Consistency across all pages
- **CTA tracking** = Database integration for conversion optimization

## ✅ Success Criteria

✓ 20+ pages read and analyzed
✓ 10 pillar topics generated
✓ 50 subpillar topics documented
✓ Design system extracted and documented
✓ All 10 agents spawned simultaneously
✓ 50 pages generated successfully
✓ All CTAs stored in database
✓ Complete documentation delivered

## 🎯 Best Practices

1. **Provide good documentation** - More pages to scan = better strategy
2. **Ensure design system is accessible** - Makes agent pages consistent
3. **Set up database (optional)** - Better CTA tracking
4. **Review generated pages** - Verify they match your business
5. **Deploy and track** - Monitor CTA performance

## 🔥 Pro Tips

- The more documentation you provide, the better the strategy
- Clear design systems = more consistent generated pages
- Database integration enables conversion optimization
- Generated pages are templates - customize as needed
- Use CTA data to inform marketing strategy

## 📜 License

MIT - Use it, modify it, build amazing SEO content with it!

## 🙏 Credits

Built by [Income Stream Surfer](https://www.youtube.com/incomestreamsurfers)

Powered by Claude Code's agent system.

---

**Ready to generate 50 SEO pages in parallel?** Just run `claude` in this directory and tell it what project to analyze! 🚀
