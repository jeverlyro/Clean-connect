import mongoose from "mongoose";

const ImageAnalysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
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
        threshold: Number,
        isSafe: Boolean,
      },
    ],
    analysis: {
      type: String,
      required: true,
    },
    recommendations: [String],
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

export default mongoose.models.ImageAnalysis ||
  mongoose.model("ImageAnalysis", ImageAnalysisSchema);
