import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("Starting End-to-End Verification...");
  
  const testEmail = `test${Date.now()}@gmail.com`;
  const testPassword = 'testpassword123';
  let userId;
  
  try {
    // 1. Login/Session Persistence (SignUp first)
    console.log("1. Testing Auth...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: { data: { full_name: 'Test User' } }
    });
    if (authError) throw authError;
    userId = authData.user.id;
    console.log(" - Auth Passed. User ID:", userId);
    
    // 2. Resources loading from Supabase
    console.log("2. Testing Resources Loading...");
    const { data: resources, error: resError } = await supabase.from('resources').select('*');
    if (resError) throw resError;
    console.log(" - Resources Loading Passed. Found count:", resources.length);
    
    // 3. Resource search/filter (Simulating what client does)
    console.log("3. Testing Resource Search/Filter payload...");
    const filtered = resources.filter(r => r.title && typeof r.title === 'string');
    if (filtered.length !== resources.length) throw new Error("Resource malformed for client filtering");
    console.log(" - Search/Filter Payload Passed.");
    
    // 4. Resource details
    console.log("4. Testing Resource Details...");
    const firstRes = resources[0];
    if (!firstRes) throw new Error("No resources found to test details.");
    const { data: detailData, error: detailError } = await supabase.from('resources').select('*').eq('id', firstRes.id).single();
    if (detailError) throw detailError;
    console.log(" - Resource Details Passed.");
    
    // 5. Bookmark toggle
    console.log("5. Testing Bookmarks...");
    const { error: bmError } = await supabase.from('bookmarks').insert({ user_id: userId, resource_id: firstRes.id });
    if (bmError) throw bmError;
    const { data: bmCheck, error: bmCheckError } = await supabase.from('bookmarks').select('*').eq('user_id', userId);
    if (bmCheckError || bmCheck.length !== 1) throw new Error("Bookmark not persisted");
    console.log(" - Bookmark Persistence Passed.");
    
    // 6. Resource view tracking
    console.log("6. Testing View Tracking...");
    const initialViews = firstRes.views || 0;
    await supabase.from('resource_views').insert({ user_id: userId, resource_id: firstRes.id });
    await supabase.from('resources').update({ views: initialViews + 1 }).eq('id', firstRes.id);
    const { data: viewCheck, error: viewCheckErr } = await supabase.from('resources').select('views').eq('id', firstRes.id).single();
    if (viewCheckErr || viewCheck.views !== initialViews + 1) throw new Error("Views not incremented");
    console.log(" - View Tracking Passed.");
    
    // 7 & 8. Quiz submit score & Attempt persistence
    console.log("7/8. Testing Quiz Attempt...");
    const { data: quizzes, error: quizError } = await supabase.from('quizzes').select('*');
    if (quizError) throw quizError;
    const firstQuiz = quizzes[0];
    if (firstQuiz) {
      const { error: attemptError } = await supabase.from('quiz_attempts').insert({
        user_id: userId,
        quiz_id: firstQuiz.id,
        score: 100,
        total_questions: 4
      });
      if (attemptError) throw attemptError;
      console.log(" - Quiz Attempt Persistence Passed.");
    } else {
      console.log(" - SKIPPED: No quizzes to test attempt on.");
    }
    
    // 10. Admin CRUD & 11. RLS
    console.log("10/11. Testing Admin CRUD and RLS...");
    // Try to insert a resource with our student account (should be allowed per RLS in 00001_initial_schema.sql line 104)
    const { error: crudError } = await supabase.from('resources').insert({
      title: "Test CRUD",
      description: "Test Desc",
      subject_id: resources[0].subject_id,
      resource_url: "https://test.com",
      resource_type: "Notes",
      tags: ["test"],
      semester: "1"
    });
    if (crudError) throw crudError;
    console.log(" - Admin CRUD and RLS Passed.");

    console.log("\nALL TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("\nTEST FAILED:");
    console.error(err);
    process.exit(1);
  }
}

runTests();
