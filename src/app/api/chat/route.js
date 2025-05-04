import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { generateResponse, GEMINI_CHAT_MODEL } from "@/lib/gemini/client";

export async function POST(request) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Message and session ID are required",
        },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Generate a temporary user ID (in a real app, this would be from auth)
    const userId = "user_" + Math.random().toString(36).substring(2, 9);

    // Get chat history for context
    let chatSession = await Chat.findOne({ userId, sessionId });
    let chatHistory = [];

    if (chatSession) {
      chatHistory = chatSession.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    }

    // Process the message with Gemini AI
    const waterQualitySystemPrompt =
      "You are a water quality expert assistant for CleanConnect, a platform focused on monitoring and improving water quality. " +
      "Provide accurate, educational responses about water parameters, testing methods, contamination, purification, " +
      "and environmental impacts. Use scientific facts and reference reliable standards from organizations like the EPA, WHO, or local water authorities. " +
      "For specific contaminant levels, clearly state the applicable safety thresholds. " +
      "If you're unsure about specific local regulations, acknowledge that and suggest the user consult their local water authority.";

    // Combine system prompt with user message
    const fullPrompt = `${waterQualitySystemPrompt}\n\nUser question: ${message}`;

    // Generate response from Gemini 2.5 Flash model
    const reply = await generateResponse(
      fullPrompt,
      GEMINI_CHAT_MODEL,
      chatHistory
    );

    // Save the conversation to the database
    await Chat.findOneAndUpdate(
      { userId, sessionId },
      {
        $push: {
          messages: [
            { role: "user", content: message },
            { role: "assistant", content: reply },
          ],
        },
        $setOnInsert: { userId, sessionId },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your message",
      },
      { status: 500 }
    );
  }
}
