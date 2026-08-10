# TheAnors - System Architecture & Technical Specification

**Version:** 1.0  
**Date:** August 9, 2026  
**Architecture:** Modular Monolith (Next.js)

---

## 1. System Overview

TheAnors is built as a modular monolith using Next.js. Single codebase, separate modules per workflow, shared infrastructure.

```
┌─────────────────────────────────────────────────────────┐
│                  TheAnors Frontend (Next.js)            │
│         Mobile-optimized React Components               │
│     (Dashboard, Engagement, Captions, Newsletter, etc)   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│            Next.js API Routes (Modular)                 │
│  /api/engagement  /api/captions  /api/newsletter        │
│  /api/scripting   /api/comments  /api/shared            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────┐         ┌──────────────────┐
│   API Layer      │         │  Prompt Store    │
│  (Abstracted)    │         │  (Guidelines)    │
│                  │         │                  │
│ • Gemini         │         │ • Master prompts │
│ • Claude (later) │         │ • Variables      │
│ • OpenAI (later) │         │ • Templates      │
└──────────────────┘         └──────────────────┘
        ↓                             ↓
┌─────────────────────────────────────────────────────────┐
│            External Services / APIs                      │
│                                                         │
│ • Gemini LLM API (Free tier)                           │
│ • Google Vision API (OCR, free tier)                   │
│ • Transcription APIs (Groq, Deepgram, Gladia, Assembly) │
│ • Google Sheets API (theme history)                    │
└─────────────────────────────────────────────────────────┘
        ↓
┌──────────────────┐         ┌──────────────────┐
│  Supabase        │         │   Neon DB        │
│  (Real-time)     │         │   (Analytics)    │
│                  │         │                  │
│ • Active work    │         │ • Historical     │
│ • Selections     │         │ • Feedback       │
│ • Metadata       │         │ • Training data  │
│ • User accounts  │         │ • Dashboard data │
└──────────────────┘         └──────────────────┘
```

---

## 2. Architecture Layers

### 2.1 Frontend Layer

**Location:** `/app` (Next.js App Router)

```
app/
├── layout.tsx              (Root layout, global styles)
├── page.tsx                (Dashboard)
├── engagement/
│   └── page.tsx            (Engagement workflow UI)
├── captions/
│   └── page.tsx            (Caption generation UI)
├── scripting/
│   └── page.tsx            (Content scripting UI)
├── newsletter/
│   └── page.tsx            (Newsletter creation UI)
├── comments/
│   └── page.tsx            (Initial comments UI)
├── settings/
│   ├── page.tsx            (Settings page)
│   ├── prompts/
│   │   └── page.tsx        (Manage master prompts)
│   └── accounts/
│       └── page.tsx        (Platform accounts)
└── components/
    ├── Dashboard.tsx
    ├── EngagementForm.tsx
    ├── CommentOptions.tsx
    ├── ProgressBar.tsx
    └── ... (shared components)
```

**Design System:**
- Font: Arial (via Tailwind + custom CSS)
- Colors: #000000 (black), #FFFFFF (white), #DC143C (crimson red)
- Spacing: Tight (4px base unit, compact margins)
- Responsive: Mobile-first (viewport width 380px minimum)

**Key Components:**

1. **EngagementForm.tsx**
   - Batch input for LinkedIn links
   - Shows progress (8/30)
   - Displays 3 comments per link
   - Select + copy functionality

2. **CommentOptions.tsx**
   - Shows 3 options for each post
   - Display: option number, comment text, original link
   - User can click checkbox "posted"

3. **CaptionDisplay.tsx**
   - Shows 5 captions (LinkedIn, TikTok, IG, YouTube title, YouTube desc)
   - Editable fields
   - Copy buttons for each

4. **NewsletterBuilder.tsx**
   - Theme input field
   - Post link validator
   - Generated content preview (Word export ready)

5. **ScriptingBuilder.tsx**
   - Input: guidelines + topic/link
   - Output: 3 script options
   - Expandable details per option

### 2.2 API Layer (Backend)

**Location:** `/app/api` (Next.js API Routes)

```
api/
├── engagement/
│   ├── generate-comments.ts    (Core logic)
│   ├── list-comments.ts        (Fetch batch comments)
│   ├── mark-posted.ts          (Update status)
│   └── export-csv.ts           (CSV export)
├── captions/
│   ├── generate.ts             (Generate captions for all platforms)
│   ├── transcribe.ts           (Trigger transcription)
│   └── export.ts               (Export options)
├── scripting/
│   ├── brainstorm.ts           (Ideation)
│   ├── repurpose.ts            (Video link → repurposing ideas)
│   ├── generate-script.ts      (Script generation)
│   └── export.ts
├── newsletter/
│   ├── validate-post.ts        (Check if post fits theme)
│   ├── generate-content.ts     (Draft newsletter body)
│   └── export.ts
├── comments/
│   ├── generate-initial.ts     (3 comment options)
│   └── mark-posted.ts
├── shared/
│   ├── prompt-manager.ts       (Load/manage prompts)
│   ├── llm-client.ts           (Abstracted API calls to Gemini/Claude)
│   ├── ocr-service.ts          (Google Vision OCR)
│   ├── transcription-service.ts (Groq/Deepgram/etc)
│   └── database.ts             (Supabase/Neon clients)
└── auth/
    ├── login.ts
    └── logout.ts
```

**Each API route handles:**
- Request validation
- LLM API call (via abstracted client)
- Database writes (Supabase for live, Neon for analytics)
- Response formatting
- Error handling

### 2.3 Abstraction Layer

**Location:** `/lib/api-abstraction.ts`

This is the key to swappable providers.

```typescript
// Current: Gemini
// Future: Claude, OpenAI via config swap

interface LLMProvider {
  generateCompletion(prompt: string, context?: object): Promise<string>
}

class GeminiProvider implements LLMProvider {
  async generateCompletion(prompt: string, context?: object) {
    // Call Gemini API with prompt
    // Return response
  }
}

class ClaudeProvider implements LLMProvider {
  async generateCompletion(prompt: string, context?: object) {
    // Call Claude API with prompt
    // Return response
  }
}

// Factory function
function getLLMClient(): LLMProvider {
  const provider = process.env.LLM_PROVIDER // "gemini" or "claude"
  if (provider === "gemini") return new GeminiProvider()
  if (provider === "claude") return new ClaudeProvider()
  throw new Error("Invalid LLM provider")
}

export const llm = getLLMClient()
```

**Usage in API routes:**

```typescript
const response = await llm.generateCompletion(prompt, { platform, postContent })
```

Swap provider = change `.env` variable. Done.

---

## 3. Database Architecture

### 3.1 Supabase (Real-time, Live Work)

**Schema:**

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Prompts (master prompts per workflow)
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  workflow VARCHAR (engagement, captions, scripting, newsletter, comments),
  prompt_text TEXT NOT NULL,
  variables JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Engagement batches (current work)
CREATE TABLE engagement_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  batch_number INT,
  total_posts INT,
  status VARCHAR (in_progress, completed),
  created_at TIMESTAMP DEFAULT now()
);

-- Engagement posts (individual posts in batch)
CREATE TABLE engagement_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES engagement_batches(id),
  post_link VARCHAR NOT NULL,
  platform VARCHAR (linkedin_personal, linkedin_company, instagram, tiktok),
  post_content TEXT,
  post_metadata JSONB (poster_name, emojis, format),
  status VARCHAR (pending, commented, skipped),
  selected_comment_option INT (1-3),
  created_at TIMESTAMP DEFAULT now()
);

-- Generated comments
CREATE TABLE engagement_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES engagement_posts(id),
  option_number INT (1-3),
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Captions (video → captions)
CREATE TABLE captions_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  video_link_or_file VARCHAR,
  transcript TEXT,
  status VARCHAR (transcribing, generating, completed),
  created_at TIMESTAMP DEFAULT now()
);

-- Platform-specific captions
CREATE TABLE captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES captions_jobs(id),
  platform VARCHAR (linkedin, tiktok, instagram, youtube_title, youtube_desc),
  caption_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Newsletter
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  week_date DATE,
  theme VARCHAR NOT NULL,
  selected_post_link VARCHAR,
  draft_content TEXT,
  status VARCHAR (draft, approved, sent),
  created_at TIMESTAMP DEFAULT now()
);

-- Initial comments
CREATE TABLE initial_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  post_link VARCHAR,
  platform VARCHAR,
  option_1 TEXT,
  option_2 TEXT,
  option_3 TEXT,
  selected_option INT,
  status VARCHAR (pending, posted),
  created_at TIMESTAMP DEFAULT now()
);

-- Content scripts
CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  topic VARCHAR,
  repurpose_source_link VARCHAR (optional),
  script_type VARCHAR (talking_head, trend_acting, carousel, flyer),
  option_1 TEXT,
  option_2 TEXT,
  option_3 TEXT,
  selected_option INT,
  status VARCHAR (draft, approved, sent),
  created_at TIMESTAMP DEFAULT now()
);

-- Theme history
CREATE TABLE theme_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  week_date DATE,
  theme VARCHAR,
  created_at TIMESTAMP DEFAULT now()
);
```

**Supabase Features Used:**
- Real-time subscriptions (live updates as user works)
- Row-level security (user can only see their data)
- Automatic backups
- Migrations support (for future schema updates)

### 3.2 Neon (Analytics & Training Data)

**Schema:** (Mirror of Supabase with additional tracking)

```sql
-- Everything from Supabase PLUS:

-- Feedback/Learning log
CREATE TABLE feedback_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  workflow VARCHAR,
  decision_point VARCHAR (which_comment_selected, which_script_approved, etc),
  option_presented JSONB (all options shown),
  option_selected INT (which one user picked),
  engagement_metric FLOAT (optional - likes, comments, shares if available),
  created_at TIMESTAMP
);

-- User preferences (learned over time)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID,
  workflow VARCHAR,
  preference_type VARCHAR (tone, style, length, formality),
  preference_value VARCHAR,
  frequency_selected INT (how many times this was chosen),
  updated_at TIMESTAMP
);

-- Performance metrics
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY,
  user_id UUID,
  workflow VARCHAR,
  metric_type VARCHAR (time_saved, approval_rate, quality_score),
  metric_value FLOAT,
  period DATE,
  created_at TIMESTAMP
);
```

**Neon Features Used:**
- Async analytics queries (don't slow down live work)
- Separate connection pool
- Historical data for trend analysis
- Support for future model fine-tuning

### 3.3 Data Sync Strategy

**Write Flow:**

```
User Action (e.g., select comment)
    ↓
Next.js API route
    ↓
Write to Supabase (immediate, real-time)
    ↓
Log event to sync queue
    ↓
Nightly job (11 PM): Batch sync queue → Neon
    ↓
Calculate preferences, metrics, feedback patterns
```

**Why Dual DB:**
- **Supabase:** Fast, real-time, for daily work
- **Neon:** Analytical queries don't slow live work

**Sync Code:**

```typescript
// In /lib/sync.ts
async function syncToNeon() {
  const events = await supabase.from('sync_queue').select('*')
  
  for (const event of events) {
    // Write to Neon analytics table
    await neon.query(`INSERT INTO feedback_log ...`, event)
  }
  
  // Calculate preferences
  const preferences = await neon.query(`
    SELECT workflow, preference_type, COUNT(*) as frequency
    FROM feedback_log
    GROUP BY workflow, preference_type
  `)
  
  // Store back in Supabase for real-time access
  await supabase.from('user_preferences').upsert(preferences)
}

// Scheduled via cron or GitHub Actions
// Runs nightly at 11 PM UTC
```

### 3.4 Backup & Migration Strategy

**Backups:**

```
Supabase:
  - Automatic daily snapshots (7-day retention)
  - Point-in-time recovery available

Neon:
  - Automatic backups every 24 hours
  - 30-day retention
  - Custom snapshots on demand
```

**Migration Path (Future):**

```typescript
// If migrating to self-hosted PostgreSQL on VPS:
// 1. Schema is identical (both are PostgreSQL)
// 2. Export Neon database as SQL dump
// 3. Import to VPS PostgreSQL
// 4. Update connection strings in .env
// 5. Done

// Minimal vendor lock-in because both are standard PostgreSQL
```

---

## 4. API Integration

### 4.1 Gemini LLM API

**Endpoint:** `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`

**Free Tier Limits:**
- 1,000 requests per day
- 10 requests per minute
- 4 requests per minute for vision tasks

**Usage in TheAnors:**

```typescript
// /lib/gemini-client.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateContent(prompt: string, context?: object) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })
  
  const fullPrompt = `
    ${masterPrompt}
    
    Context: ${JSON.stringify(context)}
    
    User Request: ${prompt}
  `
  
  const result = await model.generateContent(fullPrompt)
  return result.response.text()
}
```

**Cost:** Free (until ₦500/month after free tier exhausted)

### 4.2 Google Vision API

**For:** OCR on Instagram carousel posts, TikTok captions

**Endpoint:** `https://vision.googleapis.com/v1/images:annotate`

**Free Tier:** 1,000 requests per month

**Usage:**

```typescript
// /lib/ocr-service.ts
import vision from "@google-cloud/vision"

const client = new vision.ImageAnnotatorClient()

export async function extractTextFromImage(imageUrl: string) {
  const request = {
    image: { source: { imageUri: imageUrl } },
  }
  
  const [result] = await client.textDetection(request)
  return result.textAnnotations[0].description
}
```

**Cost:** Free for MVP

### 4.3 Transcription APIs

**Current Setup (from your existing tool):**
- Groq (Whisper)
- Deepgram
- Gladia
- Assembly AI

**Usage:**

```typescript
// /lib/transcription-service.ts
// Abstract layer for your existing APIs

interface TranscriptionProvider {
  transcribe(videoFile: File | url: string): Promise<string>
}

export class TranscriptionService {
  private providers = {
    groq: new GroqProvider(),
    deepgram: new DeepgramProvider(),
    gladia: new GladiaProvider(),
    assemblyai: new AssemblyAIProvider()
  }
  
  async transcribe(videoInput: any, preferredProvider?: string) {
    const provider = this.providers[preferredProvider || "groq"]
    return await provider.transcribe(videoInput)
  }
}
```

**Cost:** Use your existing API credits/tiers

### 4.4 Google Sheets API

**For:** Reading theme history spreadsheet

**Endpoint:** `https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}`

**Usage:**

```typescript
// /lib/sheets-client.ts
import { google } from "googleapis"

const sheets = google.sheets({ version: "v4", auth })

export async function getThemeHistory(spreadsheetId: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A:B" // Theme + Date columns
  })
  
  return response.data.values
}
```

**Cost:** Free (limited to 100 requests/min)

---

## 5. Modular Structure

### 5.1 Module Organization

```
lib/
├── modules/
│   ├── engagement/
│   │   ├── engagement.service.ts
│   │   ├── engagement.prompts.ts
│   │   ├── engagement.types.ts
│   │   └── engagement.utils.ts
│   ├── captions/
│   │   ├── captions.service.ts
│   │   ├── captions.prompts.ts
│   │   ├── captions.types.ts
│   │   └── captions.utils.ts
│   ├── scripting/
│   │   ├── scripting.service.ts
│   │   ├── scripting.prompts.ts
│   │   ├── scripting.types.ts
│   │   └── scripting.utils.ts
│   ├── newsletter/
│   │   ├── newsletter.service.ts
│   │   ├── newsletter.prompts.ts
│   │   ├── newsletter.types.ts
│   │   └── newsletter.utils.ts
│   └── comments/
│       ├── comments.service.ts
│       ├── comments.prompts.ts
│       ├── comments.types.ts
│       └── comments.utils.ts
├── shared/
│   ├── database.ts        (Supabase + Neon clients)
│   ├── llm-client.ts      (Abstracted LLM calls)
│   ├── prompts.ts         (Prompt loading)
│   ├── ocr.ts
│   ├── transcription.ts
│   ├── export.ts          (PDF, Word, CSV generation)
│   └── types.ts           (Shared TypeScript types)
```

### 5.2 Module Pattern

Each workflow module follows this pattern:

```typescript
// engagement/engagement.service.ts
export class EngagementService {
  async generateComments(
    postLinks: string[],
    prompt: string,
    guideline?: object
  ): Promise<CommentOption[][]> {
    // 1. Extract post content from links
    // 2. Load master prompt
    // 3. Call LLM for each post
    // 4. Store results in Supabase
    // 5. Log to Neon feedback queue
    // 6. Return formatted options
  }
}

// engagement/engagement.prompts.ts
export const ENGAGEMENT_PROMPT_TEMPLATE = `
  You are helping draft LinkedIn comments...
  ${variables}
  ...
`

// engagement/engagement.types.ts
export interface CommentOption {
  option: 1 | 2 | 3
  text: string
  style: string
}

export interface EngagementPost {
  id: string
  link: string
  platform: string
  content: string
  selectedCommentOption?: number
}
```

**Benefits:**
- Each module is independent
- Easy to test
- Easy to add new workflows (just create new module)
- Shared utilities prevent duplication

---

## 6. File Export System

**Location:** `/lib/shared/export.ts`

```typescript
import PDFDocument from "pdfkit"
import { Document, Packer, Paragraph, HeadingLevel } from "docx"
import { stringify } from "csv-stringify/sync"

export class ExportService {
  static async toPDF(content: string, filename: string) {
    const doc = new PDFDocument()
    doc.fontSize(11).font("Arial")
    doc.text(content)
    doc.pipe(fs.createWriteStream(`/outputs/${filename}.pdf`))
    doc.end()
  }

  static async toWord(content: string, filename: string) {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: content,
              style: "Normal"
            })
          ]
        }
      ]
    })
    
    const buffer = await Packer.toBuffer(doc)
    fs.writeFileSync(`/outputs/${filename}.docx`, buffer)
  }

  static toCSV(data: object[], filename: string) {
    const csv = stringify(data, { header: true })
    fs.writeFileSync(`/outputs/${filename}.csv`, csv)
  }

  static toMarkdown(content: string, filename: string) {
    fs.writeFileSync(`/outputs/${filename}.md`, content)
  }
}
```

---

## 7. Error Handling & Logging

**Location:** `/lib/shared/logger.ts`

```typescript
export class Logger {
  static async log(
    workflow: string,
    action: string,
    data: object,
    userId: string
  ) {
    await supabase.from("logs").insert({
      workflow,
      action,
      data,
      user_id: userId,
      timestamp: new Date()
    })
  }

  static async error(
    workflow: string,
    error: Error,
    context: object,
    userId: string
  ) {
    await supabase.from("error_logs").insert({
      workflow,
      error_message: error.message,
      error_stack: error.stack,
      context,
      user_id: userId,
      timestamp: new Date()
    })
  }
}
```

**Try-catch in all API routes:**

```typescript
export async function POST(req: Request) {
  try {
    const result = await engagementService.generateComments(...)
    return Response.json(result)
  } catch (error) {
    await Logger.error("engagement", error, { body }, userId)
    return Response.json({ error: "Generation failed" }, { status: 500 })
  }
}
```

---

## 8. Authentication

**For MVP:** Simple email + magic link (Supabase Auth)

```typescript
// /app/api/auth/login.ts
export async function POST(req: Request) {
  const { email } = await req.json()
  
  const { data, error } = await supabase.auth.signInWithOtp({ email })
  
  if (error) return Response.json(error, { status: 400 })
  return Response.json({ message: "Magic link sent" })
}

// Middleware to protect routes
// /lib/auth-middleware.ts
export async function requireAuth(handler: Function) {
  return async (req: Request) => {
    const session = await supabase.auth.getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    return handler(req, session.user)
  }
}
```

**Usage:**

```typescript
export const POST = requireAuth(async (req, user) => {
  // User is authenticated
})
```

---

## 9. Environment Variables

```env
# Gemini API
GEMINI_API_KEY=xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx

# Neon
NEON_CONNECTION_STRING=postgresql://xxx

# Google Cloud (Vision API, Sheets API)
GOOGLE_CLOUD_PROJECT_ID=xxx
GOOGLE_CLOUD_KEY_FILE=/path/to/key.json

# Transcription APIs
GROQ_API_KEY=xxx
DEEPGRAM_API_KEY=xxx
GLADIA_API_KEY=xxx
ASSEMBLYAI_API_KEY=xxx

# App Config
LLM_PROVIDER=gemini  # Swap to "claude" or "openai" later
NEXTJS_ENV=production
```

---

## 10. Build & Deployment

### 10.1 Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Dev server at http://localhost:3000
```

### 10.2 Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### 10.3 Deployment (Vercel)

```bash
# Connect GitHub repo to Vercel
# Vercel auto-deploys on push to main

# Or manual deploy:
npm install -g vercel
vercel --prod
```

**Cost:** Free tier covers MVP traffic

### 10.4 Self-Hosted (Future VPS)

```bash
# Deploy to VPS (e.g., DigitalOcean, Linode)
# 1. Install Node.js, PostgreSQL
# 2. Clone repo
# 3. npm install
# 4. npm run build
# 5. Use PM2 for process management

npm install -g pm2
pm2 start "npm start" --name theanors
pm2 startup
```

---

## 11. Testing Strategy

**Unit Tests:**

```typescript
// __tests__/engagement.service.test.ts
describe("EngagementService", () => {
  test("generateComments returns 3 options per post", async () => {
    const service = new EngagementService()
    const result = await service.generateComments(
      ["https://linkedin.com/..."],
      "Engagement prompt"
    )
    
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(3)
  })
})
```

**Integration Tests:**

```typescript
// __tests__/engagement.integration.test.ts
describe("Engagement Workflow", () => {
  test("Full flow: paste links → generate → store → export", async () => {
    // 1. Mock API call to Gemini
    // 2. Call API route /api/engagement/generate-comments
    // 3. Assert data stored in Supabase
    // 4. Assert CSV export contains correct data
  })
})
```

**Testing Tools:**
- Jest (unit + integration)
- Vitest (faster alternative)
- Playwright (end-to-end UI tests)

---

## 12. Performance Considerations

### 12.1 API Rate Limiting

**Gemini (free tier):** 1,000 requests/day, 10/min

**Rate limiter:**

```typescript
// /lib/rate-limiter.ts
import Bottleneck from "bottleneck"

const geminiLimiter = new Bottleneck({
  minTime: 6000, // 1 request per 6 seconds = 10/min
  maxConcurrent: 1
})

export const limitedGeminiCall = geminiLimiter.wrap(
  async (prompt: string) => await generateContent(prompt)
)
```

### 12.2 Caching

**For repeated prompts/configs:**

```typescript
// /lib/cache.ts
import Redis from "redis"

const redis = Redis.createClient(process.env.REDIS_URL)

export async function getCachedPrompt(workflow: string) {
  const cached = await redis.get(`prompt:${workflow}`)
  if (cached) return JSON.parse(cached)
  
  const prompt = await loadFromDB(workflow)
  await redis.set(`prompt:${workflow}`, JSON.stringify(prompt), { EX: 3600 })
  return prompt
}
```

**Cache everything:**
- Master prompts (24h TTL)
- User settings (1h TTL)
- Theme history (24h TTL)

### 12.3 Database Query Optimization

**Supabase indexes:**

```sql
CREATE INDEX idx_engagement_posts_batch_id ON engagement_posts(batch_id);
CREATE INDEX idx_engagement_posts_user_id ON engagement_posts(user_id);
CREATE INDEX idx_feedback_log_user_workflow ON feedback_log(user_id, workflow);
```

**Avoid N+1 queries:**

```typescript
// WRONG
const batches = await supabase.from("engagement_batches").select("*")
for (const batch of batches) {
  const posts = await supabase.from("engagement_posts")
    .select("*")
    .eq("batch_id", batch.id) // SLOW: N queries
}

// RIGHT
const batches = await supabase.from("engagement_batches").select(
  "*, engagement_posts(*)" // Single query with joins
)
```

---

## 13. Security Considerations

### 13.1 API Key Management

- **Never** commit `.env` to Git
- Use `.env.local` (local development) and Vercel's environment variables
- Rotate keys quarterly

### 13.2 Row-Level Security (RLS)

```sql
-- Users can only see their own data
ALTER TABLE engagement_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_data" ON engagement_batches
  FOR ALL
  USING (auth.uid() = user_id);

-- Apply same policy to all tables
```

### 13.3 Input Validation

```typescript
// Always validate before processing
import { z } from "zod"

const EngagementSchema = z.object({
  postLinks: z.array(z.string().url()),
  prompt: z.string().min(10)
})

export async function POST(req: Request) {
  const body = await req.json()
  const validated = EngagementSchema.parse(body) // Throws if invalid
  
  // Proceed with validated data
}
```

---

## 14. Monitoring & Observability

**Basic setup:**

```typescript
// /lib/monitoring.ts
import Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})

export function captureException(error: Error) {
  Sentry.captureException(error)
}
```

**Track:**
- LLM API response times
- Database query times
- Error rates per workflow
- User engagement (which workflows used most)

---

## 15. Cost Breakdown (Monthly, Naira)

| Service | Free Tier Limit | Cost (Naira) |
|---------|-----------------|-------------|
| Gemini API | 1,000 requests/day | ₦0 initially, then ~₦2,000 |
| Google Vision API | 1,000 requests/month | ₦0 |
| Supabase | 500 MB storage, 2GB bandwidth | ₦0 (or ₦5,000 for Pro) |
| Neon | 3 free databases, 3 GB storage | ₦0 |
| Vercel | 100 GB bandwidth | ₦0 |
| **Total** | | **₦0-7,000/month** |

**Budget:** Start on free tier. Move to paid tiers only when you exceed limits.

---

## 16. Deployment Checklist

- [ ] Set up GitHub repo with `.env.example`
- [ ] Configure Supabase project
- [ ] Configure Neon project
- [ ] Set up Gemini API key
- [ ] Configure Google Cloud Vision
- [ ] Create Vercel project
- [ ] Connect Vercel to GitHub
- [ ] Set environment variables in Vercel
- [ ] Run `npm install` + `npm run build` locally (test)
- [ ] Deploy to Vercel
- [ ] Test on production URL
- [ ] Set up Sentry for error tracking
- [ ] Configure Supabase backups
- [ ] Document setup in README

---

## 17. Glossary

**Modular Monolith:** Single codebase with separate modules per feature, deployed as one unit.

**Abstraction Layer:** Code that hides implementation details (e.g., swappable LLM providers).

**RLS:** Row-Level Security—database enforces per-row access control.

**TTL:** Time-to-Live—how long cached data stays valid.

**Rate Limiting:** Throttle API requests to stay within quotas.

---

**Architecture Status:** Ready for Build  
**Next Step:** Design System Specification + Component Library
