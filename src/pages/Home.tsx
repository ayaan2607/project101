import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Clock, ArrowRight, BrainCircuit, PlayCircle, FileText, CheckCircle2, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resource, Quiz } from '../types';
import { useRole } from '../contexts/RoleContext';

export function Home() {
  const navigate = useNavigate();
  const { role, user } = useRole();
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [res, qz] = await Promise.all([
          api.resources.getAll(),
          api.quizzes.getAll()
        ]);
        setRecentResources(res.slice(0, 4));
        setQuizzes(qz);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleStartQuiz = async (quiz: Quiz) => {
    const questions = await api.quizzes.getQuestions(quiz.id);
    setQuizQuestions(questions);
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setScore(null);
    setAnswers({});
  };

  const handleSelectAnswer = (qId: string, ans: string) => {
    setAnswers(prev => ({ ...prev, [qId]: ans }));
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    quizQuestions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correctCount++;
    });
    
    const finalScore = Math.round((correctCount / quizQuestions.length) * 100);
    setScore(finalScore);

    if (!user) {
      alert("You must be logged in to save quiz scores.");
      return;
    }
    await api.quizzes.submitAttempt({
      user_id: user.id,
      quiz_id: activeQuiz!.id,
      score: finalScore,
      total_questions: quizQuestions.length
    });
  };

  if (activeQuiz) {
    if (score !== null) {
      return (
        <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-gray-500 mb-8">{activeQuiz.title}</p>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Your Score</p>
            <p className="text-5xl font-black text-indigo-600">{score}%</p>
          </div>
          
          <button 
            onClick={() => setActiveQuiz(null)}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    const currentQ = quizQuestions[currentQuestionIdx];
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{activeQuiz.title}</h2>
            <p className="text-gray-500 text-sm mt-1">Question {currentQuestionIdx + 1} of {quizQuestions.length}</p>
          </div>
          <button onClick={() => setActiveQuiz(null)} className="text-sm text-gray-500 hover:text-gray-900">
            Cancel
          </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-medium text-gray-900 mb-6">{currentQ.question}</h3>
          
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optionText = currentQ[`option_${opt.toLowerCase()}`];
              const isSelected = answers[currentQ.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelectAnswer(currentQ.id, opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="inline-block w-6 font-bold text-gray-400">{opt}.</span>
                  {optionText}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
            {currentQuestionIdx > 0 && (
              <button 
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentQuestionIdx < quizQuestions.length - 1 ? (
              <button 
                disabled={!answers[currentQ.id]}
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="px-6 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Next Question
              </button>
            ) : (
              <button 
                disabled={!answers[currentQ.id]}
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-3">
            Welcome back, {role === 'STUDENT' ? 'Student' : role === 'FACULTY' ? 'Professor' : 'Admin'}! 👋
          </h1>
          <p className="text-indigo-100 text-lg mb-6">
            Continue where you left off or discover new resources for your courses.
          </p>
          <div className="flex gap-4">
            <Link to="/resources" className="bg-white text-indigo-900 px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" /> Browse Resources
            </Link>
            <Link to="/ai-assistant" className="bg-indigo-800/50 text-white border border-indigo-400/30 px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-800 transition-colors flex items-center gap-2 backdrop-blur-sm">
              <BrainCircuit className="w-4 h-4" /> AI Assistant
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Recent Resources
            </h2>
            <Link to="/resources" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-gray-500">Loading resources...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {resource.resource_type}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {resource.views || 0}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {resource.description}
                  </p>
                  <button 
                    onClick={() => {
                      window.open(resource.resource_url, '_blank');
                      if (user) api.resources.trackView(resource.id, user.id).catch(console.error);
                    }}
                    className="w-full flex justify-center items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Open Resource
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Active Quizzes
          </h2>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 space-y-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading quizzes...</div>
            ) : quizzes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No active quizzes</div>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                  <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{quiz.description}</p>
                  <button 
                    onClick={() => handleStartQuiz(quiz)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    <PlayCircle className="w-4 h-4" /> Start Quiz
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <BrainCircuit className="w-8 h-8 mb-3 text-purple-200" />
              <h3 className="font-bold text-lg mb-1">Stuck on a topic?</h3>
              <p className="text-purple-100 text-sm mb-4">
                Ask our AI Academic Assistant to explain complex concepts in simple terms.
              </p>
              <Link to="/ai-assistant" className="inline-flex items-center justify-center w-full bg-white text-indigo-900 text-sm font-medium py-2 rounded-lg hover:bg-purple-50 transition-colors">
                Chat with AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
