-- Seed data for TipVault demo

-- Create a demo user
INSERT INTO users (id, email, first_name, last_name, plan) 
VALUES ('demo-user-1', 'demo@tipvault.com', 'Demo', 'User', 'free')
ON CONFLICT (id) DO NOTHING;

-- Create a demo profile
INSERT INTO profiles (
  id, user_id, name, role, location, handle, bio,
  venmo_handle, cashapp_handle, zelle_info,
  google_review_url, yelp_review_url,
  is_active, enable_wallet_pass
) VALUES (
  'demo-profile-1', 
  'demo-user-1',
  'Alex Johnson',
  'Barista',
  'Coffee Corner - Downtown',
  'demo',
  'Your friendly neighborhood barista! ☕ Love making the perfect cup and brightening your day. Tips help me save for culinary school!',
  '@alex-barista',
  '$AlexCoffee',
  'alexjohnson@email.com',
  'https://g.page/coffeecorner/review',
  'https://yelp.com/biz/coffee-corner-downtown',
  true,
  true
) ON CONFLICT (handle) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio,
  venmo_handle = EXCLUDED.venmo_handle,
  cashapp_handle = EXCLUDED.cashapp_handle,
  zelle_info = EXCLUDED.zelle_info,
  google_review_url = EXCLUDED.google_review_url,
  yelp_review_url = EXCLUDED.yelp_review_url;

-- Add some sample tips
INSERT INTO tips (
  id, profile_id, amount, payment_method, customer_name, 
  note, rating, review_text, status, created_at
) VALUES 
  (
    gen_random_uuid(), 
    'demo-profile-1', 
    5.00, 
    'venmo', 
    'Sarah M.', 
    'Best coffee in town!', 
    5, 
    'Alex makes the most amazing latte art!', 
    'completed', 
    NOW() - INTERVAL '1 day'
  ),
  (
    gen_random_uuid(), 
    'demo-profile-1', 
    3.50, 
    'cashapp', 
    'Mike D.', 
    'Thanks for the extra shot!', 
    4, 
    'Great service, will be back!', 
    'completed', 
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(), 
    'demo-profile-1', 
    7.25, 
    'stripe', 
    'Emma L.', 
    'You saved my morning!', 
    5, 
    'Perfect cappuccino and friendly smile', 
    'completed', 
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;