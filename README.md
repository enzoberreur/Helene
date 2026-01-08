# Hélène — The Menopause Copilot

<p align="center">
  <img src="screenshot/1.png" width="180" />
  <img src="screenshot/2.png" width="180" />
  <img src="screenshot/3.png" width="180" />
</p>
<p align="center">
  <img src="screenshot/4.png" width="180" />
  <img src="screenshot/5.png" width="180" />
  <img src="screenshot/6.png" width="180" />
</p>

**An AI-powered digital companion that helps women understand, anticipate, and manage perimenopause.**

## The Problem We Address

**Perimenopause is still a taboo, and a blind spot.**

Millions of women are navigating perimenopause silently, with data everywhere, but no intelligence to make sense of it.

### The Issue
- **It affects millions, yet remains largely invisible**
  - 6.6 million women affected in France alone
  - 14 million across Europe
  - 1 in 3 women in the workforce impacted
- **Women are left unheard, unprepared, and unsupported**
  - Symptoms dismissed or misdiagnosed
  - No dedicated tools for this 10-year transition
- **Information is fragmented and often unreliable**
  - Medical knowledge scattered across sources
  - Conflicting advice and myths persist
- **Most apps focus on fertility or post-menopause — this transition is overlooked**

### The Reality
- **Perimenopause lasts up to 10 years**
- **Affects mood, sleep, energy, focus** — symptoms that disrupt daily life
- **Impacts 1 in 3 women in the workforce** — with real professional consequences
- **6.6M women affected in France alone** — yet few solutions exist

### What Women Face Today
- **Don't understand what's happening** to their bodies
- **Feel alone with unpredictable symptoms** that vary day to day
- **Can't connect the dots** between symptoms, hormones, and life factors
- **Struggle to communicate** their experience to doctors
- **React to crises** instead of anticipating changes

Symptoms during this transition are wide-ranging (sleep disturbances, mood swings, energy crashes, hot flashes, anxiety, brain fog, joint pain…), fluctuate daily, and are hard to summarize—for yourself, or for a clinician. Most tools either feel too clinical, too generic, or don't connect the dots over time.

## Our Solution: The Menopause Copilot

**We don't replace doctors — we bridge the gap between daily life and medical care.**

Hélène transforms raw data into intelligence. It turns daily check-ins into clear trends, predictive insights, and a calmer, more informed experience—without adding friction or noise.

### What We Deliver
**Clear explanations & predictive insights**
- Understand patterns in your symptoms
- Anticipate changes instead of reacting to crises
- See connections between mood, sleep, hormones, and lifestyle

**Continuous emotional support**
- AI companion available 24/7
- Empathetic, personalized guidance
- Educational content when you need it

**Actionable medical intelligence**
- Standardized MENQOL scoring for clinical conversations
- Exportable medical reports for healthcare providers
- Track what matters: cycles, hormones, symptoms, treatments

### Why It Matters
We help women:
- **Understand** what's happening in their bodies
- **Anticipate** changes instead of reacting to them
- **Feel supported**, informed, and in control
- **Communicate effectively** with healthcare providers
- **Make informed decisions** about their health

## How Hélène Helps
- **Fast daily check-in**: mood, energy, sleep, symptoms, and optional notes.
- **Trends that make sense**: charts and summaries over the last weeks.
- **Emotional journal**: note history + sentiment trends for your written reflections.
- **Medical tracking**: 
  - Menstrual cycle tracking with calendar visualization
  - Hormone monitoring (estrogen, progesterone, testosterone levels)
  - Surgical risk assessment based on cardiovascular factors
  - MENQOL clinical scoring for standardized symptom evaluation
- **Educational content**: curated articles about menopause with markdown formatting
- **Personalization**: menopause stage + goals, used to tailor the experience.
- **Medical PDF export**: a concise report you can share with your clinician.
- **Reminders**: optional daily notifications.
- **AI companion (optional)**: empathetic guidance with contextual awareness (demo mode supported).

## Market Opportunity

### Business Context
- **$41B FemTech worldwide market**, set to double by 2030
- **Strong acceleration of women's digital health in Europe**
- **No AI-driven solution dedicated to perimenopause** — we're filling a critical gap
- **Target**: 14M women in Europe entering perimenopause (ages 40-55)

### Our Competitive Edge
- **AI-first approach**: Predictive insights, not just data logging
- **Perimenopause-specific**: Designed for this 10-year transition, not fertility or post-menopause
- **Medical-grade**: MENQOL clinical scoring, exportable reports, evidence-based content
- **Empathetic UX**: Fast daily check-ins, clear visualizations, emotional support

## Key Performance Indicators (MVP)

### User Adoption
- Number of registered users
- Daily Active Users (DAU)
- User growth rate over time
- Onboarding completion rate

### Feature Usage
- Symptom tracking frequency (daily check-ins)
- AI Copilot interactions per user
- Insights viewed per session
- Medical tracking engagement (cycles, hormones, risk assessments)

### Activation & Retention
- 7-day retention rate
- 30-day retention rate
- Time to first meaningful action
- Return visits after insights or alerts

### Engagement Signals
- Sessions per user per week
- Average session duration
- Content engagement (articles read, trends viewed)
- Export actions (PDF medical reports generated)

**These KPIs validate adoption, engagement, and early product–market fit.**

---

## Technical Implementation
- **App**: React Native 0.76 (Expo SDK 51)
- **Backend**: Supabase (Auth + PostgreSQL 15)
- **Analytics**: computed trends + sentiment analysis from check-in history
- **Medical features**: MENQOL scoring system, cycle tracking with triggers, hormone monitoring
- **Charts**: `react-native-chart-kit` for data visualization
- **Calendar**: `react-native-calendars` for menstrual cycle tracking
- **Content**: `react-native-markdown-display` for formatted articles
- **Reports**: `expo-print` + `expo-sharing`
- **Notifications**: `expo-notifications`
- **AI**: Google Gemini API with contextual awareness (can be disabled / demo mode)
- **i18n**: English + French (300+ translations)

### Architecture Overview
```
┌─────────────────┐
│  React Native   │  ← User Interface (iOS/Android)
│   Mobile App    │     12 screens, 3500+ lines
└────────┬────────┘
         │
         ├──────────────┐
         │              │
    ┌────▼─────┐   ┌────▼──────┐
    │ Supabase │   │  Gemini   │
    │ Backend  │   │    AI     │
    └──────────┘   └───────────┘
    
    8 tables          Context-aware
    15 triggers       Empathetic chat
    RLS policies      Predictive insights
```

### Key Technical Decisions
1. **React Native + Expo**: Fast iteration, cross-platform, rich ecosystem
2. **Supabase**: Real-time sync, built-in auth, PostgreSQL power, generous free tier
3. **Gemini API**: Advanced reasoning, long context window (perfect for health history)
4. **PL/pgSQL triggers**: Automatic MENQOL calculations, data consistency
5. **Client-side sentiment analysis**: Privacy-first emotional tracking

## Run Locally
```bash
npm install
npm start
```

Then launch on a device/simulator:
```bash
npm run ios
# or
npm run android
```

> **Note**: First launch may take 2-3 minutes while Metro bundler compiles JavaScript.

## Configure Supabase & AI
Create a `.env` file (never commit it) based on `.env.example`.

Required:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Optional (only if you disable demo mode):
- `EXPO_PUBLIC_GEMINI_API_KEY`
- `EXPO_PUBLIC_GEMINI_MODEL`

Runtime config is injected via `app.config.js` and read in:
- `src/lib/supabase.js`
- `src/lib/gemini.js`

### Setting up Supabase
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. In SQL Editor, run the scripts in order:
   - `supabase-schema-v2.sql`
   - `supabase-trigger-v2.sql`
   - `supabase/menstrual-tracking.sql`
   - `supabase/menstrual-tracking-patch.sql`
4. Copy your project URL and anon key to `.env`

### Getting Gemini API Key
1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API key"
3. Create a new key or use an existing one
4. Add to `.env` (or leave blank for demo mode)

## Database (Supabase)
SQL scripts are included to bootstrap and evolve the schema:
- `supabase-schema-v2.sql` — Main database schema (8 tables)
- `supabase-trigger-v2.sql` — Triggers and functions (15 triggers in PL/pgSQL)
- `supabase/menstrual-tracking.sql` — Menstrual cycle tracking schema
- `supabase/menstrual-tracking-patch.sql` — Patch for flow_duration constraint
- `supabase/daily-logs.sql` — Daily check-in logs
- `supabase/sentiment-migration.sql` — Sentiment analysis features
- `supabase/treatment-migration.sql` — Treatment tracking

Key features:
- Automatic MENQOL score calculation via triggers
- Row-level security (RLS) policies for data privacy
- Automated timestamps and user tracking

### Database Schema Overview
- **users_profile**: Menopause stage, goals, treatment info
- **daily_check_ins**: Mood, energy, sleep, symptoms (30+ symptom types)
- **emotional_notes**: Journal entries with sentiment analysis
- **menstrual_cycles**: Period tracking with flow data
- **hormone_levels**: Estrogen, progesterone, testosterone monitoring
- **surgical_risk**: Cardiovascular risk factors assessment
- **menqol_scores**: Clinical scoring with 4 domains (vasomotor, psychosocial, physical, sexual)
- **treatments**: Medication and therapy tracking

## Project Structure
```
.
├── App.js
├── src/
│   ├── screens/          # 12 app screens
│   │   ├── HomeScreen.js           # Dashboard with overview
│   │   ├── CheckInScreen.js        # Daily symptom logging
│   │   ├── TrendsScreen.js         # Data visualization
│   │   ├── JournalScreen.js        # Emotional notes history
│   │   ├── ProfileScreen.js        # Settings & personalization
│   │   ├── ChatScreen.js           # AI companion
│   │   ├── BlogScreen.js           # Educational articles
│   │   ├── MenstrualTrackingScreen.js  # Cycle calendar
│   │   ├── HormoneTrackingScreen.js    # Hormone levels
│   │   ├── SurgicalRiskScreen.js       # Risk assessment
│   │   ├── OnboardingScreen.js     # First-time setup
│   │   └── SignUpScreen.js         # Authentication
│   ├── components/       # Reusable UI components (BottomSheet, etc.)
│   ├── lib/              # Supabase + Gemini clients
│   ├── utils/            # Insights, sentiment, notifications, PDF generation
│   ├── i18n/             # Translations (FR/EN)
│   └── constants/        # Theme tokens
├── supabase/             # Database schemas and migrations
└── screenshot/           # App screenshots
```

### Code Statistics
- **Total Lines**: ~3,500 across 12 screens
- **Languages**: JavaScript (ES6+), JSX, SQL (PL/pgSQL)
- **Components**: 15+ reusable UI components
- **Translations**: 300+ strings in FR/EN
- **Database**: 8 tables, 15 triggers, 20+ RLS policies

## Key Features by Screen
- **Home**: Quick overview with mood trends, upcoming check-ins, recent symptoms
- **Check-in**: Log daily mood (1-10), energy, sleep quality, symptoms, notes
- **Trends**: Visual charts for mood, sleep, symptom frequency over time
- **Journal**: Browse past notes with sentiment analysis (positive/negative/neutral)
- **Medical Tracking**: 
  - Menstrual calendar with flow tracking
  - Hormone level monitoring (visual charts)
  - Surgical risk calculator (cardiovascular factors)
- **Blog**: Curated menopause articles with markdown formatting
- **Chat**: AI companion with context from recent check-ins
- **Profile**: Menopause stage, treatment info, export medical PDF

## Clinical Standards
- **MENQOL Score**: Standardized menopause quality of life assessment
  - 4 domains: Vasomotor, Psychosocial, Physical, Sexual
  - Automatic calculation: converts user scale (0-5) to clinical scale (0-8)
  - Formula: `score = (sum_symptoms / count_symptoms / 5) * 8`
- **Risk Assessment**: Evidence-based cardiovascular risk factors for surgical planning

## Vision and Next Steps

### Our Vision
**To build the leading AI companion for perimenopause, supporting women through a complex life transition with clarity, empathy, and intelligence.**

We envision a platform that:
- **Predicts** symptom patterns before they disrupt life
- **Connects** women with each other and with compassionate healthcare
- **Normalizes** perimenopause conversations in society
- **Bridges** the gap between daily experience and medical expertise
- **Empowers** women to advocate for themselves

### Roadmap 2026-2027

#### Phase 1: Enhanced Intelligence (Q1-Q2 2026)
- **Expand AI models** for improved personalization and prediction
- **Integrate wearable data** (sleep quality, activity levels, stress signals)
- **Advanced pattern recognition** to anticipate symptom clusters
- **Predictive analytics** for healthcare provider dashboards

#### Phase 2: Community & Care (Q3 2026)
- **Launch moderated community forum** so women can share experiences and feel less alone
- **Healthcare provider portal** for secure data sharing and remote monitoring
- **Expand content library** with expert-validated resources
- **Multi-language support** (Spanish, German, Italian)

#### Phase 3: Ecosystem Integration (Q4 2026-2027)
- **Clinical partnerships** with menopause specialists and hospitals
- **Treatment tracking** with medication reminders and effectiveness monitoring
- **Research collaboration** to contribute to perimenopause science
- **International expansion** beyond Europe

### Why Now?
- **Awareness is rising**: Perimenopause is finally becoming part of public conversation
- **AI is ready**: LLMs enable truly empathetic, context-aware health companions
- **Market is underserved**: No major player owns this space yet
- **Demographic wave**: Millions of Gen-X and elder millennials entering perimenopause

---

## Team & Contact

**Built at Albert School** — AI & Data Science Program 2025-2026

**Project Timeline**:
- Development start: November 2025
- MVP completion: January 2026
- Technology stack finalization: December 2025
- Clinical validation: Ongoing

**Technologies Mastered**:
- Mobile development (React Native, Expo)
- Backend architecture (Supabase, PostgreSQL, PL/pgSQL)
- AI integration (Google Gemini API, NLP, sentiment analysis)
- Healthcare standards (MENQOL, clinical scoring systems)
- Data visualization and UX design

---

## License

This project is part of an academic MVP development program. All rights reserved.

For questions or collaboration inquiries, please refer to the project repository.

---

## Acknowledgments

- **Albert School** for the educational framework and support
- **FemTech community** for inspiration and validation
- **Healthcare professionals** who provided clinical insights
- **Beta testers** for their invaluable feedback

---

**Hélène** — Empowering women through perimenopause, one insight at a time.
