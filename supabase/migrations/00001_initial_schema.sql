-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (Profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBJECTS
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RESOURCES
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  branch TEXT NOT NULL,
  semester TEXT NOT NULL,
  resource_url TEXT NOT NULL,
  tags TEXT[],
  uploaded_by TEXT NOT NULL, -- normally references profiles(id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0
);

-- BOOKMARKS
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- references auth.users(id)
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- RESOURCE VIEWS
CREATE TABLE resource_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZZES
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUIZ QUESTIONS
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D'))
);

-- QUIZ ATTEMPTS
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (Basic MVP Setup)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Allow public read for MVP
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);
CREATE POLICY "Resources are viewable by everyone" ON resources FOR SELECT USING (true);
CREATE POLICY "Quizzes are viewable by everyone" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Quiz questions are viewable by everyone" ON quiz_questions FOR SELECT USING (true);

-- MVP Permissive policies for demo purposes (normally restrict to authenticated users)
CREATE POLICY "Enable insert for everyone" ON resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for everyone" ON resources FOR UPDATE USING (true);
CREATE POLICY "Enable delete for everyone" ON resources FOR DELETE USING (true);

CREATE POLICY "Enable insert for bookmarks" ON bookmarks FOR ALL USING (true);
CREATE POLICY "Enable insert for views" ON resource_views FOR ALL USING (true);
CREATE POLICY "Enable insert for attempts" ON quiz_attempts FOR ALL USING (true);

-- DEMO SEED DATA
INSERT INTO subjects (id, name, code, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Data Structures', 'CS201', 'Core computer science fundamentals'),
('22222222-2222-2222-2222-222222222222', 'Database Management Systems', 'CS301', 'Relational models, SQL, and normalization');

INSERT INTO resources (id, title, description, resource_type, subject_id, branch, semester, resource_url, tags, uploaded_by) VALUES
('33333333-3333-3333-3333-333333333333', 'DBMS Unit 1 Complete Notes', 'Introduction to databases, architecture, and relational model.', 'Notes', '22222222-2222-2222-2222-222222222222', 'Computer Science', '3', 'https://example.com/dbms-unit-1', ARRAY['dbms', 'unit1', 'intro'], 'Prof. Smith');

INSERT INTO quizzes (id, title, description, subject_id, created_by) VALUES
('44444444-4444-4444-4444-444444444444', 'DBMS Fundamentals Quiz', 'Test your knowledge on basic database concepts.', '22222222-2222-2222-2222-222222222222', 'Prof. Smith');

INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('44444444-4444-4444-4444-444444444444', 'What does DBMS stand for?', 'Database Management System', 'Data Business Management System', 'Database Modification System', 'None of the above', 'A'),
('44444444-4444-4444-4444-444444444444', 'Which of the following is not a type of database?', 'Relational', 'Hierarchical', 'Decentralized', 'Network', 'C');
