# Shared Agent Memory & Context

This file contains shared knowledge and context that ALL agents should be aware of.

## Jina Documentation Access

**ALL AGENTS** have access to Jina for documentation lookup. Use it extensively!

### Jina API Keys
```
SEARCH: jina_db539c74a0c04d69bd7307c388a042809H-c8gFGa6pNMBfg43XKn6C4sHWc
READER: jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo
```

### How to Use Jina

#### Search for Documentation (llms.txt)
```bash
curl "https://s.jina.ai/?q=Stripe+llm.txt" \
  -H "Authorization: Bearer jina_db539c74a0c04d69bd7307c388a042809H-c8gFGa6pNMBfg43XKn6C4sHWc" \
  -H "X-Respond-With: no-content"
```

#### Fetch Specific Documentation Page
```bash
curl "https://r.jina.ai/https://docs.stripe.com/api" \
  -H "Authorization: Bearer jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo"
```

### Common Documentation Sources

**Stripe Integration:**
```bash
# Find Stripe docs
curl "https://s.jina.ai/?q=Stripe+llm.txt" \
  -H "Authorization: Bearer jina_db539c74a0c04d69bd7307c388a042809H-c8gFGa6pNMBfg43XKn6C4sHWc"

# Fetch specific Stripe page
curl "https://r.jina.ai/https://docs.stripe.com/payments/checkout" \
  -H "Authorization: Bearer jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo"
```

**Convex:**
```bash
# Convex schema docs
curl "https://r.jina.ai/https://docs.convex.dev/database/schemas" \
  -H "Authorization: Bearer jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo"

# Convex queries
curl "https://r.jina.ai/https://docs.convex.dev/functions/query-functions" \
  -H "Authorization: Bearer jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo"
```

**Next.js:**
```bash
# Next.js App Router
curl "https://r.jina.ai/https://nextjs.org/docs/app" \
  -H "Authorization: Bearer jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo"
```

**Tailwind CSS:**
```bash
# Tailwind docs
curl "https://r.jina.ai/https://tailwindcss.com/docs" \
  -H "Authorization: Bearer jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo"
```

**shadcn/ui:**
```bash
# shadcn component docs
curl "https://r.jina.ai/https://ui.shadcn.com/docs/components/button" \
  -H "Authorization: Bearer jina_f4c69136c92246e89c5cb7b920aea592_Nsjaiv8a4Gpb1wKVNZXr6QcC5Zo"
```

## Technology Stack

**Standard stack for ALL projects:**
- **Frontend**: Next.js 14+ with App Router
- **Backend**: Convex (real-time database + serverless functions)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Payments**: Stripe (when needed)
- **Hosting**: Digital Ocean App Platform
- **CI/CD**: GitHub Actions
- **Testing**: Playwright

## Critical Rules for ALL Agents

### NO HARDCODES, NO PLACEHOLDERS, NO FALLBACKS

**NEVER:**
- Hardcode API keys, prices, or configuration values
- Use placeholder text like "Coming soon" or "TODO"
- Skip features to "add later"
- Use fallback implementations
- Continue when blocked

**ALWAYS:**
- Use environment variables for ALL configuration
- Research with Jina before implementing
- Invoke stuck agent when blocked
- Complete features fully before moving on
- Test your work thoroughly

### Environment Variables

ALL dynamic values MUST use environment variables:
```typescript
// ✅ CORRECT
const price = process.env.NEXT_PUBLIC_PRO_PRICE;
const apiKey = process.env.STRIPE_SECRET_KEY;
const appName = process.env.NEXT_PUBLIC_APP_NAME;

// ❌ WRONG - NEVER DO THIS
const price = "$29/mo"; // HARDCODED
const apiKey = "sk_test_123"; // HARDCODED
const appName = "My App"; // HARDCODED
```

### When to Invoke Stuck Agent

Invoke **stuck** agent IMMEDIATELY if:
- Need API key from user
- Build or deployment fails
- Unclear requirements
- Multiple valid approaches exist
- Any technical blocker
- Security issue found
- Test failures
- Cannot proceed autonomously

**DO NOT:**
- Try workarounds first
- Use placeholder implementations
- Skip the feature
- Make assumptions
- Continue without resolution

## OpenRouter Integration

ALL agents use OpenRouter for AI tasks.

**API Key**: Provided via environment variable
```
OPENROUTER_API_KEY=
```

**Usage**: Configure in each agent's implementation

## Linear Integration

Software Architect creates Linear tickets for development tasks.

**Linear CLI Authentication**:
```bash
linear auth
```

**Ticket Creation**: Software Architect handles this

## GitHub CLI

DevOps Engineer uses GitHub CLI for repository and CI/CD management.

**Authentication**:
```bash
gh auth login
```

**Usage**: DevOps Engineer handles repository setup, secrets, and actions

## Digital Ocean CLI

DevOps Engineer uses Digital Ocean CLI for deployment.

**Authentication**:
```bash
doctl auth init
```

**Usage**: DevOps Engineer handles app creation, env vars, and deployment

## Stripe CLI

Backend Developer may use Stripe CLI for webhook testing.

**Authentication**:
```bash
stripe login
```

**Local Webhook Testing**:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Playwright MCP

**QA Engineer** and **Backend Developer** use Playwright to:
- Test UI in browser
- Take screenshots for verification
- Open Convex dashboard to verify functions
- Monitor application visually

**Usage**: Via Task tool with Playwright commands

## Communication Between Agents

### Document Flow
1. **CPO** → Creates `business-concept.md`
2. **Product Manager** → Creates `prd.md` (uses business-concept)
3. **Marketing** → Creates `brand-guidelines.md` (uses PRD)
4. **UX Designer** → Creates `style-guide.md` (uses brand-guidelines)
5. **Product Designer** → Creates `ui-designs.md` (uses style-guide + PRD)
6. **Software Architect** → Creates `technical-architecture.md` + Linear tickets (uses ui-designs + PRD)
7. **DBA** → Creates `convex/schema.ts` (uses architecture)
8. **Frontend Dev** → Implements pages (uses ui-designs + style-guide)
9. **Backend Dev** → Implements functions (uses architecture + schema)
10. **Security Engineer** → Creates `security-report.md` (reviews code)
11. **QA Engineer** → Creates `test-report.md` (tests implementation)
12. **DevOps Engineer** → Creates `deployment-guide.md` (deploys to production)

### Handoff Points
Each agent's output becomes the next agent's input. **Read previous agent's deliverables before starting!**

## Quality Standards

### Code Quality
- TypeScript strict mode
- ESLint configured
- Prettier for formatting
- No console.logs in production
- Proper error handling
- Input validation everywhere

### Security
- No secrets in code
- All env vars for sensitive data
- Input sanitization
- Authentication on protected routes
- Authorization checks in functions
- HTTPS enforced
- Security headers configured

### Testing
- Unit tests for business logic
- Integration tests for APIs
- E2E tests with Playwright
- All tests passing before deployment
- Coverage > 80% (where applicable)

### Performance
- Page load < 3s
- API response < 200ms (p95)
- Lighthouse score > 90
- Core Web Vitals green
- Images optimized
- Code splitting implemented

### Accessibility
- WCAG AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Touch targets 44px+
- ARIA labels on all interactive elements

## Success Metrics

A business is successfully completed when:
- ✅ All PRD requirements implemented
- ✅ All tests passing
- ✅ Security review passed
- ✅ NO hardcoded values
- ✅ ALL env vars configured
- ✅ Application deployed to production
- ✅ Performance targets met
- ✅ Accessibility standards met
- ✅ Documentation complete

## Emergency Protocols

### If Application Won't Start
1. Check terminal logs
2. Verify environment variables
3. Check dependencies installed
4. Invoke stuck agent with error details

### If Tests Fail
1. Screenshot the failure
2. Copy error logs
3. Document reproduction steps
4. Invoke stuck agent

### If Security Issue Found
1. STOP immediately
2. Document the vulnerability
3. Assess severity
4. Invoke stuck agent URGENTLY

### If Deployment Fails
1. Check deployment logs
2. Verify environment variables in DO
3. Check build succeeded
4. Invoke stuck agent with details

---

**This shared memory ensures all agents work cohesively toward the same goal: building production-ready businesses autonomously!** 🚀
