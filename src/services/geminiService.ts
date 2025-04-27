
// Gemini API service for handling AI interactions

const GEMINI_API_KEY = 'AIzaSyABo2XDaZhuiZ5yPMr0YQhCVvBAuLx_PcI';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

interface GenerateTextResponse {
  text: string;
  error?: string;
}

export const generateChatResponse = async (
  messages: ChatMessage[],
): Promise<GenerateTextResponse> => {
  try {
    const formattedMessages = messages.map(message => ({
      role: message.role,
      parts: [{ text: message.parts }]
    }));

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return { text: data.candidates[0].content.parts[0].text };
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    return { 
      text: '',
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

export const analyzeWaterImage = async (
  imageBase64: string,
  prompt: string = 'Analyze this water sample image. Identify any visible issues, estimate water quality, and suggest potential concerns. Focus on clarity, color, and visible contaminants if any.'
): Promise<GenerateTextResponse> => {
  try {
    const response = await fetch(`${VISION_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64.split(',')[1] // Remove data:image/jpeg;base64, part
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return { text: data.candidates[0].content.parts[0].text };
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error) {
    console.error('Error analyzing water image:', error);
    return { 
      text: '',
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};
