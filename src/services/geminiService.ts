
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const API_KEY = process.env.GEMINI_API_KEY || "";

export const generateBusinessInsight = async (transactions: Transaction[], userQuery: string): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Prepare a summary of transactions for context
  const summary = transactions.map(t => ({
    date: t.date,
    customer: t.partyName,
    amount: t.grandTotal,
    status: t.status
  }));

  const prompt = `
    You are a business advisor for a printing press. 
    Here is a summary of recent transactions: ${JSON.stringify(summary.slice(0, 50))}
    
    User Question: ${userQuery}
    
    Provide a concise, professional, and helpful response based on the data provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "I couldn't generate an insight at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while consulting the AI advisor.";
  }
};
