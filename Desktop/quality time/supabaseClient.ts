
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mayiosolklryjbxxfohi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heWlvc29sa2xyeWpieHhmb2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDQ4OTcsImV4cCI6MjA4MDY4MDg5N30.9R6fDkbClw1XI2QS6oIBfpQAnyDGG9OvQwu1qA0i2no';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
