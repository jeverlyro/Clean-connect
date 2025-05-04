import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();

    // In a real app, you would get the userId from authentication
    // For demo, we're getting the latest chat session
    const userId = "user_" + Math.random().toString(36).substring(2, 9);

    // Find the latest chat session for this user
    const latestChat = await Chat.findOne({ userId })
      .sort({ updatedAt: -1 })
      .limit(1);

    if (!latestChat) {
      return NextResponse.json({ success: true, messages: [] });
    }

    return NextResponse.json({
      success: true,
      messages: latestChat.messages,
      sessionId: latestChat.sessionId,
    });
  } catch (error) {
    console.error("Chat history API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve chat history",
      },
      { status: 500 }
    );
  }
}
