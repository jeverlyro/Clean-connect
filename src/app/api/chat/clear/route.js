import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // In a real app, you would get userId from authentication
    const userId = "user_" + Math.random().toString(36).substring(2, 9);

    // Remove the chat session
    await Chat.deleteOne({ userId, sessionId });

    return NextResponse.json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error("Clear chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear chat history",
      },
      { status: 500 }
    );
  }
}
