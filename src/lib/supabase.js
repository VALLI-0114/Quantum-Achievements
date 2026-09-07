import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://lzwojngbqvsojdburrps.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d29qbmdicXZzb2pkYnVycnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTU2MzMsImV4cCI6MjEwNDM3MTYzM30.qBB_pE1gVe3jAB3Mq9yO49vlmw_KUWzSDqUQaH9TUUY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
