# Glatko — Montenegro's Premier Service Marketplace

A premium reverse-marketplace connecting customers with verified professionals for home services, boat maintenance, and more across Montenegro.

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Supabase account

### Installation

```bash
git clone https://github.com/inforonavisa-max/glatko-frontend.git
cd glatko-frontend
cp .env.example .env.local  # Fill in your keys
npm install
npm run dev  # http://localhost:3001
```

### Build

```bash
npm run build
npm start
```

### Quality Checks

```bash
npm run lint          # ESLint
npm run i18n-check    # 9-language consistency
npm run precommit     # Full pre-commit check
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Realtime + Storage)
- **Styling**: Tailwind CSS + shadcn/ui + Aceternity UI Pro
- **Charts**: Tremor
- **Animation**: Framer Motion
- **i18n**: next-intl (9 languages)
- **State**: nuqs (URL state)
- **Analytics**: Vercel Analytics + Speed Insights
- **Deployment**: Vercel

## Supported Languages

Turkish, English, German, Italian, Russian, Ukrainian, Serbian, Montenegrin, Arabic (RTL)

## Project Structure

```
app/
├── [locale]/              # Locale-routed pages
│   ├── (auth)             # Login, register, forgot/reset
│   ├── admin/             # Admin panel
│   ├── become-a-pro/      # Professional onboarding
│   ├── dashboard/         # Customer dashboard
│   ├── inbox/             # Messaging (Supabase Realtime)
│   ├── notifications/     # In-app notifications
│   ├── pro/dashboard/     # Professional dashboard (Tremor)
│   ├── provider/[id]/     # Professional profiles
│   ├── providers/         # Provider directory + search
│   ├── request-service/   # Service request wizard
│   ├── review/            # Review system
│   ├── services/          # Service categories
│   └── settings/          # User settings
├── api/
│   ├── cron/              # Vercel cron jobs
│   └── health/            # Health check endpoint
components/
├── aceternity/            # Aceternity UI Pro components
├── glatko/                # Glatko-specific components
├── landing/               # Landing page components
├── seo/                   # SEO (Schema.org)
└── ui/                    # Shared UI (shadcn + custom)
lib/
├── supabase/              # Supabase server functions
└── hooks/                 # Custom hooks
dictionaries/              # i18n JSON files (9 languages)
```

## Key Features

- **Reverse Marketplace**: Customers post requests, professionals bid
- **Blind Bidding**: Up to 4 anonymous bids per request
- **Real-time Messaging**: Supabase Realtime powered chat
- **Review System**: Simultaneous reveal after both parties review
- **Professional Dashboard**: Tremor analytics, availability calendar, service packages
- **Search & Discovery**: Full-text search, filters, category browsing
- **SEO Optimized**: Sitemap, robots.txt, Schema.org, OG metadata
- **9 Languages**: Full i18n with RTL support (Arabic)
- **Dark/Light Mode**: System-aware theme switching
- **Premium Design**: Glassmorphism, Aceternity UI, Framer Motion animations

## Environment Variables

See `.env.example` for the full list of required variables.

## License

Proprietary — All rights reserved.
