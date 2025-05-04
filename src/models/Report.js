import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  waterSource: {
    type: String,
    enum: ["tap", "well", "river", "lake", "ocean", "rain", "other"],
    required: true,
  },
  issueType: {
    type: String,
    enum: ["color", "odor", "taste", "contaminants", "health", "other"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrls: [String],
  aiRecommendations: {
    type: String,
    default: "",
  },
  isNotified: {
    type: Boolean,
    default: false,
  },
  adminContact: {
    name: String,
    phone: String,
    email: String,
  },
  status: {
    type: String,
    enum: ["submitted", "in_review", "resolved", "rejected"],
    default: "submitted",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ status: 1 });

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
