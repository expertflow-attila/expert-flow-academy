import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("SUPABASE_URL és SUPABASE_SERVICE_ROLE_KEY kötelező");
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "public" },
});

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  stripe_price_id: string | null;
  price_huf: number | null;
  published: boolean;
  created_at: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  position: number;
  title: string;
  description: string | null;
};

export type CourseLesson = {
  id: string;
  module_id: string;
  position: number;
  title: string;
  body_html: string | null;
  cloudflare_stream_uid: string | null;
  duration_seconds: number | null;
  is_preview: boolean;
};

export type Membership = {
  id: string;
  user_id: string;
  course_id: string;
  stripe_session_id: string | null;
  granted_at: string;
};
