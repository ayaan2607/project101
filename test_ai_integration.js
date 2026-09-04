import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

async function testIntegration() {
  console.log("Testing AI Assistant Integration...");
  try {
    // Mimic getting resources
    const { data: catalog } = await supabase.from('resources').select('*');
    if (!catalog || catalog.length === 0) {
      console.log("No resources found in Supabase. Assuming empty catalog.");
    }
    
    const userQuery = "Hello tell me all the resources present right now";
    console.log(`User query: "${userQuery}"`);
    
    // Mimic context-aware matching from AIAssistant.tsx
    const lowerQuery = userQuery.toLowerCase();
    const keywords = lowerQuery.split(' ').filter(w => w.length > 2);
    
    let recommendedResources = [];
    (catalog || []).forEach(res => {
      const matchScore = keywords.reduce((score, kw) => {
        if (res.title.toLowerCase().includes(kw)) return score + 2;
        if (res.tags && res.tags.some(t => t.toLowerCase().includes(kw))) return score + 2;
        if (res.description.toLowerCase().includes(kw)) return score + 1;
        return score;
      }, 0);
      if (matchScore > 1) recommendedResources.push(res);
    });
    
    recommendedResources = recommendedResources.slice(0, 3);
    
    // Mimic prompt context injection
    const contextPrompt = `
      You are an AI Academic Assistant for Aethera Hub. 
      The user is asking: "${userQuery}".
      
      Here are some relevant resources from our catalog:
      ${recommendedResources.map(r => `- ${r.title} (${r.resource_type}): ${r.description}`).join('\n')}
      
      If the user is looking for resources, point them to the ones provided above. If they are asking a concept question, explain it simply. Keep your response concise, friendly, and helpful.
    `;
    
    console.log("Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contextPrompt,
    });
    
    console.log("=== AI RESPONSE ===");
    console.log(response.text);
    console.log("===================");
    console.log("Integration Test SUCCESS.");
  } catch (error) {
    console.error("Integration Test FAILED:", error);
  }
}

testIntegration();
