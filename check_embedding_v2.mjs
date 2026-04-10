import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const text = "The quick brown fox jumps over the lazy dog.";
  const result = await model.embedContent(text);
  console.log("Embedding length:", result.embedding.values.length);
}

run();
