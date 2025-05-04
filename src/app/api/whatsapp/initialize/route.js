import { NextResponse } from "next/server";
import { getWhatsAppClient } from "@/lib/whatsapp/client";

export async function POST() {
  try {
    const whatsappClient = getWhatsAppClient();

    // Start the initialization process
    // This will trigger the QR code generation
    await whatsappClient.initialize();

    return NextResponse.json({
      success: true,
      message: "WhatsApp client initialization started. Check for QR code.",
    });
  } catch (error) {
    console.error("Error initializing WhatsApp client:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize WhatsApp client",
      },
      { status: 500 }
    );
  }
}
