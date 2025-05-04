import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

class WhatsAppClient {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.adminPhone = process.env.ADMIN_PHONE_NUMBER || "";
  }

  async initialize() {
    if (this.client) {
      return this.client;
    }

    this.client = new Client({
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.client.on("qr", (qr) => {
      console.log("QR RECEIVED, scan with WhatsApp mobile app:");
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      console.log("WhatsApp client is ready!");
      this.isReady = true;
    });

    this.client.on("disconnected", () => {
      console.log("WhatsApp client disconnected!");
      this.isReady = false;
      this.client = null;
    });

    await this.client.initialize();
    return this.client;
  }

  async sendMessage(phoneNumber, message) {
    if (!this.client || !this.isReady) {
      await this.initialize();
    }

    try {
      // Format the phone number to ensure it's in the correct format for WhatsApp
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      // Send the message
      const response = await this.client.sendMessage(
        `${formattedNumber}@c.us`,
        message
      );
      return {
        success: true,
        messageId: response.id.id,
      };
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendReportToAdmin(report) {
    if (!this.adminPhone) {
      console.error("Admin phone number not configured");
      return {
        success: false,
        error: "Admin phone number not configured",
      };
    }

    const reportMessage = this.formatReportMessage(report);
    return await this.sendMessage(this.adminPhone, reportMessage);
  }

  formatReportMessage(report) {
    return `
*New Water Quality Report*
---------------------------
*ID:* ${report._id}
*Issue Type:* ${report.issueType}
*Water Source:* ${report.waterSource}
*Location:* ${report.location.name || "Not specified"}
*Description:* ${report.description}
*Submitted on:* ${new Date(report.createdAt).toLocaleString()}
---------------------------
To view full details, log in to the CleanConnect admin dashboard.
    `;
  }

  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // Ensure the number has the correct format (e.g., remove leading zeros, add country code if missing)
    if (!cleaned.startsWith("1") && !cleaned.startsWith("+")) {
      cleaned = "1" + cleaned; // Add US/Canada country code as default
    }

    return cleaned;
  }
}

// Create singleton instance
let whatsappClient = null;

export function getWhatsAppClient() {
  if (!whatsappClient) {
    whatsappClient = new WhatsAppClient();
  }
  return whatsappClient;
}

export default getWhatsAppClient;
