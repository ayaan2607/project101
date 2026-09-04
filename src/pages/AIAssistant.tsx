import React, { useState, useEffect } from 'react';
import { BrainCircuit, Send, Sparkles, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { Resource } from '../types';
import { Link } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export function AIAssistant() {
  const { user } = useRole();
  const [messages, setMessages] = useState<{role: string, text: string, recommendedResources?: Resource[]}[]>([
    { role: 'ai', text: 'Hello! I am your AI Academic Assistant. How can I help you find resources today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Context awareness
  const [catalog, setCatalog] = useState<Resource[]>([]);

  useEffect(() => {
    // Load catalog so AI is aware of current resources
    api.resources.getAll().then(setCatalog).catch(console.error);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userQuery = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Context-Aware Matching (Local Vector search approximation)
      const lowerQuery = userQuery.toLowerCase();
      const keywords = lowerQuery.split(' ').filter(w => w.length > 2);
      
      let recommendedResources: Resource[] = [];
      catalog.forEach(res => {
        const matchScore = keywords.reduce((score, kw) => {
          if (res.title.toLowerCase().includes(kw)) return score + 2;
          if (res.tags.some(t => t.toLowerCase().includes(kw))) return score + 2;
          if (res.description.toLowerCase().includes(kw)) return score + 1;
          return score;
        }, 0);
        
        if (matchScore > 1) {
          recommendedResources.push(res);
        }
      });
      
      // Top 3 recommendations
      recommendedResources = recommendedResources.slice(0, 3);
      
      // 2. Prepare Context for Gemini
      const contextPrompt = `
      You are an AI Academic Assistant for EduVault. 
      The user is asking: "${userQuery}".
      
      Here are some relevant resources from our catalog:
      ${recommendedResources.map(r => `- ${r.title} (${r.resource_type}): ${r.description}`).join('\n')}
      
      If the user is looking for resources, point them to the ones provided above. If they are asking a concept question, explain it simply. Keep your response concise, friendly, and helpful.
      `;

      // 3. Call Gemini API
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contextPrompt,
      });

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text || "I'm sorry, I couldn't generate a response at this time.", 
        recommendedResources: recommendedResources.length > 0 ? recommendedResources : undefined 
      }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I'm having trouble connecting to my brain right now. Please try again later!" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">AI Academic Assistant</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-500" /> Catalog-Aware Intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm flex flex-col gap-3 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              
              {/* Render Recommended Resources */}
              {msg.recommendedResources && msg.recommendedResources.length > 0 && (
                <div className="space-y-2 mt-2">
                  {msg.recommendedResources.map(res => (
                    <div key={res.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-xs text-gray-900 block">{res.title}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{res.resource_type}</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-1">
                        <button 
                          onClick={() => {
                            window.open(res.resource_url, '_blank');
                            if (user) api.resources.trackView(res.id, user.id).catch(console.error);
                          }}
                          className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors"
                        >
                          View Resource
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about resources, topics, or study plans..."
            className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
