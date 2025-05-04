import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ImageAnalysis from "@/models/ImageAnalysis";

export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();

    // In a real app, you would get the userId from authentication
    // For demonstration, we'll get all analyses
    const analyses = await ImageAnalysis.find({})
      .sort({ createdAt: -1 })
      .limit(10); // Limit to 10 most recent analyses

    if (!analyses || analyses.length === 0) {
      return NextResponse.json({ success: true, analyses: [] });
    }

    // Transform the data to exclude large image data
    const transformedAnalyses = analyses.map(analysis => {
      const { imageData, ...rest } = analysis.toObject();
      return rest;
    });

    return NextResponse.json({
      success: true,
      analyses: transformedAnalyses
    });
  } catch (error) {
    console.error("Image analysis history API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve image analysis history",
      },
      { status: 500 }
    );
  }
}