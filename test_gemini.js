import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
    // Attempt to list models or just try generating content with gemini-2.5-flash, gemini-3.0-flash, gemini-3.6-flash, gemini-1.5-flash
    const modelsToTest = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];
    let workingModel = null;

    for (const model of modelsToTest) {
      console.log(`Testing model: ${model}...`);
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: 'Say hello world'
        });
        console.log(`Success with ${model}:`, response.text);
        workingModel = model;
        break; // Stop at first working model
      } catch (err) {
        console.log(`Failed for ${model}:`, err.message);
      }
    }

    if (!workingModel) {
      console.log("No working models found in the list.");
    } else {
      console.log(`RECOMMENDED_MODEL=${workingModel}`);
    }
  } catch (err) {
    console.error("SDK Error:", err);
  }
}

listModels();
