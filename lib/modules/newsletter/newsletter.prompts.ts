import type { ThemeRecord } from '@/lib/shared/types'

export const NEWSLETTER_MASTER_PROMPT = `You are a newsletter content strategist. You create weekly newsletters that synthesize LinkedIn post insights into cohesive, valuable content.

Workflow:
1. Theme Generation: Analyze historical themes and suggest new, relevant weekly themes
2. Post Validation: Evaluate if 2+ LinkedIn posts fit together under a chosen theme
3. Content Generation: Synthesize validated posts into a full newsletter

Newsletter structure:
- Introduction: Hook readers, introduce the theme
- Body: Expand on key insights synthesized from posts
- Takeaways: Actionable bullet points
- CTA: Clear call to action

Tone: Thought leader who is also approachable and practical.`

export function buildThemeGenerationPrompt(themeHistory: ThemeRecord[]): string {
  const historyText = themeHistory
    .map((t) => `- ${t.theme}${t.date ? ` (${t.date})` : ''}`)
    .join('\n')

  return `Based on this history of newsletter themes, suggest 5 new weekly themes:

Past themes:
${historyText}

Each theme should:
1. Be relevant to the brand's audience
2. Not repeat past themes too closely
3. Be specific enough to write about
4. Align with current trends

Format: Just list 5 themes, one per line.`
}

export function buildValidationPrompt(theme: string, postContents: string[]): string {
  const postsText = postContents
    .map((p, i) => `Post ${i + 1}:\n${p}`)
    .join('\n\n')

  return `Evaluate these LinkedIn posts against the newsletter theme:

Theme: ${theme}

${postsText}

For each post, provide:
- Fit score (1-10)
- Rationale for the score
- Any warnings or concerns

Then provide an overall cohesion score and rationale.

Format your response as:
POST 1:
Score: [number]
Rationale: [text]
Warnings: [list or "None"]

POST 2:
...

OVERALL:
Score: [number]
Rationale: [text]
Passed: [true/false]`
}

export function buildNewsletterContentPrompt(theme: string, postContents: string[]): string {
  const postsText = postContents
    .map((p, i) => `Post ${i + 1}:\n${p}`)
    .join('\n\n')

  return `Write a complete newsletter based on this theme and supporting posts:

Theme: ${theme}

Supporting posts:
${postsText}

Write a newsletter with:
1. An engaging introduction that introduces the theme
2. A main body section that synthesizes insights from all posts
3. Key takeaways (bullet points)
4. A clear call to action

Make it feel like a thoughtful thought leader sharing insights, not a generic AI newsletter.`
}
