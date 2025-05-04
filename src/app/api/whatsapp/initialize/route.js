import { NextResponse } from "next/server";
import { getWhatsAppClient } from "@/lib/whatsapp/client";

export async function POST() {
  try {
    // Set a timeout for the initialization process
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error("WhatsApp initialization timed out after 60 seconds")
          ),
        60000
      );
    });

    // Get the WhatsApp client instance
    const whatsappClient = getWhatsAppClient();

    // Race the initialization with a timeout
    await Promise.race([whatsappClient.initialize(), timeoutPromise]);

    return NextResponse.json({
      success: true,
      message:
        "WhatsApp notification service initialization started. Scan the QR code with your admin phone to activate notifications.",
    });
  } catch (error) {
    console.error("Error initializing WhatsApp notification service:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || "Failed to initialize WhatsApp notification service",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const whatsappClient = getWhatsAppClient();

    // Reset the WhatsApp client connection
    await whatsappClient.logout();

    // Optional: Delete the QR code file if it exists
    // This will be handled by the client automatically in most cases

    return NextResponse.json({
      success: true,
      message: "WhatsApp notification service has been reset successfully.",
    });
  } catch (error) {
    console.error("Error resetting WhatsApp notification service:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reset WhatsApp notification service",
      },
      { status: 500 }
    );
  }
}
