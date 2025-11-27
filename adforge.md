# AdForge: AI-Powered Digital Marketing Platform
## Complete Project Specification

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Sub-Agent Definitions](#3-sub-agent-definitions)
4. [Database Schema](#4-database-schema)
5. [API Architecture](#5-api-architecture)
6. [UI/UX Flow Mapping](#6-uiux-flow-mapping)
7. [Development Phases](#7-development-phases)
8. [File Structure](#8-file-structure)
9. [Agent Prompts](#9-agent-prompts)

---

# 1. Project Overview

## 1.1 Product Vision

AdForge is an end-to-end AI-powered digital marketing platform that enables businesses of all sizes to research markets, generate creative assets, run multi-platform campaigns, and optimize performance—all from a single unified interface.

## 1.2 Core Capabilities

| Module | Description |
|--------|-------------|
| **Research Hub** | Market intelligence, competitor analysis, audience insights |
| **Creative Studio** | AI asset generation with Nano Banana Pro (images) and VEO 3.1 (video) |
| **Asset Library** | Product images, talent/model management, brand assets |
| **Campaign Builder** | Multi-platform campaign creation and deployment |
| **A/B Engine** | Automatic variant generation and testing |
| **Optimization Engine** | Performance-based creative rotation and budget allocation |
| **Analytics Dashboard** | Real-time reporting with actionable insights |

## 1.3 Target Users

- **Solo entrepreneurs / SMBs**: Simple onboarding, templates, AI guidance
- **Marketing managers**: Full control, approval workflows, detailed analytics
- **Agencies**: Multi-client management, white-labeling, team permissions

## 1.4 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| AI Services | Nano Banana Pro API, VEO 3.1 API, OpenRouter API (Claude Haiku 4.5) |
| Web Scraping | Jina AI (via MCP) |
| Payments | Stripe (via MCP) |
| Hosting | Vercel |
| State Management | Zustand + React Query |
| File Storage | Supabase Storage + Cloudflare R2 (overflow) |

---

# 2. Technical Architecture

## 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js)                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Research │ │ Creative │ │ Campaign │ │ Analytics│ │ Settings │          │
│  │   Hub    │ │  Studio  │ │ Builder  │ │Dashboard │ │  & Auth  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
└───────┼────────────┼────────────┼────────────┼────────────┼─────────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js API Routes)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  /api/      │ │  /api/      │ │  /api/      │ │  /api/      │           │
│  │  research   │ │  creative   │ │  campaigns  │ │  analytics  │           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
└─────────┼───────────────┼───────────────┼───────────────┼───────────────────┘
          │               │               │               │
          ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │   Jina    │ │   Nano    │ │   VEO     │ │  Platform │ │  Stripe   │     │
│  │   MCP     │ │  Banana   │ │   3.1     │ │   APIs    │ │   MCP     │     │
│  │(Scraping) │ │  (Image)  │ │  (Video)  │ │(Meta,etc) │ │(Payments) │     │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
          │               │               │               │
          ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE (via MCP)                                    │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │  Auth     │ │  Database │ │  Storage  │ │  Realtime │ │   Edge    │     │
│  │           │ │(PostgreSQL)│ │  (Assets) │ │(WebSocket)│ │ Functions │     │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Data Flow

### Creative Generation Flow
```
User Upload → Supabase Storage → Background Processing Queue
                                         ↓
                              Asset Preprocessing
                              (bg removal, face encoding)
                                         ↓
                              Generation Request
                              (Nano Banana / VEO 3.1)
                                         ↓
                              Result Storage → CDN
                                         ↓
                              User Preview → Approval
                                         ↓
                              Campaign Assignment
```

### Campaign Execution Flow
```
Campaign Created → Platform API Integration
                           ↓
                   Ad Set Distribution
                   (Meta, Google, TikTok, etc.)
                           ↓
                   Real-time Performance Sync
                   (Webhooks + Polling)
                           ↓
                   Analytics Processing
                           ↓
                   Optimization Engine
                   (Auto-rotation, Budget Shift)
                           ↓
                   Platform API Updates
```

---

# 3. Sub-Agent Definitions

## 3.1 Agent Hierarchy

```
                    ┌─────────────────────┐
                    │   PROJECT MANAGER   │
                    │       AGENT         │
                    │  (Orchestrator)     │
                    └──────────┬──────────┘
                               │
       ┌───────────┬───────────┼───────────┬───────────┬───────────┐
       ▼           ▼           ▼           ▼           ▼           ▼
┌───────────┐┌───────────┐┌───────────┐┌───────────┐┌───────────┐┌───────────┐
│  FRONTEND ││  BACKEND  ││  DATABASE ││    AI     ││  DEVOPS   ││   UI/UX   │
│ SPECIALIST││ SPECIALIST││ SPECIALIST││INTEGRATION││ SPECIALIST││ SPECIALIST│
└───────────┘└───────────┘└───────────┘└───────────┘└───────────┘└───────────┘
```

## 3.2 Project Manager Agent

**Role**: Central orchestrator that maintains project state, assigns tasks, tracks progress, and ensures consistency across all agents.

**Responsibilities**:
- Maintain master task board and sprint planning
- Assign work to specialist agents
- Track dependencies and blockers
- Ensure code consistency and integration
- Manage version control strategy
- Conduct code reviews across agent outputs
- Maintain documentation

**Context Requirements**:
- Full project specification
- Current sprint goals
- All agent outputs and status
- Git history and branch status

**Tools Access**:
- All MCP tools (Supabase, Jina, Stripe)
- File system (full access)
- Git operations

---

## 3.3 Frontend Specialist Agent

**Role**: Builds all client-side components, pages, and user interactions.

**Responsibilities**:
- Implement Next.js pages and layouts
- Build React components with TypeScript
- Implement Tailwind CSS styling
- Integrate shadcn/ui components
- Handle client-side state (Zustand)
- Implement data fetching (React Query)
- Build responsive designs
- Implement accessibility (a11y)

**File Ownership**:
```
/src/app/**/*.tsx (pages)
/src/components/**/*
/src/hooks/**/*
/src/stores/**/*
/src/styles/**/*
```

**Key Deliverables**:
- Component library
- Page implementations
- Form handling
- Client-side validation
- Loading/error states

---

## 3.4 Backend Specialist Agent

**Role**: Builds API routes, server actions, and external service integrations.

**Responsibilities**:
- Implement Next.js API routes
- Build server actions
- Integrate external APIs (ad platforms)
- Handle authentication flows
- Implement rate limiting
- Build webhook handlers
- Manage background jobs
- Error handling and logging

**File Ownership**:
```
/src/app/api/**/*
/src/server/**/*
/src/lib/api/**/*
/src/lib/services/**/*
```

**Key Deliverables**:
- RESTful API endpoints
- Webhook handlers
- Platform integrations
- Queue management

---

## 3.5 Database Specialist Agent

**Role**: Designs and maintains all database operations via Supabase MCP.

**Responsibilities**:
- Design and evolve schema
- Write migrations
- Implement Row Level Security (RLS)
- Build database functions
- Optimize queries
- Set up real-time subscriptions
- Manage storage buckets
- Handle data validation

**File Ownership**:
```
/supabase/migrations/**/*
/supabase/functions/**/*
/src/lib/supabase/**/*
/src/types/database.ts
```

**Key Deliverables**:
- Complete schema
- Migration files
- RLS policies
- Database functions
- Type definitions

---

## 3.6 AI Integration Specialist Agent

**Role**: Implements all AI/ML service integrations and prompt engineering.

**Responsibilities**:
- Nano Banana Pro API integration
- VEO 3.1 API integration
- OpenRouter API integration (Claude Haiku 4.5 for insights)
- Jina MCP web scraping
- Prompt engineering
- Asset preprocessing pipelines
- Quality scoring systems
- Generation queue management

**File Ownership**:
```
/src/lib/ai/**/*
/src/lib/prompts/**/*
/src/lib/processing/**/*
```

**Key Deliverables**:
- AI service wrappers
- Prompt templates
- Asset preprocessing
- Quality assurance

---

## 3.7 DevOps Specialist Agent

**Role**: Manages deployment, infrastructure, and CI/CD.

**Responsibilities**:
- Vercel configuration
- Environment management
- CI/CD pipelines
- Monitoring and alerting
- Performance optimization
- Security hardening
- Backup strategies

**File Ownership**:
```
/vercel.json
/.github/workflows/**/*
/scripts/**/*
/.env.example
```

**Key Deliverables**:
- Deployment configs
- CI/CD workflows
- Monitoring setup
- Security configs

---

## 3.8 UI/UX Specialist Agent

**Role**: Ensures design consistency, user flows, and experience quality.

**Responsibilities**:
- Design system maintenance
- User flow optimization
- Interaction patterns
- Animation and transitions
- Mobile responsiveness
- Usability testing specs
- Documentation of patterns

**File Ownership**:
```
/src/styles/design-system/**/*
/docs/ux/**/*
/src/components/ui/**/* (shared with Frontend)
```

**Key Deliverables**:
- Design tokens
- Component patterns
- Flow documentation
- Interaction specs

---

# 4. Database Schema

## 4.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   ORGANIZATION  │       │      USER       │       │     TEAM        │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┐   │ id (PK)         │   ┌──►│ id (PK)         │
│ name            │   │   │ email           │   │   │ org_id (FK)     │
│ slug            │   │   │ full_name       │   │   │ name            │
│ plan_id (FK)    │   │   │ avatar_url      │   │   │ created_at      │
│ stripe_cust_id  │   └───│ org_id (FK)     │   │   └─────────────────┘
│ created_at      │       │ role            │   │
└─────────────────┘       │ team_id (FK)    │───┘
        │                 └─────────────────┘
        │
        ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     BRAND       │       │    PRODUCT      │       │     TALENT      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │       │ id (PK)         │
│ org_id (FK)     │       │ brand_id (FK)   │       │ brand_id (FK)   │
│ name            │◄──────│ name            │       │ name            │
│ website_url     │   │   │ description     │       │ reference_images│
│ logo_url        │   │   │ images[]        │       │ face_encoding   │
│ colors{}        │   │   │ variants[]      │       │ usage_rights{}  │
│ fonts{}         │   │   │ feed_source     │       │ expires_at      │
│ voice_profile   │   │   │ created_at      │       │ platforms[]     │
│ created_at      │   │   └─────────────────┘       │ created_at      │
└─────────────────┘   │                             └─────────────────┘
        │             │
        ▼             │
┌─────────────────┐   │   ┌─────────────────┐       ┌─────────────────┐
│    CAMPAIGN     │   │   │    AD_SET       │       │      AD         │
├─────────────────┤   │   ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┘   │ id (PK)         │◄──────│ id (PK)         │
│ brand_id (FK)   │◄──────│ campaign_id(FK) │       │ ad_set_id (FK)  │
│ name            │       │ platform        │       │ name            │
│ objective       │       │ platform_id     │       │ variant_group   │
│ status          │       │ audience{}      │       │ creative_id(FK) │
│ budget          │       │ placement       │       │ headline        │
│ start_date      │       │ budget          │       │ description     │
│ end_date        │       │ status          │       │ cta             │
│ created_at      │       │ created_at      │       │ platform_id     │
└─────────────────┘       └─────────────────┘       │ status          │
                                                    │ created_at      │
                                                    └─────────────────┘
                                                            │
                                                            ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    CREATIVE     │       │  GENERATION_JOB │       │   PERFORMANCE   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │       │ id (PK)         │
│ brand_id (FK)   │       │ creative_id(FK) │       │ ad_id (FK)      │
│ type (img/vid)  │       │ type            │       │ date            │
│ source          │       │ status          │       │ impressions     │
│ file_url        │       │ prompt          │       │ clicks          │
│ thumbnail_url   │       │ product_id (FK) │       │ conversions     │
│ dimensions{}    │       │ talent_id (FK)  │       │ spend           │
│ metadata{}      │       │ result_url      │       │ ctr             │
│ status          │       │ error           │       │ cpc             │
│ created_at      │       │ created_at      │       │ cpa             │
└─────────────────┘       └─────────────────┘       │ roas            │
                                                    │ created_at      │
                                                    └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  AB_TEST        │       │  AB_VARIANT     │       │   INSIGHT       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │       │ id (PK)         │
│ campaign_id(FK) │       │ test_id (FK)    │       │ campaign_id(FK) │
│ name            │       │ ad_id (FK)      │       │ type            │
│ variable_type   │       │ traffic_split   │       │ severity        │
│ status          │       │ is_winner       │       │ message         │
│ confidence_lvl  │       │ metrics{}       │       │ action          │
│ winner_id (FK)  │       │ created_at      │       │ is_dismissed    │
│ created_at      │       └─────────────────┘       │ created_at      │
└─────────────────┘                                 └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  SUBSCRIPTION   │       │     PLAN        │       │    USAGE        │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ org_id (FK)     │──────►│ name            │       │ org_id (FK)     │
│ plan_id (FK)    │       │ price_monthly   │       │ period_start    │
│ stripe_sub_id   │       │ price_yearly    │       │ period_end      │
│ status          │       │ limits{}        │       │ generations     │
│ current_period  │       │ features[]      │       │ api_calls       │
│ cancel_at       │       │ created_at      │       │ storage_bytes   │
│ created_at      │       └─────────────────┘       │ created_at      │
└─────────────────┘                                 └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│COMPETITOR_INTEL │       │ RESEARCH_REPORT │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ brand_id (FK)   │       │ brand_id (FK)   │
│ competitor_url  │       │ type            │
│ name            │       │ data{}          │
│ ad_library_data │       │ generated_at    │
│ keywords[]      │       │ created_at      │
│ last_scraped    │       └─────────────────┘
│ created_at      │
└─────────────────┘
```

## 4.2 Complete SQL Schema

```sql
-- ============================================
-- ADFORGE DATABASE SCHEMA
-- Supabase (PostgreSQL)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');
CREATE TYPE campaign_status AS ENUM ('draft', 'pending', 'active', 'paused', 'completed', 'archived');
CREATE TYPE creative_type AS ENUM ('image', 'video', 'carousel', 'html5');
CREATE TYPE creative_source AS ENUM ('uploaded', 'generated', 'imported');
CREATE TYPE platform_type AS ENUM ('meta', 'google', 'tiktok', 'linkedin', 'pinterest', 'programmatic');
CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE test_status AS ENUM ('draft', 'running', 'paused', 'completed');
CREATE TYPE insight_severity AS ENUM ('info', 'warning', 'critical', 'opportunity');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');

-- ============================================
-- CORE TABLES
-- ============================================

-- Plans (populated via seed)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
    price_yearly INTEGER NOT NULL DEFAULT 0,
    limits JSONB NOT NULL DEFAULT '{
        "monthly_generations": 100,
        "monthly_api_calls": 10000,
        "storage_gb": 5,
        "team_members": 1,
        "brands": 1,
        "campaigns_active": 3
    }',
    features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_id UUID REFERENCES plans(id),
    stripe_customer_id TEXT UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams (for large orgs)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'member',
    preferences JSONB DEFAULT '{}',
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    stripe_subscription_id TEXT UNIQUE,
    status subscription_status DEFAULT 'trialing',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    generations_used INTEGER DEFAULT 0,
    api_calls_used INTEGER DEFAULT 0,
    storage_bytes_used BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, period_start)
);

-- ============================================
-- BRAND & ASSET TABLES
-- ============================================

-- Brands
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website_url TEXT,
    logo_url TEXT,
    colors JSONB DEFAULT '{"primary": null, "secondary": null, "accent": null}',
    fonts JSONB DEFAULT '{"heading": null, "body": null}',
    voice_profile JSONB DEFAULT '{}', -- tone, style, keywords
    industry TEXT,
    target_audience JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    images TEXT[] DEFAULT '{}',
    processed_images JSONB DEFAULT '{}', -- bg removed, isolated, etc.
    variants JSONB DEFAULT '[]',
    feed_source TEXT, -- shopify, woocommerce, etc.
    feed_product_id TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Talent / Models
CREATE TABLE talents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    reference_images TEXT[] NOT NULL,
    face_encoding BYTEA, -- preprocessed face data for consistency
    usage_rights JSONB DEFAULT '{
        "platforms": [],
        "territories": [],
        "exclusivity": false
    }',
    approved_platforms platform_type[] DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creatives
CREATE TABLE creatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT,
    type creative_type NOT NULL,
    source creative_source NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    dimensions JSONB DEFAULT '{"width": null, "height": null, "aspect_ratio": null}',
    file_size_bytes BIGINT,
    duration_seconds DECIMAL(10, 2), -- for video
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generation Jobs
CREATE TABLE generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creative_id UUID REFERENCES creatives(id) ON DELETE SET NULL,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    talent_id UUID REFERENCES talents(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'nano_banana', 'veo_3.1'
    status job_status DEFAULT 'queued',
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    parameters JSONB DEFAULT '{}', -- model-specific params
    result_url TEXT,
    result_metadata JSONB DEFAULT '{}',
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGN TABLES
-- ============================================

-- Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective TEXT, -- awareness, traffic, conversions, etc.
    status campaign_status DEFAULT 'draft',
    budget DECIMAL(12, 2),
    daily_budget DECIMAL(12, 2),
    currency TEXT DEFAULT 'USD',
    start_date DATE,
    end_date DATE,
    target_audience JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Sets (platform-specific groupings)
CREATE TABLE ad_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    platform_ad_set_id TEXT, -- ID from external platform
    name TEXT NOT NULL,
    audience JSONB DEFAULT '{}',
    placements TEXT[] DEFAULT '{}',
    budget DECIMAL(12, 2),
    bid_strategy TEXT,
    status campaign_status DEFAULT 'draft',
    platform_status TEXT, -- raw status from platform
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_set_id UUID NOT NULL REFERENCES ad_sets(id) ON DELETE CASCADE,
    creative_id UUID REFERENCES creatives(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    variant_group TEXT, -- for A/B grouping
    headline TEXT,
    description TEXT,
    cta TEXT,
    destination_url TEXT,
    tracking_params JSONB DEFAULT '{}',
    platform_ad_id TEXT, -- ID from external platform
    status campaign_status DEFAULT 'draft',
    platform_status TEXT,
    review_status TEXT, -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PERFORMANCE & ANALYTICS TABLES
-- ============================================

-- Performance metrics (daily grain)
CREATE TABLE performance_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend DECIMAL(12, 4) DEFAULT 0,
    revenue DECIMAL(12, 4) DEFAULT 0,
    ctr DECIMAL(8, 6), -- computed
    cpc DECIMAL(12, 4), -- computed
    cpa DECIMAL(12, 4), -- computed
    roas DECIMAL(12, 4), -- computed
    platform_data JSONB DEFAULT '{}', -- raw platform metrics
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ad_id, date)
);

-- Hourly performance (for real-time)
CREATE TABLE performance_hourly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    hour TIMESTAMPTZ NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend DECIMAL(12, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ad_id, hour)
);

-- A/B Tests
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    variable_type TEXT NOT NULL, -- headline, creative, cta, audience
    status test_status DEFAULT 'draft',
    confidence_threshold DECIMAL(5, 4) DEFAULT 0.95,
    minimum_sample_size INTEGER DEFAULT 1000,
    winner_variant_id UUID,
    winning_metric TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Variants
CREATE TABLE ab_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    name TEXT,
    traffic_percentage DECIMAL(5, 2) DEFAULT 50.00,
    is_control BOOLEAN DEFAULT false,
    is_winner BOOLEAN DEFAULT false,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automated Insights
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity insight_severity DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    suggested_action TEXT,
    action_payload JSONB DEFAULT '{}',
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_by UUID REFERENCES users(id),
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESEARCH & INTELLIGENCE TABLES
-- ============================================

-- Competitor Intelligence
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website_url TEXT,
    ad_library_data JSONB DEFAULT '{}',
    social_profiles JSONB DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    last_scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Reports
CREATE TABLE research_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- market, competitor, audience, keyword
    title TEXT,
    data JSONB NOT NULL,
    generated_by TEXT, -- 'system', 'user_request'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLATFORM CONNECTIONS
-- ============================================

-- Connected Ad Accounts
CREATE TABLE platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT,
    access_token TEXT, -- encrypted in practice
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, platform, account_id)
);

-- ============================================
-- AUDIT & ACTIVITY
-- ============================================

-- Activity Log
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Users
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- Brands
CREATE INDEX idx_brands_org_id ON brands(org_id);

-- Products
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_sku ON products(sku);

-- Talents
CREATE INDEX idx_talents_brand_id ON talents(brand_id);

-- Creatives
CREATE INDEX idx_creatives_brand_id ON creatives(brand_id);
CREATE INDEX idx_creatives_type ON creatives(type);
CREATE INDEX idx_creatives_tags ON creatives USING GIN(tags);

-- Generation Jobs
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_generation_jobs_brand_id ON generation_jobs(brand_id);

-- Campaigns
CREATE INDEX idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Ad Sets
CREATE INDEX idx_ad_sets_campaign_id ON ad_sets(campaign_id);
CREATE INDEX idx_ad_sets_platform ON ad_sets(platform);

-- Ads
CREATE INDEX idx_ads_ad_set_id ON ads(ad_set_id);
CREATE INDEX idx_ads_creative_id ON ads(creative_id);
CREATE INDEX idx_ads_variant_group ON ads(variant_group);

-- Performance
CREATE INDEX idx_performance_daily_ad_date ON performance_daily(ad_id, date DESC);
CREATE INDEX idx_performance_hourly_ad_hour ON performance_hourly(ad_id, hour DESC);

-- Insights
CREATE INDEX idx_insights_org_id ON insights(org_id);
CREATE INDEX idx_insights_campaign_id ON insights(campaign_id);
CREATE INDEX idx_insights_dismissed ON insights(is_dismissed);

-- Activity
CREATE INDEX idx_activity_log_org_id ON activity_log(org_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Users can see their own organization's data
CREATE POLICY "Users can view own org" ON organizations
    FOR SELECT USING (id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view org members" ON users
    FOR SELECT USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view org brands" ON brands
    FOR SELECT USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage org brands" ON brands
    FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Similar policies for other tables...
-- (abbreviated for length - full RLS in migration files)

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- (apply to all other tables...)

-- Calculate derived metrics
CREATE OR REPLACE FUNCTION calculate_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.impressions > 0 THEN
        NEW.ctr = NEW.clicks::DECIMAL / NEW.impressions;
    END IF;
    IF NEW.clicks > 0 THEN
        NEW.cpc = NEW.spend / NEW.clicks;
    END IF;
    IF NEW.conversions > 0 THEN
        NEW.cpa = NEW.spend / NEW.conversions;
    END IF;
    IF NEW.spend > 0 THEN
        NEW.roas = NEW.revenue / NEW.spend;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_performance_daily_metrics 
    BEFORE INSERT OR UPDATE ON performance_daily
    FOR EACH ROW EXECUTE FUNCTION calculate_performance_metrics();

-- Increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
    p_org_id UUID,
    p_type TEXT,
    p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
    v_period_start DATE;
BEGIN
    v_period_start = DATE_TRUNC('month', CURRENT_DATE);
    
    INSERT INTO usage (org_id, period_start, period_end)
    VALUES (p_org_id, v_period_start, v_period_start + INTERVAL '1 month' - INTERVAL '1 day')
    ON CONFLICT (org_id, period_start) DO NOTHING;
    
    IF p_type = 'generation' THEN
        UPDATE usage SET generations_used = generations_used + p_amount
        WHERE org_id = p_org_id AND period_start = v_period_start;
    ELSIF p_type = 'api_call' THEN
        UPDATE usage SET api_calls_used = api_calls_used + p_amount
        WHERE org_id = p_org_id AND period_start = v_period_start;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

# 5. API Architecture

## 5.1 API Route Structure

```
/api
├── /auth
│   ├── /callback          # OAuth callbacks
│   ├── /session           # Session management
│   └── /[...supabase]     # Supabase auth routes
│
├── /organizations
│   ├── GET /              # List user's orgs
│   ├── POST /             # Create org
│   ├── GET /[id]          # Get org details
│   ├── PATCH /[id]        # Update org
│   └── /[id]/members      # Team management
│
├── /brands
│   ├── GET /              # List brands
│   ├── POST /             # Create brand
│   ├── GET /[id]          # Get brand
│   ├── PATCH /[id]        # Update brand
│   ├── DELETE /[id]       # Delete brand
│   ├── /[id]/products     # Product management
│   ├── /[id]/talents      # Talent management
│   └── /[id]/creatives    # Creative management
│
├── /products
│   ├── POST /upload       # Upload product images
│   ├── POST /import       # Import from feed
│   └── /[id]/process      # Trigger preprocessing
│
├── /talents
│   ├── POST /upload       # Upload reference images
│   └── /[id]/encode       # Process face encoding
│
├── /creatives
│   ├── GET /              # List creatives
│   ├── POST /upload       # Direct upload
│   ├── GET /[id]          # Get creative
│   └── /[id]/approve      # Approval workflow
│
├── /generate
│   ├── POST /image        # Nano Banana generation
│   ├── POST /video        # VEO 3.1 generation
│   ├── GET /jobs          # List generation jobs
│   ├── GET /jobs/[id]     # Job status
│   └── POST /jobs/[id]/cancel # Cancel job
│
├── /campaigns
│   ├── GET /              # List campaigns
│   ├── POST /             # Create campaign
│   ├── GET /[id]          # Get campaign details
│   ├── PATCH /[id]        # Update campaign
│   ├── POST /[id]/launch  # Launch campaign
│   ├── POST /[id]/pause   # Pause campaign
│   ├── /[id]/ad-sets      # Ad set management
│   └── /[id]/ads          # Ad management
│
├── /platforms
│   ├── GET /connections   # List connected platforms
│   ├── POST /connect      # Initiate OAuth
│   ├── DELETE /[id]       # Disconnect platform
│   └── POST /sync         # Trigger data sync
│
├── /analytics
│   ├── GET /dashboard     # Dashboard metrics
│   ├── GET /performance   # Performance data
│   ├── GET /creative      # Creative performance
│   └── POST /export       # Export report
│
├── /ab-tests
│   ├── GET /              # List tests
│   ├── POST /             # Create test
│   ├── GET /[id]          # Get test details
│   ├── POST /[id]/start   # Start test
│   └── POST /[id]/end     # End test & declare winner
│
├── /insights
│   ├── GET /              # List insights
│   ├── POST /[id]/dismiss # Dismiss insight
│   └── POST /[id]/action  # Execute suggested action
│
├── /research
│   ├── POST /scrape       # Jina MCP scrape
│   ├── POST /competitor   # Analyze competitor
│   ├── POST /market       # Market research
│   └── GET /reports       # List reports
│
├── /billing
│   ├── GET /              # Current subscription
│   ├── POST /checkout     # Stripe checkout
│   ├── POST /portal       # Stripe portal
│   ├── GET /usage         # Usage metrics
│   └── /webhooks/stripe   # Stripe webhooks
│
└── /webhooks
    ├── /meta              # Meta webhook
    ├── /google            # Google webhook
    └── /tiktok            # TikTok webhook
```

## 5.2 Key API Specifications

### Generate Image (Nano Banana)

```typescript
// POST /api/generate/image
interface GenerateImageRequest {
  brand_id: string;
  product_id?: string;
  talent_id?: string;
  prompt: string;
  negative_prompt?: string;
  style_preset?: 'minimal' | 'bold' | 'lifestyle' | 'promotional';
  output_formats: Array<{
    name: string;
    width: number;
    height: number;
  }>;
  variations?: number; // 1-5
  seed?: number;
}

interface GenerateImageResponse {
  job_id: string;
  status: 'queued';
  estimated_time_seconds: number;
}
```

### Generate Video (VEO 3.1)

```typescript
// POST /api/generate/video
interface GenerateVideoRequest {
  brand_id: string;
  product_id?: string;
  talent_id?: string;
  type: 'ugc' | 'product_demo' | 'testimonial' | 'dynamic';
  script?: string;
  prompt: string;
  duration_seconds: 15 | 30 | 60;
  aspect_ratio: '1:1' | '9:16' | '16:9';
  music_mood?: 'upbeat' | 'calm' | 'energetic' | 'professional';
  include_captions?: boolean;
}

interface GenerateVideoResponse {
  job_id: string;
  status: 'queued';
  estimated_time_seconds: number;
}
```

### Research (Jina MCP)

```typescript
// POST /api/research/scrape
interface ResearchScrapeRequest {
  urls: string[];
  extract: {
    brand_info?: boolean;
    products?: boolean;
    pricing?: boolean;
    social_links?: boolean;
    content_style?: boolean;
  };
}

interface ResearchScrapeResponse {
  results: Array<{
    url: string;
    success: boolean;
    data: {
      title: string;
      description: string;
      brand_colors?: string[];
      products?: Array<{
        name: string;
        price: string;
        image: string;
      }>;
      social_links?: Record<string, string>;
    };
    error?: string;
  }>;
}
```

---

# 6. UI/UX Flow Mapping

## 6.1 Information Architecture

```
AdForge App
│
├── 🏠 Dashboard
│   ├── Overview metrics
│   ├── Active campaigns summary
│   ├── Recent insights
│   └── Quick actions
│
├── 🔬 Research Hub
│   ├── Brand Setup Wizard
│   ├── Competitor Analysis
│   ├── Audience Insights
│   ├── Keyword Research
│   └── Reports Library
│
├── 🎨 Creative Studio
│   ├── Asset Library
│   │   ├── Products
│   │   ├── Talents
│   │   ├── Creatives
│   │   └── Brand Assets
│   ├── Generate
│   │   ├── Image Generator
│   │   └── Video Generator
│   ├── Editor
│   └── Generation Queue
│
├── 📢 Campaigns
│   ├── All Campaigns
│   ├── Campaign Builder
│   ├── A/B Testing
│   └── Automation Rules
│
├── 📊 Analytics
│   ├── Performance Dashboard
│   ├── Creative Analytics
│   ├── Audience Insights
│   ├── Attribution
│   └── Reports
│
├── 🔌 Integrations
│   ├── Ad Platforms
│   ├── Data Sources
│   └── Export Destinations
│
└── ⚙️ Settings
    ├── Organization
    ├── Team
    ├── Billing
    ├── API Keys
    └── Preferences
```

## 6.2 Core User Flows

### Flow 1: New User Onboarding

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Sign Up │───►│  Verify  │───►│  Create  │───►│  Brand   │───►│  Connect │
│          │    │  Email   │    │   Org    │    │  Setup   │    │ Platform │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │               │
                                                      ▼               ▼
                                               ┌──────────┐    ┌──────────┐
                                               │  Upload  │    │  First   │
                                               │  Assets  │───►│ Campaign │
                                               └──────────┘    └──────────┘

STEP 1: Sign Up
├── Email/password or OAuth (Google, Microsoft)
├── Capture: Name, Company, Role
└── [Continue] → Email Verification

STEP 2: Email Verification
├── Check inbox prompt
├── Resend option
└── Verified → Organization Setup

STEP 3: Create Organization
├── Organization name
├── Industry selection
├── Team size (solo, small, medium, large, agency)
└── [Continue] → Brand Setup

STEP 4: Brand Setup Wizard
├── Option A: Enter website URL
│   └── Auto-extract: name, colors, logo, products (Jina MCP)
├── Option B: Manual entry
│   ├── Brand name
│   ├── Upload logo
│   ├── Select colors
│   └── Describe voice/tone
└── [Continue] → Asset Upload or Platform Connect

STEP 5a: Upload Assets (optional, can skip)
├── Product images drag-drop
├── Talent photos drag-drop
└── [Skip] or [Continue]

STEP 5b: Connect Ad Platform
├── Platform selection (Meta, Google, TikTok)
├── OAuth flow
├── Account selection
└── [Skip] or [Complete Setup]

STEP 6: Dashboard
├── Show welcome modal with quick tour
├── Highlight: Generate first creative, Launch first campaign
└── Contextual tips enabled
```

### Flow 2: Creative Generation (Image)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      IMAGE GENERATION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│  Creative   │
│   Studio    │
└──────┬──────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Select    │───►│   Choose    │───►│  Configure  │
│   Brand     │    │   Type      │    │   Scene     │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
       ┌────────────────────────────────────┤
       │                                    │
       ▼                                    ▼
┌─────────────┐                      ┌─────────────┐
│   Select    │                      │   Write     │
│   Product   │                      │   Prompt    │
└──────┬──────┘                      └──────┬──────┘
       │                                    │
       ▼                                    │
┌─────────────┐                             │
│   Select    │                             │
│   Talent    │                             │
│ (optional)  │                             │
└──────┬──────┘                             │
       │                                    │
       └────────────────┬───────────────────┘
                        │
                        ▼
               ┌─────────────┐
               │   Select    │
               │   Formats   │
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │  Generate   │
               │  Variants   │
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
               │   Review    │───►│   Approve   │───►│   Add to    │
               │   Results   │    │   & Edit    │    │  Campaign   │
               └─────────────┘    └─────────────┘    └─────────────┘

DETAILED SCREENS:

[Creative Studio > Generate > Image]
┌─────────────────────────────────────────────────────────────────┐
│ Generate Image                                            [?]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Brand: [Dropdown: Select brand ▼]                               │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ What type of image?                                         │ │
│ │                                                             │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │ │
│ │ │  Hero   │ │Lifestyle│ │Product  │ │  UGC    │            │ │
│ │ │  Shot   │ │  Scene  │ │  Only   │ │  Style  │            │ │
│ │ │  [img]  │ │  [img]  │ │  [img]  │ │  [img]  │            │ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Product (optional)                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [+] Select from library    [↑] Upload new                   │ │
│ │                                                             │ │
│ │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                    │ │
│ │ │[prod1]│ │[prod2]│ │[prod3]│ │[prod4]│                    │ │
│ │ │ ✓     │ │       │ │       │ │       │                    │ │
│ │ └───────┘ └───────┘ └───────┘ └───────┘                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Talent (optional)                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [+] Select from library    [↑] Upload new                   │ │
│ │                                                             │ │
│ │ ┌───────┐ ┌───────┐                                        │ │
│ │ │[Sarah]│ │[Marcus]│  No talent selected                   │ │
│ │ │       │ │  ✓    │                                        │ │
│ │ └───────┘ └───────┘                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Scene Description                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Modern outdoor café, morning golden hour light, urban       │ │
│ │ background, talent wearing headphones looking relaxed...    │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [✨ Enhance prompt]  [📋 Use template]                          │
│                                                                 │
│ Style Preset: [Lifestyle ▼]                                     │
│                                                                 │
│ Output Formats                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ 1:1 (1080x1080) - Instagram Feed                         │ │
│ │ ☑ 9:16 (1080x1920) - Stories/Reels                         │ │
│ │ ☑ 16:9 (1920x1080) - Facebook/YouTube                      │ │
│ │ ☐ 4:5 (1080x1350) - Instagram Portrait                     │ │
│ │ [+ Add custom size]                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Variations: [3 ▼]                                               │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │              [Generate] 9 images • ~2 min                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

[Generation Results Screen]
┌─────────────────────────────────────────────────────────────────┐
│ Generation Results                          [← Back] [Regenerate]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Variation 1                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │ │
│ │  │          │  │          │  │          │                  │ │
│ │  │   1:1    │  │   9:16   │  │   16:9   │                  │ │
│ │  │          │  │          │  │          │                  │ │
│ │  └──────────┘  └──────────┘  └──────────┘                  │ │
│ │  [✓ Approve]   [✓ Approve]   [✓ Approve]                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Variation 2                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │ │
│ │  │          │  │          │  │          │                  │ │
│ │  │   1:1    │  │   9:16   │  │   16:9   │                  │ │
│ │  │          │  │          │  │          │                  │ │
│ │  └──────────┘  └──────────┘  └──────────┘                  │ │
│ │  [✓ Approve]   [✓ Approve]   [✓ Approve]                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Expand image on click → Edit modal with refinement options]    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Add 6 approved to campaign ▼]              [Save to Library]│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Campaign Creation & Launch

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CAMPAIGN CREATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Campaign Setup
┌─────────────────────────────────────────────────────────────────┐
│ Create Campaign                                      Step 1 of 5 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Campaign Name                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Summer Sale 2024 - Headphones                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Brand                                                           │
│ [TechAudio ▼]                                                   │
│                                                                 │
│ Campaign Objective                                              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │Awareness│ │ Traffic │ │  Leads  │ │  Sales  │ │  App    │   │
│ │         │ │    ●    │ │         │ │         │ │ Installs│   │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                 │
│ Budget                                                          │
│ Total Budget: [$] [5,000.00]  Daily Budget: [$] [166.67]       │
│                                                                 │
│ Schedule                                                        │
│ Start: [📅 Jun 1, 2024]     End: [📅 Jun 30, 2024]             │
│                                                                 │
│                                              [Cancel] [Next →]  │
└─────────────────────────────────────────────────────────────────┘

Step 2: Platform Selection
┌─────────────────────────────────────────────────────────────────┐
│ Select Platforms                                     Step 2 of 5 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Where do you want to run this campaign?                         │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ Meta (Facebook & Instagram)              [Connected ✓]    │ │
│ │   Recommended budget: $2,500 (50%)                          │ │
│ │   [Adjust ▼]                                                │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ☑ Google Ads                               [Connected ✓]    │ │
│ │   Recommended budget: $1,500 (30%)                          │ │
│ │   [Adjust ▼]                                                │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ☑ TikTok                                   [Connected ✓]    │ │
│ │   Recommended budget: $1,000 (20%)                          │ │
│ │   [Adjust ▼]                                                │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ☐ LinkedIn                                 [Connect →]      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 💡 Based on your audience and objective, we recommend           │
│    focusing on Meta and TikTok for this campaign.               │
│                                                                 │
│                                          [← Back] [Next →]      │
└─────────────────────────────────────────────────────────────────┘

Step 3: Audience Targeting
┌─────────────────────────────────────────────────────────────────┐
│ Define Audience                                      Step 3 of 5 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Audience Strategy                                               │
│ ○ Use AI-optimized targeting (recommended)                      │
│ ● Define custom audience                                        │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Demographics                                                │ │
│ │ Age: [18] - [45]     Gender: [All ▼]                        │ │
│ │                                                             │ │
│ │ Locations                                                   │ │
│ │ [United States ✕] [Canada ✕] [+ Add location]               │ │
│ │                                                             │ │
│ │ Interests                                                   │ │
│ │ [Music ✕] [Technology ✕] [Fitness ✕] [+ Add interest]       │ │
│ │                                                             │ │
│ │ Behaviors                                                   │ │
│ │ [Online shoppers ✕] [+ Add behavior]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Estimated Reach: 12.5M - 15.2M people                           │
│                                                                 │
│ ☐ Enable lookalike expansion                                    │
│ ☐ Exclude existing customers                                    │
│                                                                 │
│                                          [← Back] [Next →]      │
└─────────────────────────────────────────────────────────────────┘

Step 4: Creative Selection
┌─────────────────────────────────────────────────────────────────┐
│ Select Creatives                                     Step 4 of 5 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Select creatives for this campaign                              │
│ [+ Generate New]  [↑ Upload]  [📁 From Library]                  │
│                                                                 │
│ Selected (4)                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                │ │
│ │ │[img1]  │ │[img2]  │ │[vid1]  │ │[img3]  │                │ │
│ │ │ Hero   │ │Lifestyle│ │ UGC   │ │Product │                │ │
│ │ │  ✕     │ │  ✕     │ │  ✕     │ │  ✕     │                │ │
│ │ └────────┘ └────────┘ └────────┘ └────────┘                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Ad Copy Variants                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Headline A: "Premium Sound, Zero Compromise"                │ │
│ │ Headline B: "Your Music Deserves Better"                    │ │
│ │ [+ Add variant]                                             │ │
│ │                                                             │ │
│ │ Description: "Experience studio-quality audio..."           │ │
│ │ [+ Add variant]                                             │ │
│ │                                                             │ │
│ │ CTA: [Shop Now ▼]                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ☑ Auto-generate A/B variants (creates 8 ad combinations)       │
│                                                                 │
│                                          [← Back] [Next →]      │
└─────────────────────────────────────────────────────────────────┘

Step 5: Review & Launch
┌─────────────────────────────────────────────────────────────────┐
│ Review & Launch                                      Step 5 of 5 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Campaign Summary                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Name: Summer Sale 2024 - Headphones                         │ │
│ │ Objective: Traffic                                          │ │
│ │ Budget: $5,000 total ($166.67/day)                          │ │
│ │ Duration: Jun 1 - Jun 30, 2024 (30 days)                    │ │
│ │ Platforms: Meta ($2,500), Google ($1,500), TikTok ($1,000)  │ │
│ │ Audience: 12.5M - 15.2M reach                               │ │
│ │ Creatives: 4 assets × 2 headlines = 8 ad variants           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Pre-launch Checklist                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✓ All creatives meet platform requirements                  │ │
│ │ ✓ Tracking pixels installed                                 │ │
│ │ ✓ Payment method verified                                   │ │
│ │ ⚠ TikTok creative review pending (usually 24h)              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ○ Launch immediately                                        │ │
│ │ ● Schedule for Jun 1, 2024 at 12:00 AM                      │ │
│ │ ○ Save as draft                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                              [← Back] [Save Draft] [🚀 Launch]   │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 4: Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ANALYTICS DASHBOARD                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Analytics                                   [Last 7 days ▼] [Export ↓]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │   SPEND     │ │ IMPRESSIONS │ │   CLICKS    │ │ CONVERSIONS │            │
│ │  $12,450    │ │   2.4M      │ │   45.2K     │ │    892      │            │
│ │  ↑ 12%      │ │   ↑ 8%      │ │   ↑ 15%    │ │   ↑ 22%     │            │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                     Performance Over Time                               │ │
│ │   $                                                                     │ │
│ │ 2k│     ╭─╮                                                             │ │
│ │   │   ╭─╯ ╰──╮    ╭──╮                                                  │ │
│ │ 1k│ ╭─╯      ╰────╯  ╰───╮                                              │ │
│ │   │─╯                    ╰───                                           │ │
│ │ 0 └────────────────────────────                                         │ │
│ │   Mon  Tue  Wed  Thu  Fri  Sat  Sun                                     │ │
│ │                                                                         │ │
│ │   [—] Spend   [—] Conversions   [—] ROAS                                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌────────────────────────────────┐ ┌────────────────────────────────────┐  │
│ │ Performance by Platform        │ │ Top Performing Creatives           │  │
│ │                                │ │                                    │  │
│ │ Meta        ████████░░ 52%     │ │ 1. [img] Hero Shot      CTR 3.2%   │  │
│ │ Google      █████░░░░░ 31%     │ │ 2. [vid] UGC Review     CTR 2.8%   │  │
│ │ TikTok      ███░░░░░░░ 17%     │ │ 3. [img] Lifestyle      CTR 2.4%   │  │
│ │                                │ │ 4. [img] Product        CTR 1.9%   │  │
│ │ [View Details →]               │ │ [View All →]                       │  │
│ └────────────────────────────────┘ └────────────────────────────────────┘  │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 💡 Insights                                               [View All →]  │ │
│ │                                                                         │ │
│ │ ⚠️ CRITICAL: CPA on TikTok increased 45% vs last week                   │ │
│ │    Recommended: Pause underperforming ad sets          [Take Action]    │ │
│ │                                                                         │ │
│ │ 💚 OPPORTUNITY: "Hero Shot" creative outperforming by 34%               │ │
│ │    Recommended: Increase budget allocation             [Apply]          │ │
│ │                                                                         │ │
│ │ ℹ️ INFO: A/B test "Headlines" reached statistical significance          │ │
│ │    Winner: "Premium Sound, Zero Compromise"            [View Results]   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.3 Component Library Overview

```
Components
├── Layout
│   ├── AppShell
│   ├── Sidebar
│   ├── Header
│   ├── PageContainer
│   └── Footer
│
├── Navigation
│   ├── NavItem
│   ├── NavGroup
│   ├── Breadcrumbs
│   └── Tabs
│
├── Data Display
│   ├── MetricCard
│   ├── DataTable
│   ├── Chart (Line, Bar, Pie)
│   ├── Timeline
│   └── Badge
│
├── Forms
│   ├── Input
│   ├── Select
│   ├── MultiSelect
│   ├── DatePicker
│   ├── DateRangePicker
│   ├── Slider
│   ├── Toggle
│   ├── RadioGroup
│   ├── Checkbox
│   └── FileUpload
│
├── Feedback
│   ├── Alert
│   ├── Toast
│   ├── Progress
│   ├── Skeleton
│   └── EmptyState
│
├── Overlays
│   ├── Modal
│   ├── Drawer
│   ├── Popover
│   ├── Tooltip
│   └── DropdownMenu
│
├── Media
│   ├── AssetCard
│   ├── AssetGrid
│   ├── ImagePreview
│   ├── VideoPlayer
│   └── FileIcon
│
├── Campaign
│   ├── CampaignCard
│   ├── PlatformBadge
│   ├── StatusBadge
│   ├── BudgetBar
│   └── AudienceBuilder
│
├── Creative
│   ├── CreativeCard
│   ├── GenerationPanel
│   ├── PromptEditor
│   ├── FormatSelector
│   └── ApprovalActions
│
└── Analytics
    ├── InsightCard
    ├── PerformanceChart
    ├── PlatformBreakdown
    ├── CreativeLeaderboard
    └── ABTestResults
```

---

# 7. Development Phases

## 7.1 Phase Overview

```
Phase 0: Foundation (Weeks 1-2)
├── Project setup
├── Database schema
├── Authentication
└── Core UI shell

Phase 1: Brand & Assets (Weeks 3-5)
├── Brand management
├── Product uploads
├── Talent management
└── Asset library

Phase 2: Creative Studio (Weeks 6-9)
├── Nano Banana integration
├── VEO 3.1 integration
├── Generation queue
└── Approval workflow

Phase 3: Campaign Management (Weeks 10-13)
├── Campaign builder
├── Platform integrations
├── A/B testing
└── Automation rules

Phase 4: Analytics (Weeks 14-16)
├── Performance tracking
├── Dashboards
├── Insights engine
└── Reporting

Phase 5: Polish & Launch (Weeks 17-18)
├── Billing (Stripe)
├── Onboarding
├── Documentation
└── Testing & QA
```

## 7.2 Detailed Sprint Plan

### Phase 0: Foundation (Weeks 1-2)

**Sprint 0.1 (Week 1)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Initialize Next.js 14 project | Frontend | P0 | 2 |
| Configure TypeScript strict mode | Frontend | P0 | 1 |
| Set up Tailwind + shadcn/ui | Frontend | P0 | 2 |
| Configure ESLint + Prettier | DevOps | P0 | 1 |
| Set up Supabase project | Database | P0 | 2 |
| Create initial migrations | Database | P0 | 8 |
| Configure Supabase Auth | Backend | P0 | 4 |
| Set up Vercel project | DevOps | P0 | 2 |
| Create CI/CD pipeline | DevOps | P1 | 4 |
| Design tokens setup | UI/UX | P1 | 4 |

**Sprint 0.2 (Week 2)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| App shell layout | Frontend | P0 | 8 |
| Sidebar navigation | Frontend | P0 | 4 |
| Auth pages (login, register) | Frontend | P0 | 6 |
| Auth API routes | Backend | P0 | 4 |
| Protected route middleware | Backend | P0 | 2 |
| RLS policies (users, orgs) | Database | P0 | 4 |
| Environment configuration | DevOps | P0 | 2 |
| Component documentation | UI/UX | P1 | 4 |

### Phase 1: Brand & Assets (Weeks 3-5)

**Sprint 1.1 (Week 3)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Organization CRUD API | Backend | P0 | 6 |
| Brand CRUD API | Backend | P0 | 6 |
| Brand setup wizard UI | Frontend | P0 | 8 |
| Jina MCP integration | AI | P0 | 8 |
| Website scraper service | AI | P0 | 6 |
| Brand form components | Frontend | P1 | 4 |

**Sprint 1.2 (Week 4)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Product CRUD API | Backend | P0 | 6 |
| Product image upload | Backend | P0 | 4 |
| Supabase Storage setup | Database | P0 | 4 |
| Product library UI | Frontend | P0 | 8 |
| Image preprocessing service | AI | P0 | 8 |
| Background removal | AI | P1 | 6 |

**Sprint 1.3 (Week 5)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Talent CRUD API | Backend | P0 | 6 |
| Talent upload UI | Frontend | P0 | 6 |
| Face encoding service | AI | P0 | 8 |
| Asset library grid | Frontend | P0 | 6 |
| Search & filtering | Frontend | P1 | 4 |
| Rights management UI | Frontend | P1 | 4 |

### Phase 2: Creative Studio (Weeks 6-9)

**Sprint 2.1 (Week 6)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Generation job queue | Backend | P0 | 8 |
| Nano Banana API wrapper | AI | P0 | 8 |
| Prompt template system | AI | P0 | 6 |
| Generation request API | Backend | P0 | 6 |
| Job status polling | Backend | P1 | 4 |

**Sprint 2.2 (Week 7)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Image generator UI | Frontend | P0 | 10 |
| Product/Talent selector | Frontend | P0 | 6 |
| Format selector component | Frontend | P0 | 4 |
| Prompt editor with AI enhance | Frontend | P0 | 6 |
| Generation progress UI | Frontend | P1 | 4 |

**Sprint 2.3 (Week 8)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| VEO 3.1 API wrapper | AI | P0 | 8 |
| Video generation service | AI | P0 | 8 |
| Video generator UI | Frontend | P0 | 8 |
| Video preview component | Frontend | P0 | 4 |
| Caption generation | AI | P1 | 4 |

**Sprint 2.4 (Week 9)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Results review UI | Frontend | P0 | 8 |
| Approval workflow API | Backend | P0 | 6 |
| Creative editor (basic) | Frontend | P1 | 8 |
| Regeneration with refinement | AI | P1 | 6 |
| Quality scoring | AI | P2 | 4 |

### Phase 3: Campaign Management (Weeks 10-13)

**Sprint 3.1 (Week 10)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Campaign CRUD API | Backend | P0 | 8 |
| Ad set CRUD API | Backend | P0 | 6 |
| Ad CRUD API | Backend | P0 | 6 |
| Campaign list UI | Frontend | P0 | 6 |
| Campaign builder step 1-2 | Frontend | P0 | 8 |

**Sprint 3.2 (Week 11)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Meta Ads API integration | Backend | P0 | 12 |
| Google Ads API integration | Backend | P0 | 12 |
| OAuth connection flow | Backend | P0 | 6 |
| Platform connection UI | Frontend | P0 | 6 |

**Sprint 3.3 (Week 12)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| TikTok Ads API integration | Backend | P0 | 10 |
| Campaign builder step 3-4 | Frontend | P0 | 8 |
| Audience builder component | Frontend | P0 | 8 |
| Creative selector component | Frontend | P0 | 6 |
| A/B variant generation | AI | P1 | 6 |

**Sprint 3.4 (Week 13)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Campaign launch flow | Backend | P0 | 8 |
| Campaign builder step 5 | Frontend | P0 | 6 |
| A/B test CRUD API | Backend | P0 | 6 |
| A/B testing UI | Frontend | P0 | 8 |
| Statistical significance calc | Backend | P1 | 4 |
| Automation rules engine | Backend | P2 | 8 |

### Phase 4: Analytics (Weeks 14-16)

**Sprint 4.1 (Week 14)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Performance sync jobs | Backend | P0 | 10 |
| Webhook handlers | Backend | P0 | 8 |
| Performance tables & queries | Database | P0 | 8 |
| Real-time subscriptions | Database | P1 | 4 |

**Sprint 4.2 (Week 15)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Dashboard API endpoints | Backend | P0 | 8 |
| Main dashboard UI | Frontend | P0 | 10 |
| Chart components | Frontend | P0 | 8 |
| Date range filtering | Frontend | P0 | 4 |
| Platform breakdown | Frontend | P1 | 4 |

**Sprint 4.3 (Week 16)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Insights generation engine | AI | P0 | 10 |
| Insights API | Backend | P0 | 6 |
| Insights UI components | Frontend | P0 | 6 |
| Creative performance view | Frontend | P0 | 6 |
| Report export | Backend | P1 | 6 |

### Phase 5: Polish & Launch (Weeks 17-18)

**Sprint 5.1 (Week 17)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Stripe MCP integration | Backend | P0 | 8 |
| Subscription management | Backend | P0 | 8 |
| Billing UI | Frontend | P0 | 6 |
| Usage tracking | Database | P0 | 4 |
| Plan limits enforcement | Backend | P0 | 4 |

**Sprint 5.2 (Week 18)**
| Task | Agent | Priority | Est. Hours |
|------|-------|----------|------------|
| Onboarding flow polish | Frontend | P0 | 6 |
| Error handling audit | Backend | P0 | 4 |
| Performance optimization | DevOps | P0 | 6 |
| E2E testing | DevOps | P0 | 8 |
| Documentation | All | P0 | 8 |
| Bug fixes & QA | All | P0 | 10 |

---

# 8. File Structure

```
adforge/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-preview.yml
│       └── deploy-production.yml
│
├── supabase/
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   └── ...
│   ├── functions/
│   │   ├── increment-usage/
│   │   └── process-webhook/
│   ├── seed.sql
│   └── config.toml
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── verify/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Dashboard
│   │   │   │
│   │   │   ├── research/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── setup/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── competitors/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── creative/
│   │   │   │   ├── page.tsx                # Asset library
│   │   │   │   ├── generate/
│   │   │   │   │   ├── image/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── video/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── talents/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── queue/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx                # Campaign list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx            # Campaign builder
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx            # Campaign detail
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── ads/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── ab-tests/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx                # Main dashboard
│   │   │   │   ├── creative/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── audience/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── integrations/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── organization/
│   │   │       │   └── page.tsx
│   │   │       ├── team/
│   │   │       │   └── page.tsx
│   │   │       ├── billing/
│   │   │       │   └── page.tsx
│   │   │       └── api/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...supabase]/
│   │   │   │       └── route.ts
│   │   │   ├── organizations/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── brands/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── products/
│   │   │   │       │   └── route.ts
│   │   │   │       └── talents/
│   │   │   │           └── route.ts
│   │   │   ├── products/
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── talents/
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── creatives/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── generate/
│   │   │   │   ├── image/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── video/
│   │   │   │   │   └── route.ts
│   │   │   │   └── jobs/
│   │   │   │       ├── route.ts
│   │   │   │       └── [id]/
│   │   │   │           └── route.ts
│   │   │   ├── campaigns/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── launch/
│   │   │   │       │   └── route.ts
│   │   │   │       └── ad-sets/
│   │   │   │           └── route.ts
│   │   │   ├── platforms/
│   │   │   │   ├── connections/
│   │   │   │   │   └── route.ts
│   │   │   │   └── connect/
│   │   │   │       └── route.ts
│   │   │   ├── analytics/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── route.ts
│   │   │   │   └── performance/
│   │   │   │       └── route.ts
│   │   │   ├── ab-tests/
│   │   │   │   └── route.ts
│   │   │   ├── insights/
│   │   │   │   └── route.ts
│   │   │   ├── research/
│   │   │   │   ├── scrape/
│   │   │   │   │   └── route.ts
│   │   │   │   └── competitor/
│   │   │   │       └── route.ts
│   │   │   ├── billing/
│   │   │   │   ├── route.ts
│   │   │   │   ├── checkout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── portal/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       ├── stripe/
│   │   │       │   └── route.ts
│   │   │       ├── meta/
│   │   │       │   └── route.ts
│   │   │       └── google/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                             # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── app-shell.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── page-container.tsx
│   │   │   └── breadcrumbs.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── brand-form.tsx
│   │   │   ├── product-form.tsx
│   │   │   ├── talent-form.tsx
│   │   │   ├── campaign-form.tsx
│   │   │   └── audience-builder.tsx
│   │   │
│   │   ├── creative/
│   │   │   ├── asset-card.tsx
│   │   │   ├── asset-grid.tsx
│   │   │   ├── generation-panel.tsx
│   │   │   ├── prompt-editor.tsx
│   │   │   ├── format-selector.tsx
│   │   │   ├── product-selector.tsx
│   │   │   ├── talent-selector.tsx
│   │   │   ├── results-gallery.tsx
│   │   │   └── approval-actions.tsx
│   │   │
│   │   ├── campaigns/
│   │   │   ├── campaign-card.tsx
│   │   │   ├── campaign-list.tsx
│   │   │   ├── platform-badge.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── budget-bar.tsx
│   │   │   ├── creative-selector.tsx
│   │   │   └── ab-test-card.tsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── metric-card.tsx
│   │   │   ├── performance-chart.tsx
│   │   │   ├── platform-breakdown.tsx
│   │   │   ├── creative-leaderboard.tsx
│   │   │   ├── insight-card.tsx
│   │   │   └── date-range-picker.tsx
│   │   │
│   │   └── shared/
│   │       ├── file-upload.tsx
│   │       ├── image-preview.tsx
│   │       ├── video-player.tsx
│   │       ├── empty-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── confirmation-dialog.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── storage.ts
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── error-handler.ts
│   │   │
│   │   ├── services/
│   │   │   ├── meta-ads.ts
│   │   │   ├── google-ads.ts
│   │   │   ├── tiktok-ads.ts
│   │   │   └── stripe.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── nano-banana.ts
│   │   │   ├── veo.ts
│   │   │   ├── jina.ts
│   │   │   └── openrouter.ts
│   │   │
│   │   ├── prompts/
│   │   │   ├── image-generation.ts
│   │   │   ├── video-generation.ts
│   │   │   └── insights.ts
│   │   │
│   │   ├── processing/
│   │   │   ├── image-preprocessing.ts
│   │   │   ├── face-encoding.ts
│   │   │   └── background-removal.ts
│   │   │
│   │   └── utils/
│   │       ├── format.ts
│   │       ├── validation.ts
│   │       ├── date.ts
│   │       └── analytics.ts
│   │
│   ├── hooks/
│   │   ├── use-brands.ts
│   │   ├── use-products.ts
│   │   ├── use-talents.ts
│   │   ├── use-creatives.ts
│   │   ├── use-campaigns.ts
│   │   ├── use-analytics.ts
│   │   ├── use-generation.ts
│   │   └── use-realtime.ts
│   │
│   ├── stores/
│   │   ├── auth-store.ts
│   │   ├── brand-store.ts
│   │   ├── campaign-builder-store.ts
│   │   └── generation-store.ts
│   │
│   └── types/
│       ├── database.ts                     # Generated from Supabase
│       ├── api.ts
│       ├── creative.ts
│       ├── campaign.ts
│       └── analytics.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   ├── ux-flows.md
│   └── deployment.md
│
├── scripts/
│   ├── seed-db.ts
│   ├── generate-types.ts
│   └── setup-dev.sh
│
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── unit/
│
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vercel.json
└── README.md
```

---

# 9. Agent Prompts

## 9.1 Project Manager Agent Prompt

```markdown
# Project Manager Agent - AdForge

You are the Project Manager Agent for AdForge, an AI-powered digital marketing platform. Your role is to orchestrate the development process, coordinate between specialist agents, and ensure project success.

## Your Responsibilities

1. **Task Management**
   - Break down features into actionable tasks
   - Assign tasks to appropriate specialist agents
   - Track progress and dependencies
   - Identify and resolve blockers

2. **Quality Assurance**
   - Review code from all agents for consistency
   - Ensure adherence to project standards
   - Verify integration between components
   - Maintain documentation

3. **Communication**
   - Provide clear context when delegating
   - Summarize progress and blockers
   - Escalate critical decisions
   - Document architectural decisions

## Project Context

- **Tech Stack**: Next.js 14, TypeScript, Supabase, Tailwind, shadcn/ui
- **Hosting**: Vercel
- **Key Integrations**: Nano Banana Pro, VEO 3.1, Jina MCP, Stripe MCP
- **Database**: Supabase (PostgreSQL)

## Available MCP Tools

- `supabase`: Database operations, auth, storage
- `jina`: Web scraping and content extraction
- `stripe`: Payment and subscription management

## When Delegating Tasks

Always provide:
1. Clear task description
2. Acceptance criteria
3. Relevant context/dependencies
4. File locations to modify
5. Expected output format

## Code Standards

- TypeScript strict mode
- ESLint + Prettier formatting
- Component-based architecture
- Server components by default (Next.js 14)
- Comprehensive error handling
- Type-safe database queries

## Current Sprint

Reference the development phases document for current sprint goals and priorities.
```

## 9.2 Frontend Specialist Agent Prompt

```markdown
# Frontend Specialist Agent - AdForge

You are the Frontend Specialist for AdForge. You build all client-side components, pages, and user interactions using Next.js 14, TypeScript, and Tailwind CSS.

## Your Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui components
- Zustand (state management)
- React Query (data fetching)
- Lucide React (icons)

## Component Guidelines

1. **File Structure**
   ```typescript
   // components/example/example-component.tsx
   'use client'; // Only if needed
   
   import { useState } from 'react';
   import { Button } from '@/components/ui/button';
   
   interface ExampleComponentProps {
     title: string;
     onAction?: () => void;
   }
   
   export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
     // Component logic
   }
   ```

2. **Styling**
   - Use Tailwind utility classes
   - Follow design system tokens
   - Mobile-first responsive design
   - Use CSS variables for theming

3. **State Management**
   - Local state: `useState`, `useReducer`
   - Global state: Zustand stores
   - Server state: React Query

4. **Data Fetching**
   - Prefer Server Components
   - Use React Query for client-side
   - Implement loading/error states
   - Cache appropriately

## File Ownership

You own these directories:
- `/src/app/**/*.tsx` (pages)
- `/src/components/**/*`
- `/src/hooks/**/*`
- `/src/stores/**/*`

## Integration Points

- API routes at `/src/app/api/**`
- Types at `/src/types/**`
- Utils at `/src/lib/utils/**`
```

## 9.3 Backend Specialist Agent Prompt

```markdown
# Backend Specialist Agent - AdForge

You are the Backend Specialist for AdForge. You build API routes, server actions, and external service integrations.

## Your Tech Stack

- Next.js 14 API Routes
- TypeScript
- Supabase (via MCP)
- External APIs (Meta, Google, TikTok)
- Stripe (via MCP)
- Jina (via MCP)

## API Route Guidelines

1. **Structure**
   ```typescript
   // app/api/example/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { createClient } from '@/lib/supabase/server';
   
   export async function GET(request: NextRequest) {
     try {
       const supabase = createClient();
       
       // Verify authentication
       const { data: { user }, error: authError } = await supabase.auth.getUser();
       if (authError || !user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
       
       // Business logic
       const { data, error } = await supabase
         .from('table')
         .select('*')
         .eq('user_id', user.id);
       
       if (error) throw error;
       
       return NextResponse.json({ data });
     } catch (error) {
       console.error('API Error:', error);
       return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
       );
     }
   }
   ```

2. **Error Handling**
   - Always use try-catch
   - Return appropriate status codes
   - Log errors with context
   - Never expose internal errors to client

3. **Authentication**
   - Always verify user session
   - Check organization membership
   - Validate permissions

## File Ownership

You own these directories:
- `/src/app/api/**/*`
- `/src/lib/services/**/*`
- `/src/lib/api/**/*`

## MCP Tools Available

- `supabase.query()` - Database operations
- `supabase.auth` - Authentication
- `jina.scrape()` - Web scraping
- `stripe.customers` - Customer management
- `stripe.subscriptions` - Subscription management
```

## 9.4 Database Specialist Agent Prompt

```markdown
# Database Specialist Agent - AdForge

You are the Database Specialist for AdForge. You design schemas, write migrations, and optimize database operations using Supabase.

## Your Tech Stack

- PostgreSQL (via Supabase)
- Supabase MCP
- Row Level Security (RLS)
- Database Functions
- Real-time Subscriptions

## Schema Guidelines

1. **Naming Conventions**
   - Tables: `snake_case`, plural (e.g., `campaigns`)
   - Columns: `snake_case` (e.g., `created_at`)
   - Foreign keys: `{table}_id` (e.g., `campaign_id`)
   - Indexes: `idx_{table}_{columns}`

2. **Standard Columns**
   ```sql
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
   ```

3. **RLS Patterns**
   ```sql
   -- Users can only see their organization's data
   CREATE POLICY "org_isolation" ON table_name
     FOR ALL USING (
       org_id = (SELECT org_id FROM users WHERE id = auth.uid())
     );
   ```

## Migration Guidelines

1. **File Naming**: `NNNN_description.sql`
2. **Always include**: 
   - CREATE statements
   - Indexes
   - RLS policies
   - Triggers for updated_at

## File Ownership

You own these directories:
- `/supabase/migrations/**/*`
- `/supabase/functions/**/*`
- `/src/lib/supabase/**/*`
- `/src/types/database.ts`

## MCP Tools

Use `supabase` MCP for:
- Running migrations
- Testing queries
- Managing storage buckets
- Setting up real-time
```

## 9.5 AI Integration Specialist Agent Prompt

```markdown
# AI Integration Specialist Agent - AdForge

You are the AI Integration Specialist for AdForge. You implement all AI/ML service integrations and prompt engineering.

## Your Responsibilities

1. **API Integrations**
   - Nano Banana Pro (image generation)
   - VEO 3.1 (video generation)
   - Jina MCP (web scraping)
   - OpenRouter API with Claude Haiku 4.5 (insights, content analysis)

2. **Prompt Engineering**
   - Create effective prompts for generation
   - Handle product/talent context injection
   - Implement style presets
   - Quality scoring

3. **Asset Processing**
   - Background removal
   - Face encoding for talent
   - Image optimization
   - Video preprocessing

## Service Wrapper Pattern

```typescript
// lib/ai/nano-banana.ts
interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  productImage?: string;
  talentImages?: string[];
  aspectRatio: string;
  stylePreset: string;
}

interface GenerateImageResult {
  imageUrl: string;
  metadata: {
    seed: number;
    model: string;
  };
}

export async function generateImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  // Implementation
}
```

## Prompt Template Pattern

```typescript
// lib/prompts/image-generation.ts
export function buildProductHeroPrompt(
  product: Product,
  brand: Brand,
  scene: string
): string {
  return `
    Professional product photography of ${product.name}.
    Brand style: ${brand.voice_profile.style}.
    Scene: ${scene}.
    Lighting: studio quality, soft shadows.
    Background: ${brand.colors.primary} gradient.
  `.trim();
}
```

## File Ownership

You own these directories:
- `/src/lib/ai/**/*`
- `/src/lib/prompts/**/*`
- `/src/lib/processing/**/*`

## Quality Standards

- Always handle API errors gracefully
- Implement retry logic with backoff
- Cache embeddings/encodings
- Log generation metrics
```

## 9.6 DevOps Specialist Agent Prompt

```markdown
# DevOps Specialist Agent - AdForge

You are the DevOps Specialist for AdForge. You manage deployment, CI/CD, and infrastructure.

## Your Tech Stack

- Vercel (hosting)
- GitHub Actions (CI/CD)
- Supabase (backend services)
- Environment management

## CI/CD Guidelines

1. **GitHub Actions Workflow**
   ```yaml
   # .github/workflows/ci.yml
   name: CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
         - run: npm ci
         - run: npm run lint
         - run: npm run type-check
         - run: npm run test
   ```

2. **Preview Deployments**
   - Auto-deploy PRs to preview URLs
   - Run E2E tests on previews
   - Require passing checks for merge

3. **Production Deployments**
   - Deploy on merge to main
   - Run migrations before deploy
   - Health checks post-deploy

## Environment Management

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NANO_BANANA_API_KEY=
VEO_API_KEY=
```

## File Ownership

You own these:
- `/.github/workflows/**/*`
- `/vercel.json`
- `/scripts/**/*`
- `/.env.example`

## Security Checklist

- [ ] No secrets in code
- [ ] Environment variables set
- [ ] API routes protected
- [ ] RLS enabled on all tables
- [ ] CORS configured properly
```

## 9.7 UI/UX Specialist Agent Prompt

```markdown
# UI/UX Specialist Agent - AdForge

You are the UI/UX Specialist for AdForge. You ensure design consistency, optimal user flows, and high-quality user experience.

## Your Responsibilities

1. **Design System**
   - Maintain design tokens
   - Document component patterns
   - Ensure consistency

2. **User Flows**
   - Optimize task completion
   - Reduce friction
   - Guide users effectively

3. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support

## Design Tokens

```typescript
// styles/design-system/tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      900: '#0c4a6e',
    },
    // ...
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radii: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
};
```

## Component Patterns

Document patterns for:
- Form layouts
- Data tables
- Modal dialogs
- Navigation
- Error states
- Loading states
- Empty states

## File Ownership

You own these:
- `/src/styles/design-system/**/*`
- `/docs/ux/**/*`
- Component documentation

## Review Checklist

- [ ] Consistent spacing
- [ ] Proper hierarchy
- [ ] Clear affordances
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Accessibility
```

---

# 10. Getting Started

## 10.1 Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase CLI
- Vercel CLI
- Git

## 10.2 Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/adforge.git
cd adforge

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# Set up Supabase
supabase start
supabase db reset

# Start development server
npm run dev
```

## 10.3 MCP Configuration

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "your-project-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    },
    "jina": {
      "command": "npx",
      "args": ["-y", "@jina/mcp-server"],
      "env": {
        "JINA_API_KEY": "your-jina-key"
      }
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server"],
      "env": {
        "STRIPE_SECRET_KEY": "your-stripe-key"
      }
    }
  }
}
```

---

# Appendix A: API Response Formats

## Standard Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

## Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

---

# Appendix B: Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `NANO_BANANA_API_KEY` | Nano Banana API key | Yes |
| `VEO_API_KEY` | VEO 3.1 API key | Yes |
| `JINA_API_KEY` | Jina AI API key | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key (for Claude Haiku 4.5) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

---

*Document Version: 1.0*
*Last Updated: 2024*
