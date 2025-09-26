import OpenAI from 'openai';

export const ollama = new OpenAI({
  apiKey: 'ollama', // dummy
  baseURL: 'http://localhost:11434/v1',
});
export const OLLAMA_MODEL = 'gemma3:27b'; // or whatever you pulled: `ollama run llama3.1`. Recommend local model with at least 14 billion params for high accuracy
