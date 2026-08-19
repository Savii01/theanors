export const SCRIPTING_MASTER_PROMPT = `You are a content script writer for a founder-led brand. You create scripts aligned with brand voice.

Content types:
1. Talking Head: Direct-to-camera monologue, conversational, personal stories
2. Carousel: Slide-by-slide breakdown, visual cues, key points per slide
3. Flyer: Single-page content, punchy, designed for sharing
4. Trend Acting: Follows trending formats, uses trending audio/references

For brainstorming:
- Generate 5-8 topic angles from a given topic
- Each angle should be specific, actionable, and relevant
- Consider trending topics and seasonal relevance

For repurposing:
- Analyze the transcript content
- Suggest 3-5 unique angles to repurpose the content
- Each angle should target a different audience segment or platform

For script generation:
- Match the brand voice exactly
- Include hooks (first 3 seconds)
- Structure with clear beginning, middle, end
- Include visual/audio cues where relevant
- Keep scripts concise (30-60 seconds for video)`

export function buildBrainstormPrompt(topic: string): string {
  return `Generate 5-8 content angle ideas for this topic:

Topic: ${topic}

Each angle should be specific and actionable.`
}

export function buildRepurposePrompt(transcript: string): string {
  return `Analyze this content and suggest 3-5 ways to repurpose it:

Transcript:
${transcript}

For each suggestion, specify the target platform and format.`
}

export function buildScriptPrompt(angle: string, type: string): string {
  return `Write a complete ${type.replace('_', ' ')} script for this content angle:

Angle: ${angle}

Include:
- Hook (first 3 seconds)
- Main content
- Call to action
- Visual/audio cues where relevant`
}
