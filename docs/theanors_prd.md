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
- Accept user guidelines/prompts as system context via a per-workflow chatbot interface
- Leverage a Multi-Model LLM Gateway (Groq, Gemini, Qwen, etc.) selected via a dropdown
- Store decisions in dual databases for feedback loops (self-training)
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

**Purpose:** Generate weekly newsletter content using uploaded Excel theme history, Gemini LLM theme generation, multi-post theme validation, and Word export.

**Workflow:**

1. **Excel Theme History Upload:**
   - User uploads an Excel spreadsheet (`.xlsx`/`.xls`/`.csv`) containing historical newsletter themes, past topics, and content performance.
   - The application parses and stores the theme history locally without needing external Google Sheets API links.

2. **AI Theme Generation & Selection (Multi-Model LLM):**
   - The selected LLM analyzes the uploaded Excel spreadsheet archive to brainstorm and suggest brand-new, relevant newsletter themes.
   - User can select one of the LLM-generated themes or manually enter/refine a weekly theme (for Friday delivery).

3. **Multi-Post Input (2+ LinkedIn Posts):**
   - User brings **two or more LinkedIn posts** related to the selected theme (providing post links or post content).

4. **Multi-Post Validation (Multi-Model LLM):**
   - The selected LLM evaluates the 2+ LinkedIn posts against the chosen theme:
     - Checks individual fit of each post to the overall theme.
     - Evaluates synergy, cohesion, and narrative flow across all provided posts.
     - Provides a validation report (fit score, alignment rationale, soft flags, or refinement suggestions).
   - If flagged as "close but not quite" or rejected, user can adjust post selection or request theme/angle iterations.

5. **Newsletter Content Generation (Multi-Model LLM):**
   - Once validated, the selected LLM synthesizes the 2+ LinkedIn posts and theme to draft the full newsletter:
     - Intro tying the theme and posts together
     - Main body (expanding on key insights synthesized from all selected posts)
     - Actionable takeaways and Call-to-Action (CTA)

6. **Review & Export:**
   - User reviews, edits, and approves the generated newsletter.
   - Export draft as a Microsoft Word document (`.docx`).

**Input:**
- Uploaded Excel spreadsheet (`.xlsx`/`.xls`/`.csv` file containing theme history)
- Selected or LLM-generated weekly theme
- Two or more LinkedIn posts (links or content text)

**Output:**
- Word document (`.docx` ready to send)
- LLM theme recommendations
- Multi-post theme validation & alignment report

**Frequency:** Weekly (Fridays)

**Validation Logic:**
- Dual/Multi-post cohesion analysis (validates that 2+ posts work together under the theme)
- Soft flags ("close but not quite") for borderline post combinations
- Gemini LLM iteration loop for theme/post refinement

**Key Features:**
- Direct Excel spreadsheet upload & local parsing (no Google Sheets link required)
- LLM theme ideation from Excel archive
- LLM multi-post theme validation (2+ posts)
- Multi-post content synthesis into newsletter
- Word document export (`.docx`)
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

### 7.1 Multi-Model LLM Layer

The application routes text generation requests through a multi-model gateway. Next to each chatbot prompt input, the user selects their preferred model from a dropdown menu. All models are accessed via free tiers:

1. **allam-2-7b:** 30 req/min, 7,000 req/day (500K tokens/day limit)
2. **groq/compound:** 30 req/min, 250 req/day (No token limit)
3. **groq/compound-mini:** 30 req/min, 250 req/day (No token limit)
4. **qwen/qwen3.6-27b:** 30 req/min, 1,000 req/day (200K tokens/day limit)
5. **openai/gpt-oss-120b:** 30 req/min, 1,000 req/day (200K tokens/day limit)
6. **openai/gpt-oss-20b:** 30 req/min, 1,000 req/day (200K tokens/day limit)
7. **Gemini:** 10 req/min, 1,000 req/day (Free tier)

**Limits Behavior:**
- If the user exhausts a model's daily quota, the system alerts them in the UI to switch to a different model.
- All request quotas automatically reset at **1:00 AM WAT** daily.
- All models must strictly inherit and follow the **Global Brand Voice** and the **Workflow Master Prompt** assembled at runtime.

### 7.2 Cascading Transcription System (Silent Auto-Failover)

For audio and video transcription tasks, the application routes the input through a cascading failover system to ensure 100% availability without out-of-pocket costs:

1. **Groq Whisper (whisper-large-v3 / whisper-large-v3-turbo):** Primary choice. Free, fast. 20 requests/minute, 2,000 requests/day, 8 hours (28,800 seconds) of audio per day. Resets at 1:00 AM WAT.
2. **Deepgram:** Secondary choice. Silent automatic fallback. Capped at a **maximum of 30 minutes total use** (uses $200 trial credits, does not refresh).
3. **AssemblyAI:** Tertiary choice. Silent automatic fallback. Capped at a **maximum of 20 minutes total use** (uses $50 trial credits, does not refresh).
4. **Gemini API:** Final safety net. Direct audio/video processing capability of the Gemini free tier.

**Transcription Confirmation Flow:**
- After any transcription completes, the raw text is displayed to the user.
- The user reviews the transcript, edits/corrects any misheard words manually, and clicks a **Confirm** button.
- Clicking "Confirm" triggers the next workflow step (e.g., generating caption styles or scripting repurposing). This confirmation step applies uniformly to all transcription providers.

### 7.3 Vision/OCR

- Google Vision API (free tier: 1000 requests/month)
- Used for: IG carousel OCR, TikTok caption reading

---

## 8. Prompts & Guidelines

**Global Context:**
- **Global Brand Voice:** A shared input field storing the founder's overarching voice, brand information, and core KPIs. This context is injected into *every* workflow request.

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
- **Font:** Arial (custom WOFF system font)
- **Spacing:** Tight (compact mobile-first layout built with TailwindCSS and GSAP animations)
- **Colors:** Brand Green (Forest Green #1C5308, Sage Green #4F8238, Lime Green #D6FFB9) + Brand Blue (Vibrant Blue #005FF8, Sky Blue #9FC9FD) + Brand Pink (Vibrant Pink #FF99FF, Lavender Pink #FEE0FC) as accents.
- **Responsive:** Mobile-first (viewport width 380px minimum)

**Common Interface Elements (On All Generation Screens):**
1. **Global Reset Timer:** Displays countdown to daily 1:00 AM WAT reset (e.g., "Limits reset in 4h 23m").
2. **LLM Dropdown Selector:** Located adjacent to generation inputs. Shows list of available models (groq/compound, qwen3.6-27b, allam-2-7b, openai/gpt-oss-120b, gemini, etc.) along with their current usage and daily request counts.
3. **Limit Reached Panel:** If a chosen LLM's limit is hit, shows a friendly alert card in Lavender Pink: *"You hit the daily limit for [Model], please change the dropdown menu to a different model to keep chatting/generating for free!"*
4. **Self-Learning Feedback Indicators:** Every generated output has actions:
   - **Accept** (positive feedback log)
   - **Edit** (stores modifications in Neon DB)
   - **Keep in Memory Toggle** (saves custom preference in Neon context)
   - **Forget/Delete Learning Button** (clears learning pattern for this choice)

**Key Screens:**

1. **Dashboard**
   - Quick stats (engagement comments posted today, scripts approved, newsletters drafted, reset countdown).
   - Quick links to each workflow.
   - Global Brand Voice Panel: A shared textarea storing founder's voice details, brand info, and target KPIs injected into all workflow calls.

2. **Content Scripting**
   - Workflow Chatbot: Local chatbot interface with editable master prompt.
   - Input: Guidelines, topic, URL link (IG/TikTok/YouTube) or audio/video file.
   - Transcription Preview Panel: Shows raw transcript + manual "Confirm" button (active for any video/audio input).
   - Output: 3 generated script options (talking head, trend acting, carousel text, flyer text) with a model selector dropdown.
   - Action: Edit, export (Markdown/PDF/Word), toggle "Keep in memory".

3. **Engagement**
   - Workflow Chatbot: Local chatbot interface with editable master prompt.
   - Batch Input: Textarea to paste 5–30 LinkedIn links.
   - Model Dropdown: Multi-model selection with live limit displays.
   - Output: Staggered reveal of 3 comment options per link. original post text visible.
   - Progress Bar: Fills smoothly (e.g., "8 of 30 completed") using GSAP.
   - Action: Select option, copy, mark as posted, swipe to archive.

4. **Captions**
   - Workflow Chatbot: Local chatbot interface with editable master prompt.
   - Input: Video file upload, video link, or pasted script.
   - Transcription Selector: Select preferred transcription engine (shows remaining minutes/quota).
   - Transcription Preview Panel: Displays transcribed text + manual "Confirm" button. Proceeding to caption generation is blocked until the user clicks confirm.
   - Output: 5 captions (LinkedIn, TikTok, Instagram, YouTube title, YouTube description).
   - Action: Edit, copy, export (TXT, SRT/VTT subtitles, CSV).

5. **Newsletter**
   - Workflow Chatbot: Local chatbot interface with editable master prompt.
   - Input: Excel theme history file upload (`.xlsx`/`.xls`/`.csv` parsed locally) + 2 or more LinkedIn post inputs (URLs or text).
   - Theme Generator: Gemini/LLM analyzes Excel and generates a list of weekly theme recommendations.
   - Cohesion Report Panel: Visual report validating if the 2+ LinkedIn posts align with the selected theme (scores, warnings, alignment details).
   - Output: Complete newsletter draft (intro, main points, call-to-action).
   - Action: Review, approve, export as Word (`.docx`).

6. **Initial Comments**
   - Workflow Chatbot: Local chatbot interface with editable master prompt.
   - Input: Post link or raw text + platform type.
   - Output: 3 initial comment options (witty, thoughtful, platform-specific tone).
   - Action: Select, copy, mark posted.

7. **Settings**
   - Global Brand Voice input textarea.
   - Master prompts editor (tabbed panels to modify default prompts for each workflow).
   - API keys entry panel (Groq, Gemini, Deepgram, AssemblyAI, Supabase, Neon).
   - Data management: view training memory list, delete specific memories, download analytical backup.

---


## 10. Tech Stack

**Frontend:**
- Next.js (React 19) with App Router
- TypeScript
- Tailwind CSS (for structure, custom colors, WOFF font, tight spacing)
- GSAP (GreenSock Animation Platform) + utility animation libraries (for clean, snappy, slop-free micro-interactions, page swaps, list reveals)

**Backend:**
- Next.js API routes (modular by feature, handling prompt routing and transcription cascades)
- Node.js runtime

**Databases (Dual-Storage & Self-Learning):**
- Supabase (PostgreSQL, real-time database for active sessions, user inputs, and workflow configs)
- Neon (PostgreSQL, analytics database for decision logging, feedback pattern tracking, and self-learning calculations)

**APIs & Free Engines:**
- Groq API (whisper-large-v3, allam-2-7b, groq/compound, qwen3.6-27b, gpt-oss-120b, etc.)
- Gemini API (theme suggestions, multi-post newsletter compilation, 4th fallback transcription)
- Deepgram API (transcription backup, max 30 mins total)
- AssemblyAI API (transcription backup, max 20 mins total)
- Google Vision API (OCR for Instagram/TikTok images)
- Local Excel Parser (xlsx / SheetJS for parsing uploaded xlsx/csv theme archives)

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
