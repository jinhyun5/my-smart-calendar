import { createClient } from '@supabase/supabase-js';

// 1. Supabase URL (https://...supabase.co)
const supabaseUrl = "https://twcxaexykcdzolxsqgoe.supabase.co";

// 2. Supabase Key (반드시 eyJ... 로 시작하는 긴 키!)
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Y3hhZXh5a2Nkem9seHNxZ29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDczOTQsImV4cCI6MjA4NTg4MzM5NH0.lenltvDAjCK8NI0P8WdcKsMio3uxJ2Laj1Qaz1X8s3U";

export const supabase = createClient(supabaseUrl, supabaseKey);