# TheAnors - Product Requirements Document

**Version:** 1.0  
**Date:** August 9, 2026  
**Status:** Ready for Build  

---

## 1. Executive Summary

TheAnors is a modular content operations platform designed for Executive Assistants managing founder/brand social presence across multiple platforms. It automates repetitive workflows while maintaining brand voice and strategic alignment.

**Core Value:** Reduce manual content workflow time by 70% while maintaining quality and brand consistency.

**Target User:** EAs managing founder LinkedIn, company LinkedIn, Instagram, TikTok, YouTube, and newsletter content.

**MVP Timeline:** 2 weeks

---

## 2. Problem Statement

Current workflow bottlenecks:

1. **Content Scripting:** Brainstorming → research → script generation requires manual context switching
2. **Engagement:** 30+ LinkedIn posts require manual review, copying, pasting, tracking (7 hours/week)
3. **Captions:** Videos need transcript → caption generation across 4+ platforms with different formats
4. **Newsletter:** Manual theme selection + content drafting (weekly)
5. **Initial Comments:** Boss posts need 3 comment options, manually generated

**Time Impact:** 7+ hours weekly on repetitive tasks. Designer/business growth suffers.

---

## 3. Product Overview

TheAnors is a modular monolith platform with five interconnected workflows:

1. **Content Scripting & Idea Creation**
2. **Engagement Management** 
3. **Caption Generation**
4. **Newsletter Creation**
5. **Initial Comments**

All workflows:
- Accept user guidelines/prompts as system context
- Use Gemini API (swappable to Claude/OpenAI later)
- Store decisions in dual databases for feedback loops
- Export to multiple formats (Markdown, PDF, Word, CSV)
- Mobile-friendly interface

---

## 4. Detailed Workflows

### 4.1 Content Scripting & Idea Creation

**Purpose:** Brainstorm, research, and generate content scripts aligned with brand voice.

**Workflow:**

1. User inputs: Brand guidelines, KPIs, goals
2. Tool generates topic ideas from trends/research
3. User can repurpose other people's posts:
   - Paste Instagram/TikTok/YouTube link
   - Tool extracts video/carousel content (OCR or download transcribe)
   - Tool explains the content
   - Tool suggests repurposing angles
4. User selects angle or modifies it
5. Tool auto-generates script options:
   - Talking head script
   - Trend acting script
   - Carousel content
   - Flyer content
6. User reviews and sends to founder for approval (external flow)
7. Approved script exported as Markdown/PDF/Word

**Input Types:**
- Text (guidelines, prompt)
- Links (IG carousel, TikTok, YouTube)
- Video files (uploaded via WhatsApp/direct upload)

**Output Types:**
- Markdown, PDF, Word documents
- Exportable to Google Drive/Notion

**Frequency:** 3-5 scripts weekly (depending on trends)

**Key Features:**
- Multi-format content output (talking heads, carousels, flyers)
- External approval loop (not in-app)
- Trend detection and repurposing suggestions
- Video transcription integration
- Brand voice validation

---

### 4.2 Engagement Management

**Purpose:** Automate commenting on founder's and company's posts across platforms.

**Workflow:**

1. User pastes 30 LinkedIn post links (can be in batches of 5+)
2. Tool extracts post text + metadata (poster name, emojis, format)
3. Tool applies engagement prompt (master prompt with context variables)
4. Tool generates 3 comment options per post
5. Options displayed in order with original post link visible
6. User reviews post and selects best comment
7. User clicks link, pastes comment on LinkedIn manually
8. Tool marks comment as "posted" via checkbox/reaction
9. Platform-based sorting:
   - Personal LinkedIn
   - Company LinkedIn
   - Instagram (needs image/video OCR or caption reading)
   - TikTok (needs image/video OCR or caption reading)
10. IG/TikTok posts: tool transcribes/OCRs content, suggests comments
11. Batch processing fine (not real-time)
12. All data logged with post link, comment selected, timestamp, platform

**Input:** 
- LinkedIn/IG/TikTok links
- Engagement guidelines prompt (master prompt)

**Output:**
- 3 comment options per post
- CSV export (post link, comment, platform, status)
- Dashboard showing progress (8/30 done, etc)

**Frequency:** Daily (30+ posts/day cyclically)

**Key Features:**
- Platform-aware commenting (different tone for IG vs LinkedIn)
- Batch processing (groups of 5 posts)
- One master prompt with context variables
- Multi-platform sorting
- Manual post-to-LinkedIn workflow (required by LinkedIn API constraints)
- Progress tracking dashboard
- CSV export for records

---

### 4.3 Caption Generation

**Purpose:** Auto-generate captions for different platforms from video/script/image content.

**Workflow:**

1. User uploads/links video or pastes script
2. If video: tool transcribes (uses existing Groq/Deepgram/Gladia/Assembly API)
3. Tool stores transcript
4. Tool generates captions for each platform:
   - LinkedIn (character limits, tone)
   - TikTok (hashtag-friendly, trendy tone)
   - Instagram (visual-driven language)
   - YouTube Title (SEO, 60 char limit)
   - YouTube Description (detailed, link-optimized)
5. For carousels/flyers: user pastes content text, tool generates captions
6. User can edit/approve each caption
7. Export options:
   - Individual captions per platform
   - Subtitle files (SRT, VTT for video)
   - Word document with all captions
   - CSV with platform-specific versions

**Input:**
- Video files (MP4, MOV, etc) or links (IG, TikTok, YouTube)
- Video scripts (text)
- Carousel/flyer content (text)

**Output:**
- Platform-specific captions
- SRT/VTT subtitle files
- Word document
- CSV export

**Storage:** Transcripts stored for caption generation reuse

**Frequency:** 3-5 videos weekly

**Key Features:**
- Multi-platform caption optimization
- Transcript reuse across platforms
- Subtitle file export
- Character limit awareness per platform
- Tone adjustment per platform

---

### 4.4 Newsletter Creation

**Purpose:** Generate weekly newsletter content with theme validation.

**Workflow:**

1. User manually inputs weekly theme (Friday delivery)
2. Tool accesses theme history spreadsheet (Google Sheets/Excel upload)
3. Tool suggests LinkedIn posts from founder's personal page that fit theme:
   - User provides LinkedIn post links or tool validates from history
   - Tool reads post content
   - Tool validates: "Does this post fit the theme?"
   - If flagged as "close but not quite" or rejected, user can:
     - Accept rejection (find different post)
     - Request iteration (tool suggests edits to theme or post selection)
4. Once post selected, tool generates newsletter content:
   - Intro tying to theme
   - Main body (expanding on post insights)
   - Call-to-action
5. User reviews and approves (can send externally)
6. Export as Word document

**Input:**
- Theme (manual input)
- Theme history spreadsheet (uploaded once per month)
- LinkedIn post links

**Output:**
- Word document (ready to send)
- Theme + post validation report

**Frequency:** Weekly (Fridays)

**Validation Logic:**
- Hard yes/no for old posts (they fit or don't)
- Soft flags ("close but not quite") for borderline posts
- Iteration loop if needed (suggest edits)
- No auto-suggest (user selects from available posts)

**Key Features:**
- Theme history tracking
- Post validation against theme
- Multi-option iteration
- Word document export
- External approval loop

---

### 4.5 Initial Comments

**Purpose:** Generate 3 comment options for founder's new posts before they go live.

**Workflow:**

1. When founder posts on any platform (personal LinkedIn, company LinkedIn, IG, TikTok):
   - User provides link or post details
   - Tool extracts post content
2. Tool generates 3 initial comment options:
   - Different tone/style variations
   - Platform-aware (LinkedIn vs IG tone differs)
   - Aligned with founder's voice
3. User selects best option, copies, pastes as first comment manually
4. Tool marks as "posted"
5. Data logged with post link, comment used, timestamp, platform

**Input:**
- Post link or post content
- Platform type
- Initial comment guidelines prompt (master prompt with variables)

**Output:**
- 3 comment options
- CSV log of posted comments

**Frequency:** Per post (variable)

**Platform Handling:**
- Personal LinkedIn: one tone
- Company LinkedIn: professional tone
- IG: casual, visual-focused
- TikTok: trendy, brief

**Key Features:**
- Multi-platform tone adjustment
- Master prompt with variables
- Post logging
- CSV export

---

## 5. Platform Support

- **LinkedIn** (personal + company pages)
- **Instagram** (company page)
- **TikTok** (company page)
- **YouTube** (captions for titles/descriptions)
- **Newsletter** (Word document format)

---

## 6. Data Storage & Feedback Loop

### 6.1 Dual Database Architecture

**Supabase (Real-Time):**
- Active workflows (engagement batches, current scripts)
- User inputs and selections
- Platform-specific data (post links, comments)
- Real-time collaboration if multi-user added later

**Neon (Analytics/Training):**
- Historical workflow data
- User decisions and selections
- Feedback logs (which comments were used, effectiveness)
- Training data for model improvement
- Analytics dashboards

### 6.2 Data Sync

- Supabase writes all workflow data in real-time
- Nightly batch sync to Neon for analytics/training
- Backup strategy: Supabase automatic backups + Neon backup snapshots
- Future migration support: Postgres-agnostic design (swappable VPS)

### 6.3 Feedback Loop System

**What We Learn:**
1. Which comment options user selected (and why not others)
2. Which engagement approaches get interactions
3. Which caption styles perform best per platform
4. Newsletter themes that resonate most
5. Script templates that founders approve fastest

**How It Informs Suggestions:**
1. Log every user selection + interaction
2. Calculate preference patterns (user often picks comment style X)
3. Store patterns in Neon
4. Adjust prompt context based on historical selections
5. Over time: "Based on your patterns, here's what typically works for you"

**Example:**
- User selects witty comments 70% of the time
- System learns to weight humor in suggestions
- Next batch prioritizes funny angle in option 1

---

## 7. API Strategy

### 7.1 Abstracted API Layer

All LLM calls go through abstracted provider layer:

```
App Request → API Abstraction Layer → Gemini (now)
                                    → Claude (later)
                                    → OpenAI (later)
```

Swapping providers = config change, not code rewrite.

### 7.2 Transcription APIs

Current stack (from existing tool):
- Groq (Whisper)
- Deepgram
- Gladia
- Assembly AI

Keep existing infrastructure, don't rebuild.

### 7.3 Vision/OCR

- Google Vision API (free tier: 1000 requests/month)
- Used for: IG carousel OCR, TikTok caption reading

---

## 8. Prompts & Guidelines

**Master Prompts by Workflow:**

1. **Content Scripting Prompt:**
   - Brand voice
   - Target audience
   - KPI focus
   - Content type (talking head, carousel, flyer)

2. **Engagement Prompt:**
   - Founder voice
   - Engagement style
   - Relationship-building focus
   - Platform tone modifier

3. **Caption Prompt:**
   - Tone per platform
   - SEO keywords (if YouTube)
   - Character limits
   - CTA style

4. **Newsletter Prompt:**
   - Newsletter voice
   - Structure (intro, body, CTA)
   - Tone (thought leader vs friend)

5. **Initial Comment Prompt:**
   - Comment styles (witty, thoughtful, question-based)
   - Length preferences
   - Platform tone modifiers

User provides these once, system uses them for all requests.

---

## 9. User Interface Requirements

**Design System:**
- Font: Arial
- Spacing: Tight (compact layout)
- Colors: Black/white base + crimson red accent
- Responsive: Mobile-first (accessible on phone)

**Key Screens:**

1. **Dashboard**
   - Quick stats (engagement posted today, scripts approved, newsletters sent)
   - Quick links to each workflow

2. **Content Scripting**
   - Input: guidelines, topic, link (if repurposing)
   - Output: 3 script options, expandable details
   - Action: Select, export, send to founder

3. **Engagement**
   - Batch input: paste 5-30 LinkedIn links
   - Output: 3 comments per link in order
   - Progress bar: 8/30 done
   - Platform filter: show LinkedIn/IG/TikTok separately
   - Action: Select comment, copy, mark as posted

4. **Captions**
   - Input: upload video or paste script
   - Status: "Transcribing..." → "Generating captions..."
   - Output: 5 captions (LinkedIn, TikTok, IG, YouTube title, YouTube desc)
   - Action: Edit, copy, export

5. **Newsletter**
   - Input: theme + theme history upload
   - Action: Paste LinkedIn post link, validate
   - Output: Newsletter draft in Word format
   - Action: Review, approve, export

6. **Initial Comments**
   - Input: Post link or content
   - Output: 3 comment options
   - Action: Select, copy, mark posted

7. **Settings**
   - Master prompts (one per workflow)
   - Platform accounts (which LinkedIn, IG, etc)
   - Export preferences
   - Data export/backup

---

## 10. Tech Stack

**Frontend:**
- Next.js (React) with App Router
- TypeScript
- Tailwind CSS (design system variables for Arial, colors, spacing)

**Backend:**
- Next.js API routes (modular by feature)
- Node.js runtime

**Databases:**
- Supabase (PostgreSQL, real-time)
- Neon (PostgreSQL, analytics)

**APIs:**
- Gemini (LLM, free tier for MVP)
- Google Vision (OCR)
- Existing transcription stack (Groq, Deepgram, Gladia, Assembly)

**File Export:**
- markdown-to-pdf (for generating PDFs)
- docx library (for Word documents)
- csv library (for exports)

**Hosting:**
- Vercel (Next.js) or self-hosted VPS (future)

**Dev Tools:**
- Git
- GitHub
- VS Code with Cursor/Copilot (for agent coding)

---

## 11. MVP Features (Week 1-2)

**Week 1:**
- Engagement workflow (core feature)
- Initial comments workflow
- Basic UI dashboard
- Gemini integration
- Supabase setup

**Week 2:**
- Caption generation (if video transcription ready)
- Newsletter workflow
- Content scripting (basic version)
- CSV export
- Mobile optimization

**Post-MVP (Nice to Have):**
- Advanced content scripting (video link repurposing)
- Analytics dashboard
- Feedback loop training
- Neon analytics integration
- Claude/OpenAI API swapping

---

## 12. Success Metrics

1. **Time Saved:** Engagement workflow reduces 7 hours → 2 hours weekly
2. **Consistency:** 100% of outputs follow brand guidelines
3. **Quality:** Founder approval rate 80%+ on suggestions
4. **Adoption:** User completes 3+ workflows daily by week 2

---

## 13. Future Roadmap

**Phase 2 (Weeks 3-4):**
- Feedback loop system (track which suggestions are used)
- Analytics dashboard (performance by workflow)
- Advanced video repurposing

**Phase 3 (Month 2):**
- Multi-user support (train others)
- Scheduled posting (via API if available)
- AI-powered insights (what content performs best)

**Phase 4 (Month 3+):**
- Productize for other EAs
- White-label version
- Advanced model fine-tuning

---

## 14. Constraints & Assumptions

**Constraints:**
- LinkedIn API doesn't allow auto-posting comments (manual paste required)
- Instagram/TikTok limited API access (manual engagement)
- Gemini free tier rate limits (~1000 requests/day)
- Budget: ₦0 monthly initially (use free tiers)

**Assumptions:**
- User has existing transcription API setup
- User can manually post comments on LinkedIn
- Master prompts provided upfront by user
- Founder approval is external (email/WhatsApp, not in-app)

---

## 15. Out of Scope (MVP)

- Real-time posting to social platforms
- Scheduled content publishing
- Advanced analytics dashboards
- Influencer collaboration management
- Paid advertising tools
- A/B testing framework
- Multi-workspace/team management

---

## Appendix: Workflow Comparison Table

| Workflow | Input | Output | Frequency | Time Saved |
|----------|-------|--------|-----------|------------|
| Content Scripting | Guidelines, topic, links | Script options (Markdown/PDF/Word) | 3-5/week | ~1 hour |
| Engagement | Post links (30+) | 3 comments per post | Daily | ~5 hours |
| Captions | Video/script/carousel text | Platform-specific captions | 3-5/week | ~2 hours |
| Newsletter | Theme + posts | Draft newsletter (Word) | Weekly | ~1.5 hours |
| Initial Comments | Post link | 3 comment options | Per post | ~15 min per post |

**Total Weekly Time Saved:** ~9-10 hours

---

**Document Status:** Ready for Architecture & Design System Phase  
**Next Step:** System architecture document + design system specifications
