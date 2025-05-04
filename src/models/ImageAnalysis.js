import mongoose from "mongoose";

const ImageAnalysisSchema = new mongoose.Schema({
  analysisId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: false, // Will be required once auth is implemented
  },
  imageData: {
    type: String, // Base64 encoded image data
    required: true,
  },
  results: {
    waterQualityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    contaminants: [
      {
        name: String,
        level: Number,
        unit: String,
        threshold: mongoose.Schema.Types.Mixed, // Can be Number or String (for ranges like "6.5-8.5")
        isSafe: Boolean,
      },
    ],
    analysis: {
      type: String,
      required: true,
    },
    recommendations: [String],
    timestamp: Date,
  },
  metadata: {
    location: {
      latitude: Number,
      longitude: Number,
    },
    deviceInfo: String,
    imageTimestamp: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
ImageAnalysisSchema.index({ userId: 1, createdAt: -1 });
ImageAnalysisSchema.index({ analysisId: 1 }, { unique: true });

export default mongoose.models.ImageAnalysis ||
  mongoose.model("ImageAnalysis", ImageAnalysisSchema);
