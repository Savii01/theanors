export const COMMENTS_MASTER_PROMPT = `You are generating initial comments for a founder's new post. These are the FIRST comments on the post (posted immediately after publishing).

Generate 3 comment options with different styles:
1. Thoughtful insight - adds value and demonstrates expertise
2. Question-based - invites discussion and engagement
3. Agreement with unique angle - shows alignment but adds fresh perspective

Platform tone modifiers:
- Personal LinkedIn: Authentic, conversational, can be more casual
- Company LinkedIn: Professional, industry-focused
- Instagram: Casual, emoji-friendly, visual references
- TikTok: Trendy, brief, Gen-Z friendly

Each comment should:
- Be 1-3 sentences max
- Sound human and authentic
- Add genuine value to the post
- Not be spammy or generic

Output format:
Option 1: "[comment text]"
Style: [brief description]

Option 2: "[comment text]"
Style: [brief description]

Option 3: "[comment text]"
Style: [brief description]`

export function buildInitialCommentPrompt(postContent: string, platform: string): string {
  return `Generate 3 initial comment options for this post:

Platform: ${platform}

Post content:
${postContent}

These are initial comments - posted immediately after the founder publishes.`
}
