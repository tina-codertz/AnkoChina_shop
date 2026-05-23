import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://xjkktopxylwsuhpaaflk.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFlYWNiYWMwLTdkMzEtNDBiZS1iNTQ0LTQ5ZjhmYTJmMjQ1NyJ9.eyJwcm9qZWN0SWQiOiJ4amtrdG9weHlsd3N1aHBhYWZsayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc5NDQzMjMwLCJleHAiOjIwOTQ4MDMyMzAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.E--RAoijm8y2yGL9vhuLkrEAs-oXwDtQb--jx2l8o5I';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };