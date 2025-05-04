import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Report from "@/models/Report";
import { getWhatsAppClient } from "@/lib/whatsapp/client";

export async function POST(request) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();

    // Extract the form fields
    const waterSource = formData.get("waterSource");
    const issueType = formData.get("issueType");
    const location = formData.get("location") || "Not specified";
    const description = formData.get("description");
    const imageFile = formData.get("image");

    // Validate required fields
    if (!waterSource || !issueType || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a report object
    const reportData = {
      userId: "anonymous", // Using a placeholder since userId is required in the schema
      waterSource,
      issueType,
      location: { name: location },
      description,
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If image is provided, store it (in a real app, you'd upload to cloud storage)
    if (imageFile) {
      const imageBuffer = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString("base64");
      reportData.imageUrls = [
        `data:image/${imageFile.type};base64,${base64Image}`,
      ];
    }

    // Generate recommendations based on the report data
    const recommendations = generateRecommendations(reportData);
    reportData.aiRecommendations = recommendations;

    // Connect to the database and save the report
    await connectDB();
    const report = await Report.create(reportData);

    // Send WhatsApp notification to admin
    try {
      const whatsappClient = getWhatsAppClient();

      // Ensure admin phone number is set
      if (!process.env.ADMIN_PHONE_NUMBER) {
        console.warn(
          "Warning: ADMIN_PHONE_NUMBER environment variable not set. WhatsApp notifications won't work properly."
        );
      }

      await whatsappClient.initialize(); // Ensure the client is initialized
      const notificationResult = await whatsappClient.sendReportToAdmin(report);

      if (notificationResult.success) {
        console.log("WhatsApp notification sent successfully");
        // Update the report to mark it as notified
        await Report.findByIdAndUpdate(report._id, { isNotified: true });
      } else {
        console.error(
          "Failed to send WhatsApp notification:",
          notificationResult.error
        );
      }
    } catch (whatsappError) {
      console.error("Error sending WhatsApp notification:", whatsappError);
      // Continue with the response even if WhatsApp notification fails
    }

    return NextResponse.json({
      success: true,
      reportId: report._id,
      recommendations: recommendations,
    });
  } catch (error) {
    console.error("Report submission API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit the report" },
      { status: 500 }
    );
  }
}

// Function to generate recommendations based on the report data
function generateRecommendations(data) {
  let recommendations = "";

  // Water source specific recommendations
  if (data.waterSource === "tap") {
    recommendations +=
      "For tap water issues, first check if the problem is present in all faucets or just one. If it's just one, the issue may be with that specific faucet or its pipe connection. ";

    if (data.issueType === "color") {
      recommendations +=
        "Discolored tap water often results from rust in pipes or sediment. Run cold water for 2-3 minutes to see if it clears. If your area has hard water, consider installing a water softener system. ";
    } else if (data.issueType === "odor") {
      recommendations +=
        "Odors in tap water can come from chlorine treatment, bacteria, or organic matter. A carbon filter can help reduce chlorine smells. If you detect a rotten egg smell, this could indicate hydrogen sulfide gas and should be addressed by a professional. ";
    } else if (data.issueType === "taste") {
      recommendations +=
        "Metallic or chemical tastes in tap water may indicate pipe corrosion or excessive minerals. Consider installing a reverse osmosis system or activated carbon filter under your sink. ";
    }
  } else if (data.waterSource === "well") {
    recommendations +=
      "For well water, regular testing is crucial as there's no municipal oversight. Aim to test your well water at least annually for bacteria, nitrates, and pH levels. ";

    if (data.issueType === "contaminants") {
      recommendations +=
        "Well contamination often comes from nearby agricultural activities, septic systems, or natural mineral deposits. Consider installing a whole-house filtration system specifically designed for the contaminants present in your water. Contact a local well specialist who can recommend targeted treatment options. ";
    }
  } else if (data.waterSource === "river" || data.waterSource === "lake") {
    recommendations +=
      "Natural water sources require thorough treatment before consumption. Never drink untreated surface water. ";
    recommendations +=
      "For recreational activities, monitor local advisories about water quality and algal blooms. Contact your local environmental agency to report significant changes in water quality. ";
  }

  // General recommendations based on the description
  if (
    data.description.toLowerCase().includes("child") ||
    data.description.toLowerCase().includes("baby")
  ) {
    recommendations +=
      "Since your concern involves children, who are more vulnerable to water contaminants, consider using filtered or bottled water for drinking and cooking until the issue is resolved. ";
  }

  if (
    data.description.toLowerCase().includes("sick") ||
    data.description.toLowerCase().includes("ill") ||
    data.description.toLowerCase().includes("health")
  ) {
    recommendations +=
      "If you're experiencing health issues you believe are related to water quality, please consult a healthcare provider immediately. Bring a water sample for potential testing. ";
  }

  // Add contact recommendations
  recommendations += "\n\nNext steps:\n";
  recommendations +=
    "1. Contact your local water utility or health department for professional testing\n";
  recommendations +=
    "2. Consider using a certified home water test kit for preliminary results\n";
  recommendations +=
    "3. Document the issue with photos and keep records of when the problem occurs\n";

  if (data.issueType === "contaminants" || data.issueType === "health") {
    recommendations +=
      "4. Use alternative water sources for drinking and cooking until the issue is resolved\n";
    recommendations +=
      "5. Consult with a certified water treatment specialist about treatment options\n";
  }

  return recommendations;
}
