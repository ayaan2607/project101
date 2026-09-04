import { Resource, Subject, Quiz, QuizQuestion } from '../types';

export const mockSubjects: Subject[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Data Structures', code: 'CS201', created_at: new Date().toISOString() },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Database Management Systems', code: 'CS301', created_at: new Date().toISOString() },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Operating Systems', code: 'CS302', created_at: new Date().toISOString() },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Computer Networks', code: 'CS401', created_at: new Date().toISOString() },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Artificial Intelligence', code: 'CS501', created_at: new Date().toISOString() },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Machine Learning', code: 'CS601', created_at: new Date().toISOString() },
  { id: '77777777-7777-7777-7777-777777777777', name: 'Mathematics', code: 'MA101', created_at: new Date().toISOString() },
];

export const mockResources: Resource[] = [
  {
    id: 'r1',
    title: 'DBMS Unit 1 Complete Notes',
    description: 'Introduction to databases, architecture, and relational model.',
    resource_type: 'Notes',
    subject_id: '22222222-2222-2222-2222-222222222222',
    branch: 'Computer Science',
    semester: '3',
    resource_url: 'https://example.com/dbms-unit-1',
    tags: ['dbms', 'unit1', 'intro'],
    uploaded_by: 'Prof. Smith',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 120
  },
  {
    id: 'r2',
    title: 'DBMS Previous Year Question Paper 2025',
    description: 'Final exam paper from the previous year.',
    resource_type: 'Question Papers',
    subject_id: '22222222-2222-2222-2222-222222222222',
    branch: 'Computer Science',
    semester: '3',
    resource_url: 'https://example.com/dbms-paper',
    tags: ['dbms', 'pyq', 'exam'],
    uploaded_by: 'Admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 450
  },
  {
    id: 'r3',
    title: 'Normalization Cheat Sheet',
    description: 'Quick reference for 1NF, 2NF, 3NF, BCNF.',
    resource_type: 'Reference Material',
    subject_id: '22222222-2222-2222-2222-222222222222',
    branch: 'Information Technology',
    semester: '3',
    resource_url: 'https://example.com/normalization',
    tags: ['dbms', 'normalization', 'cheat-sheet'],
    uploaded_by: 'Student Rep',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 890
  },
  {
    id: 'r4',
    title: 'Data Structures Trees & Graphs Notes',
    description: 'Comprehensive notes on non-linear data structures.',
    resource_type: 'Notes',
    subject_id: '11111111-1111-1111-1111-111111111111',
    branch: 'Computer Science',
    semester: '2',
    resource_url: 'https://example.com/trees-graphs',
    tags: ['dsa', 'trees', 'graphs'],
    uploaded_by: 'Dr. Alan',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 320
  },
  {
    id: 'r5',
    title: 'Operating Systems Process Management',
    description: 'Scheduling algorithms and process synchronization.',
    resource_type: 'Notes',
    subject_id: '33333333-3333-3333-3333-333333333333',
    branch: 'Computer Science',
    semester: '4',
    resource_url: 'https://example.com/os-process',
    tags: ['os', 'processes', 'scheduling'],
    uploaded_by: 'Prof. Linus',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 215
  }
];

export const mockQuizzes: Quiz[] = [
  {
    id: 'q1',
    title: 'DBMS Fundamentals Quiz',
    description: 'Test your knowledge on basic database concepts.',
    subject_id: '22222222-2222-2222-2222-222222222222',
    created_by: 'Prof. Smith',
    created_at: new Date().toISOString()
  },
  {
    id: 'q2',
    title: 'OS Scheduling Algorithms',
    description: 'Questions on FCFS, SJF, and Round Robin.',
    subject_id: '33333333-3333-3333-3333-333333333333',
    created_by: 'Prof. Linus',
    created_at: new Date().toISOString()
  }
];

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'qq1',
    quiz_id: 'q1',
    question: 'What does DBMS stand for?',
    option_a: 'Database Management System',
    option_b: 'Data Business Management System',
    option_c: 'Database Modification System',
    option_d: 'None of the above',
    correct_answer: 'A'
  },
  {
    id: 'qq2',
    quiz_id: 'q1',
    question: 'Which of the following is not a type of database model?',
    option_a: 'Relational',
    option_b: 'Hierarchical',
    option_c: 'Decentralized',
    option_d: 'Network',
    correct_answer: 'C'
  },
  {
    id: 'qq3',
    quiz_id: 'q1',
    question: 'What is the primary key used for?',
    option_a: 'To uniquely identify a record',
    option_b: 'To link two tables',
    option_c: 'To store large text',
    option_d: 'To encrypt data',
    correct_answer: 'A'
  },
  {
    id: 'qq4',
    quiz_id: 'q1',
    question: 'Which SQL command is used to retrieve data?',
    option_a: 'UPDATE',
    option_b: 'GET',
    option_c: 'SELECT',
    option_d: 'FETCH',
    correct_answer: 'C'
  },
  {
    id: 'qq5',
    quiz_id: 'q1',
    question: 'What is normalization?',
    option_a: 'Adding redundant data',
    option_b: 'Removing redundant data',
    option_c: 'Encrypting data',
    option_d: 'None of the above',
    correct_answer: 'B'
  }
];
