// Gemini API service for handling AI interactions

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in environment variables");
}

// Updated URLs to use current Gemini models
const API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
// Update to use the new model that supports vision capabilities
const VISION_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

interface GenerateTextResponse {
  text: string;
  error?: string;
}

export const generateChatResponse = async (
  messages: ChatMessage[]
): Promise<GenerateTextResponse> => {
  try {
    // Additional logging to debug the issue
    console.log("API Key available:", !!GEMINI_API_KEY);

    const formattedMessages = messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.parts }],
    }));

    console.log(
      "Formatted messages for Gemini API:",
      JSON.stringify(formattedMessages, null, 2)
    );

    const requestBody = {
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
    };

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      // Get the raw text
      let responseText = data.candidates[0].content.parts[0].text;

      // Process Markdown formatting to HTML instead of removing it
      responseText = responseText
        // Convert bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Convert italics
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Convert underline
        .replace(/__(.*?)__/g, "<u>$1</u>")
        // Convert strikethrough
        .replace(/~~(.*?)~~/g, "<del>$1</del>")
        // Convert code blocks
        .replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>")
        // Convert inline code
        .replace(/`(.*?)`/g, "<code>$1</code>")
        // Convert newlines to <br>
        .replace(/\n/g, "<br>");

      return { text: responseText };
    } else {
      console.error(
        "Unexpected response format:",
        JSON.stringify(data, null, 2)
      );
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error("Error generating chat response:", error);
    return {
      text: "",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export const analyzeWaterImage = async (
  imageBase64: string,
  prompt: string = "Analyze this water sample image. Identify any visible issues, estimate water quality, and suggest potential concerns. Focus on clarity, color, and visible contaminants if any."
): Promise<GenerateTextResponse> => {
  try {
    console.log("Starting image analysis with Gemini 1.5 Flash...");
    console.log("API Key available:", !!GEMINI_API_KEY);

    if (!imageBase64) {
      console.error("No image data provided");
      return {
        text: "",
        error: "No image data provided",
      };
    }

    // Determine image format and extract base64 data
    let mimeType = "image/jpeg";
    let base64Data = imageBase64;

    if (imageBase64.includes("data:")) {
      const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        console.error("Invalid data URL format");
        return {
          text: "",
          error: "Invalid image format",
        };
      }
    }

    console.log("Image MIME type:", mimeType);
    console.log("Image data length:", base64Data.length);

    // Important: Change to use the updated format for the Gemini 1.5 API
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inline_data: {
                // Changed from inlineData to inline_data
                mime_type: mimeType, // Changed from mimeType to mime_type
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
      },
    };

    console.log(`Sending request to: ${VISION_API_URL}`);
    console.log(`Sending ${base64Data.length} bytes to Gemini Vision API`);

    const response = await fetch(`${VISION_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);

    // Add better error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);

      // Try to parse the error JSON for better error messages
      try {
        const errorJson = JSON.parse(errorText);
        const detailedMessage = errorJson.error?.message || "Unknown API error";
        throw new Error(`Vision API error: ${detailedMessage}`);
      } catch (parseError) {
        // If parsing fails, use the raw error text
        throw new Error(
          `API request failed with status ${response.status}: ${errorText}`
        );
      }
    }

    const data = await response.json();
    console.log("API response received:", data);

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      let responseText = data.candidates[0].content.parts[0].text;

      // Process Markdown formatting to HTML
      responseText = responseText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/__(.*?)__/g, "<u>$1</u>")
        .replace(/~~(.*?)~~/g, "<del>$1</del>")
        .replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");

      return { text: responseText };
    } else {
      console.error(
        "Unexpected response format:",
        JSON.stringify(data, null, 2)
      );
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error("Error analyzing water image:", error);
    return {
      text: "",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Also update the test function to use the newer model
export const testGeminiAPI = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "Hello, are you working?" }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        },
      }),
    });

    console.log("Test response status:", response.status);
    const data = await response.json();
    console.log("Test response data:", data);

    return response.ok;
  } catch (error) {
    console.error("API test failed:", error);
    return false;
  }
};

export const testVisionAPI = async (): Promise<boolean> => {
  try {
    console.log("Testing Vision API with Gemini 1.5 Flash...");

    // A tiny 1x1 pixel transparent GIF in base64
    const tinyImageBase64 =
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    const response = await fetch(`${VISION_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: "What is this image?" },
              {
                inline_data: {
                  mime_type: "image/gif",
                  data: tinyImageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 100,
        },
      }),
    });

    console.log("Vision Test response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vision API test error:", errorText);
      try {
        // Try to parse the error JSON for better error messages
        const errorJson = JSON.parse(errorText);
        console.error("Detailed error:", JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // If parsing fails, just log the raw error
      }
      return false;
    }

    const data = await response.json();
    console.log("Vision Test response:", data);

    return true;
  } catch (error) {
    console.error("Vision API test failed:", error);
    return false;
  }
};
