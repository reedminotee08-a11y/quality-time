<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Quality Time Luxury Watches

This contains everything you need to run your luxury watch e-commerce app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials to `.env`
3. Run the app:
   `npm run dev`

## Supabase Setup

This project uses Supabase for backend services. Make sure your Supabase project has the following tables:
- `products`
- `user_profiles`
- `orders` (for checkout functionality)

The Supabase connection is configured in `lib/supabase.ts`.
