import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";

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

    // Process the message with water quality-specific knowledge
    const reply = await processWaterQualityQuery(message);

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

// Function to process water quality-related queries
// In a real application, this would connect to a more sophisticated
// AI model like OpenAI's API or a custom trained model
async function processWaterQualityQuery(query) {
  // Simple keyword-based responses for demo purposes
  const lowerQuery = query.toLowerCase();

  // Water quality parameters
  if (lowerQuery.includes("ph") || lowerQuery.includes("acidity")) {
    return "pH is a measure of how acidic or basic water is. The pH scale ranges from 0 to 14, with 7 being neutral. pH values less than 7 indicate acidity, while values greater than 7 indicate alkalinity. For drinking water, the EPA recommends a pH between a range of 6.5 to 8.5.";
  }

  if (lowerQuery.includes("turbidity") || lowerQuery.includes("cloudy")) {
    return "Turbidity is a measure of water clarity or cloudiness. It's caused by suspended particles that scatter light. High turbidity can indicate the presence of microorganisms, and it can also interfere with disinfection processes. The WHO recommends that drinking water turbidity should be below 5 NTU, and ideally below 1 NTU.";
  }

  if (lowerQuery.includes("chlorine") || lowerQuery.includes("disinfect")) {
    return "Chlorine is commonly used to disinfect water supplies. The EPA Maximum Residual Disinfectant Level (MRDL) for chlorine is 4 milligrams per liter (mg/L). While chlorine helps eliminate harmful bacteria, too much can create disinfection byproducts that may have health implications.";
  }

  if (lowerQuery.includes("lead") || lowerQuery.includes("heavy metal")) {
    return "Lead in drinking water is a serious health concern, especially for children and pregnant women. It usually enters water through corroded plumbing materials. The EPA action level for lead is 15 parts per billion (ppb) in more than 10% of customer taps sampled. The goal is to have 0 ppb, as no level of lead is considered safe.";
  }

  if (
    lowerQuery.includes("bacteria") ||
    lowerQuery.includes("coli") ||
    lowerQuery.includes("microorganism")
  ) {
    return "Bacteria like E. coli in water indicates fecal contamination. According to EPA regulations, drinking water should have zero total coliform bacteria, including E. coli. If detected, it suggests that the water may contain pathogens that can cause gastrointestinal illness, and immediate action is required.";
  }

  if (lowerQuery.includes("filter") || lowerQuery.includes("purify")) {
    return "Water filtration methods include activated carbon filters, reverse osmosis, distillation, and UV treatment. The best method depends on your specific water quality issues. Activated carbon works well for chlorine and organic compounds, while reverse osmosis can remove a wide range of contaminants including heavy metals.";
  }

  if (lowerQuery.includes("bottled") || lowerQuery.includes("tap")) {
    return "The choice between bottled water and tap water depends on several factors. In many developed countries, tap water is strictly regulated and safe to drink. Bottled water is convenient but has environmental implications due to plastic waste. If you're concerned about tap water quality, consider having it tested or using a quality home filtration system.";
  }

  if (lowerQuery.includes("test") || lowerQuery.includes("analysis")) {
    return "You can test your water quality using home test kits or by sending samples to certified laboratories. Basic home kits can test for pH, hardness, chlorine, and some contaminants. For comprehensive analysis, especially for toxic substances, professional laboratory testing is recommended. Many local health departments also offer water testing services.";
  }

  // General/fallback response
  return "Water quality refers to the chemical, physical, and biological characteristics of water. Important parameters include pH, turbidity, dissolved oxygen, bacterial content, and the presence of contaminants like heavy metals or chemicals. If you have specific concerns about your water, I recommend testing it and consulting with local water quality experts. Is there a particular aspect of water quality you'd like to know more about?";
}
