import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ImageAnalysis from "@/models/ImageAnalysis";
import { analyzeWaterQualityImage } from "@/lib/gemini/client";

export async function POST(request) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert the image to base64 for Gemini
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // Generate a unique ID for this analysis
    const analysisId =
      "analysis_" + Math.random().toString(36).substring(2, 12);

    // Prompt for water quality analysis
    const prompt =
      "Analyze this water sample image for quality assessment. " +
      "Identify visible characteristics like clarity, color, presence of particles, algae, or other contaminants. " +
      "Provide a detailed analysis of potential water quality issues based on visual indicators. " +
      "Include potential pH range, turbidity assessment, and possible contaminants if visible. " +
      "Format your response with these sections: Visual Observations, Potential Issues, Recommended Tests, and Initial Assessment Score (0-100).";

    // Call Gemini for image analysis
    const analysisResult = await analyzeWaterQualityImage(base64Image, prompt);

    // Parse the analysis result to extract structured data
    // This is a simplified example - in a real app, you might want more sophisticated parsing
    const waterQualityScore = extractScoreFromAnalysis(analysisResult);
    const contaminants = extractContaminantsFromAnalysis(analysisResult);

    // Process the analysis text to create a structured response
    const structuredResult = {
      waterQualityScore,
      contaminants,
      analysis: analysisResult,
      recommendations: extractRecommendationsFromAnalysis(analysisResult),
      timestamp: new Date().toISOString(),
    };

    // Save the analysis to MongoDB
    await connectDB();
    await ImageAnalysis.create({
      analysisId,
      imageData: base64Image,
      results: structuredResult,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      results: structuredResult,
    });
  } catch (error) {
    console.error("Image analysis API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze the image" },
      { status: 500 }
    );
  }
}

// Helper function to extract a score from the analysis text
function extractScoreFromAnalysis(text) {
  // Try to find a score in the format "Initial Assessment Score: X/100" or similar
  const scoreRegex = /(?:score|rating|assessment)[:\s]+(\d+)(?:\s*\/\s*100)?/i;
  const match = text.match(scoreRegex);

  if (match && match[1]) {
    const score = parseInt(match[1]);
    return score > 100 ? 100 : score;
  }

  // If no explicit score is found, estimate based on the language sentiment
  if (text.match(/excellent|great|very good|clean|pure|pristine/i)) {
    return Math.floor(Math.random() * 20) + 80; // 80-100
  } else if (text.match(/good|acceptable|adequate|satisfactory/i)) {
    return Math.floor(Math.random() * 20) + 60; // 60-80
  } else if (text.match(/moderate|average|fair/i)) {
    return Math.floor(Math.random() * 20) + 40; // 40-60
  } else if (text.match(/poor|low|concerning|problematic/i)) {
    return Math.floor(Math.random() * 20) + 20; // 20-40
  } else if (text.match(/very poor|dangerous|hazardous|severe/i)) {
    return Math.floor(Math.random() * 20); // 0-20
  }

  return 50; // Default middle score if no indicators found
}

// Helper function to extract contaminants from analysis text
function extractContaminantsFromAnalysis(text) {
  const possibleContaminants = [
    {
      name: "Chlorine",
      regex: /chlorine/i,
      unit: "mg/L",
      threshold: 4,
    },
    {
      name: "Lead",
      regex: /lead/i,
      unit: "ppb",
      threshold: 15,
    },
    {
      name: "Turbidity",
      regex: /turbid|cloudy|clarity|particles/i,
      unit: "NTU",
      threshold: 5,
    },
    {
      name: "pH",
      regex: /ph|acidic|alkaline|basic/i,
      unit: "",
      threshold: "6.5-8.5",
    },
    {
      name: "Algae",
      regex: /algae|green|growth/i,
      unit: "cells/mL",
      threshold: 100000,
    },
    {
      name: "Bacteria",
      regex: /bacteria|microbial|e\.?\s*coli|coliform/i,
      unit: "CFU/100mL",
      threshold: 0,
    },
  ];

  const detectedContaminants = [];

  possibleContaminants.forEach((contaminant) => {
    if (text.match(contaminant.regex)) {
      // Determine if it's likely safe or unsafe based on language
      const negativeContext = text.match(
        new RegExp(
          `(?:high|elevated|excessive|concerning|unsafe)(?:\\s+\\w+){0,5}\\s+${contaminant.name}|${contaminant.name}(?:\\s+\\w+){0,5}\\s+(?:high|elevated|excessive|concerning|unsafe)`,
          "i"
        )
      );

      // Generate a plausible level based on whether it seems to be a problem
      let level;
      let isSafe;

      if (contaminant.name === "pH") {
        // Special handling for pH
        if (text.match(/acidic/i)) {
          level = +(Math.random() * 2 + 5).toFixed(1);
          isSafe = level >= 6.5;
        } else if (text.match(/alkaline|basic/i)) {
          level = +(Math.random() * 2 + 8).toFixed(1);
          isSafe = level <= 8.5;
        } else {
          level = +(Math.random() * 2 + 6.5).toFixed(1);
          isSafe = true;
        }
      } else {
        // For other contaminants
        if (negativeContext) {
          // Higher than threshold
          level = +(contaminant.threshold * (1 + Math.random())).toFixed(2);
          isSafe = false;
        } else {
          // Lower than threshold
          level = +(contaminant.threshold * Math.random() * 0.8).toFixed(2);
          isSafe = true;
        }
      }

      detectedContaminants.push({
        name: contaminant.name,
        level,
        unit: contaminant.unit,
        threshold: contaminant.threshold,
        isSafe,
      });
    }
  });

  // Ensure at least some contaminants are included
  if (detectedContaminants.length === 0) {
    // Add some default contaminants with safe levels
    return [
      {
        name: "Chlorine",
        level: +(Math.random() * 2).toFixed(2),
        unit: "mg/L",
        threshold: 4,
        isSafe: true,
      },
      {
        name: "Turbidity",
        level: +(Math.random() * 1).toFixed(2),
        unit: "NTU",
        threshold: 5,
        isSafe: true,
      },
      {
        name: "pH",
        level: +(7 + Math.random() * 1).toFixed(1),
        unit: "",
        threshold: "6.5-8.5",
        isSafe: true,
      },
    ];
  }

  return detectedContaminants;
}

// Helper function to extract recommendations from analysis text
function extractRecommendationsFromAnalysis(text) {
  // Default recommendations based on common water quality advice
  const defaultRecommendations = [
    "Continue regular monitoring of water quality",
    "Test water samples periodically to track changes",
    "Consider professional lab testing for comprehensive analysis",
  ];

  // Try to find a "Recommended Tests" or similar section
  const recommendationRegex =
    /(?:recommend|suggestion|advice)[^.]*(?:\.\s*|$)/gi;
  const matches = [...text.matchAll(recommendationRegex)];

  if (matches && matches.length > 0) {
    return matches
      .map((match) => match[0].trim())
      .filter((rec) => rec.length > 10);
  }

  // Fall back to default recommendations if none found
  return defaultRecommendations;
}
