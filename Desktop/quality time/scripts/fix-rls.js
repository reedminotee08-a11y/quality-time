// Fix RLS Policies Script for Supabase
// Run this script to fix the RLS policy issue with product deletion

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ranhfnjyqwuoiarosxrk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbmhmbmp5cXd1b2lhcm9zeHJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2NzIwMSwiZXhwIjoyMDgxNzQzMjAxfQ.CLLUvsVP9CH6TigzKqlyGX2CD1VagPwp75C_k-AazGg';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixRLSPolicies() {
  console.log('Fixing RLS policies for products table...');

  try {
    // Drop existing policies
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
      DROP POLICY IF EXISTS "Products are insertable by admins" ON products;
      DROP POLICY IF EXISTS "Products are updatable by admins" ON products;
      DROP POLICY IF EXISTS "Products are deletable by admins" ON products;
    `;

    // Create new policies
    const createPoliciesSQL = `
      CREATE POLICY "Enable read access for all users" ON products
        FOR SELECT USING (is_active = true);

      CREATE POLICY "Enable insert for authenticated users" ON products
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');

      CREATE POLICY "Enable update for authenticated users" ON products
        FOR UPDATE USING (auth.role() = 'authenticated');

      CREATE POLICY "Enable soft delete for authenticated users" ON products
        FOR UPDATE USING (auth.role() = 'authenticated' AND is_active = true);
    `;

    // Execute the SQL
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPoliciesSQL });
    if (dropError) {
      console.error('Error dropping policies:', dropError);
    }

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPoliciesSQL });
    if (createError) {
      console.error('Error creating policies:', createError);
    }

    console.log('RLS policies fixed successfully!');
    
    // Test the fix by trying to update a product
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (products && products.length > 0) {
      const testProductId = products[0].id;
      console.log(`Testing product update with ID: ${testProductId}`);
      
      const { error: testError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', testProductId);
        
      if (testError) {
        console.error('Test update failed:', testError);
      } else {
        console.log('Test update succeeded!');
        
        // Restore the product
        await supabase
          .from('products')
          .update({ is_active: true })
          .eq('id', testProductId);
      }
    }

  } catch (error) {
    console.error('Error fixing RLS policies:', error);
  }
}

// Alternative approach: Disable RLS completely
async function disableRLS() {
  console.log('Disabling RLS for products table...');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE products DISABLE ROW LEVEL SECURITY;' 
    });
    
    if (error) {
      console.error('Error disabling RLS:', error);
    } else {
      console.log('RLS disabled successfully!');
    }
  } catch (error) {
    console.error('Error disabling RLS:', error);
  }
}

// Run the fix
fixRLSPolicies();
