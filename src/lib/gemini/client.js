import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with your API key
// You'll need to add GEMINI_API_KEY to your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model constants
export const GEMINI_CHAT_MODEL = "gemini-1.5-flash"; // Using Gemini 2.5 Flash for chat
export const GEMINI_VISION_MODEL = "gemini-1.5-pro"; // Updated to Gemini 2.5 Pro for image analysis

/**
 * Get a Gemini model instance
 * @param {string} modelName - The model name to use
 * @returns {GenerativeModel} A Gemini model instance
 */
export function getGeminiModel(modelName = GEMINI_CHAT_MODEL) {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate a response from Gemini AI
 * @param {string} prompt - The user's message
 * @param {string} modelName - The model name to use (defaults to gemini-1.5-flash)
 * @param {Array} chatHistory - Optional chat history for context
 * @returns {Promise<string>} The generated response
 */
export async function generateResponse(
  prompt,
  modelName = GEMINI_CHAT_MODEL,
  chatHistory = []
) {
  try {
    const model = getGeminiModel(modelName);

    // If we have chat history, use chat mode
    if (chatHistory && chatHistory.length > 0) {
      const chat = model.startChat({
        history: chatHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    }
    // Otherwise, use a simple prompt
    else {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    throw new Error("Failed to generate response from AI");
  }
}

/**
 * Generate a response for water quality image analysis
 * @param {string} imageUrl - The image URL to analyze
 * @param {string} prompt - Additional context or question about the image
 * @returns {Promise<string>} The analysis result
 */
export async function analyzeWaterQualityImage(imageUrl, prompt) {
  try {
    // For image analysis, we use the vision-capable model
    const model = getGeminiModel(GEMINI_VISION_MODEL);

    // Construct prompt for water quality analysis
    const analysisPrompt =
      prompt ||
      "Analyze this water sample image. Identify any visible contaminants, assess the clarity, color, and provide potential water quality insights.";

    const result = await model.generateContent([
      analysisPrompt,
      { inlineData: { data: imageUrl, mimeType: "image/jpeg" } },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze water quality image");
  }
}
