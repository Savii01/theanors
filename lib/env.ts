import { z } from "zod";

const envSchema = z.object({
  // AI Config
  LLM_PROVIDER: z.enum(["gemini", "claude", "openai"]).default("gemini"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Neon DB
  DATABASE_URL: z.string().optional(),
  NEON_CONNECTION_STRING: z.string().optional(),

  // Transcription
  GROQ_API_KEY: z.string().optional(),
  DEEPGRAM_API_KEY: z.string().optional(),

  // Google Integration
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().optional(),

  // App Config
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn("⚠️ Environment variables validation warning:", result.error.format());
  }
  return result.success
    ? result.data
    : (process.env as unknown as Env);
}
