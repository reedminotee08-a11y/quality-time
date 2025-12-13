import { supabase } from './lib/supabase.ts';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by fetching user profiles (or any table that should exist)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Supabase connection test failed:', error.message);
      return;
    }

    console.log('✅ Supabase connection successful!');
    console.log('Sample data:', data);
  } catch (error) {
    console.log('❌ Supabase connection test failed:', error);
  }
}

// Run the test
testSupabaseConnection();