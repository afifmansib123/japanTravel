// lib/model/TourPackage.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITourPackage extends Document {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  location: string;
  duration: number; // in days
  timeSlotType: "hourly" | "daily" | "custom";
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    maxCapacity: number;
    isActive: boolean;
  }>;
  operatingDays: string[];
  advanceBookingDays: number;
  price: number;
  discountedPrice?: number;
  currency: string;
  maxGroupSize: number;
  difficulty: "easy" | "moderate" | "challenging" | "extreme";
  images: string[];
  highlights: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    meals?: string[];
    accommodation?: string;
  }>;
  inclusions: string[];
  exclusions: string[];
  isActive: boolean;
  isFeatured: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const tourPackageSchema = new Schema<ITourPackage>(
  {
    name: {
      type: String,
      required: [true, "Tour package name is required"],
      trim: true,
      maxlength: [200, "Tour package name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 day"],
      max: [365, "Duration cannot exceed 365 days"],
    },
    // Add after duration field
    timeSlotType: {
      type: String,
      required: true,
      enum: ["hourly", "daily", "custom"],
      default: "daily",
    },
    timeSlots: [
      {
        startTime: {
          type: String, // Format: "HH:MM" (24-hour)
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"],
        },
        endTime: {
          type: String, // Format: "HH:MM" (24-hour)
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"],
        },
        maxCapacity: {
          type: Number,
          required: true,
          min: [1, "Capacity must be at least 1"],
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    operatingDays: [
      {
        type: String,
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
    ],
    advanceBookingDays: {
      type: Number,
      default: 1,
      min: [0, "Advance booking cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      enum: ["JPY", "USD", "EUR", "GBP", "INR", "AUD", "CAD"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Maximum group size is required"],
      min: [1, "Group size must be at least 1"],
      max: [100, "Group size cannot exceed 100"],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "moderate", "challenging", "extreme"],
      default: "moderate",
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    highlights: [
      {
        type: String,
        trim: true,
        maxlength: [200, "Each highlight cannot exceed 200 characters"],
      },
    ],
    itinerary: [
      {
        day: {
          type: Number,
          required: true,
          min: 1,
        },
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, "Itinerary title cannot exceed 200 characters"],
        },
        description: {
          type: String,
          required: true,
          trim: true,
          maxlength: [
            1000,
            "Itinerary description cannot exceed 1000 characters",
          ],
        },
        meals: [
          {
            type: String,
            enum: ["breakfast", "lunch", "dinner", "snacks"],
          },
        ],
        accommodation: {
          type: String,
          trim: true,
          maxlength: [200, "Accommodation cannot exceed 200 characters"],
        },
      },
    ],
    inclusions: [
      {
        type: String,
        trim: true,
        maxlength: [200, "Each inclusion cannot exceed 200 characters"],
      },
    ],
    exclusions: [
      {
        type: String,
        trim: true,
        maxlength: [200, "Each exclusion cannot exceed 200 characters"],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "tourpackages",
  }
);

// Create slug from name before saving
tourPackageSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Index for better performance
tourPackageSchema.index({ category: 1, isActive: 1 });
tourPackageSchema.index({ slug: 1 });
tourPackageSchema.index({ isFeatured: 1, isActive: 1 });
tourPackageSchema.index({ location: 1 });

const TourPackage =
  mongoose.models.TourPackage ||
  mongoose.model<ITourPackage>("TourPackage", tourPackageSchema);

export default TourPackage;
