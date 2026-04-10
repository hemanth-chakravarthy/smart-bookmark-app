import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function check() {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent("Hello world");
    console.log("Embedding length:", result.embedding.values.length);
  } catch (e) {
    console.error(e);
  }
}
check();
