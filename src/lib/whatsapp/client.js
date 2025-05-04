import { Client } from "whatsapp-web.js";
import qrcode from "qrcode";
import fs from "fs";
import path from "path";
import { LocalAuth } from "whatsapp-web.js";

// Fix for fluent-ffmpeg issues
import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

class WhatsAppClient {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.adminPhone = process.env.ADMIN_PHONE_NUMBER || "";
    this.qrCodePath = path.join(process.cwd(), "public", "whatsapp-qr.png");
    this.lastQrGenerated = null;

    // Log warning if admin phone number is not set
    if (!this.adminPhone) {
      console.warn(
        "WARNING: ADMIN_PHONE_NUMBER environment variable is not set. WhatsApp notifications to admin will not work."
      );
    } else {
      console.log(
        `WhatsApp client configured with admin phone: ${this.formatPhoneNumber(
          this.adminPhone
        )}`
      );
    }
  }

  async initialize() {
    if (this.client) {
      return this.client;
    }

    try {
      // Create a data directory for WhatsApp session persistence
      const sessionDir = path.join(process.cwd(), ".wwebjs_auth");
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      this.client = new Client({
        puppeteer: {
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
          ],
          headless: true,
        },
        authStrategy: new LocalAuth({
          dataPath: sessionDir,
        }),
      });

      this.client.on("qr", async (qr) => {
        console.log("QR RECEIVED, saving to public folder");

        // Generate QR code as an image file in public directory
        try {
          await qrcode.toFile(this.qrCodePath, qr, {
            scale: 8,
            margin: 4,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });

          this.lastQrGenerated = new Date();
          console.log(`QR code saved to: ${this.qrCodePath}`);
          console.log(`Access your QR code at: /whatsapp-qr.png`);
        } catch (err) {
          console.error("Failed to generate QR code image:", err);
        }

        // Also output to console for convenience
        console.log("QR Code (scan with WhatsApp mobile app):", qr);
      });

      this.client.on("ready", () => {
        console.log("WhatsApp client is ready!");
        this.isReady = true;

        // Remove QR code file once authenticated
        if (fs.existsSync(this.qrCodePath)) {
          fs.unlinkSync(this.qrCodePath);
        }
      });

      this.client.on("disconnected", () => {
        console.log("WhatsApp client disconnected!");
        this.isReady = false;
        this.client = null;
      });

      await this.client.initialize();
      return this.client;
    } catch (error) {
      console.error("Error initializing WhatsApp client:", error);
      this.client = null;
      throw error;
    }
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
