
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateBusinessInsight = async (transactions: Transaction[], query: string): Promise<string> => {
  if (!navigator.onLine) {
    return "Error: You are currently offline. AI insights require a network connection.";
  }

  const ai = getAiClient();
  if (!ai) return "Please configure your API Key to use AI insights.";

  const summary = {
    totalEstimatesCount: transactions.length,
    totalEstimatedRevenue: transactions.reduce((acc, curr) => acc + curr.grandTotal, 0),
    recentEstimates: transactions.slice(0, 10).map(t => ({
      date: t.date,
      customer: t.partyName,
      amount: t.grandTotal,
      status: t.status === 'PAID' ? 'Confirmed' : 'Pending'
    }))
  };

  const prompt = `
    You are a professional business advisor.
    Summary of Estimate Data: ${JSON.stringify(summary, null, 2)}
    User Query: "${query}"
    Provide a data-driven markdown response. Focus on estimate trends, customer behavior, and potential revenue. Use the word 'Estimates' instead of 'Sales' or 'Invoices'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error analyzing data. Please check your internet connection.";
  }
};
