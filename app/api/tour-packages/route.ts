// app/api/tour-packages/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import TourPackage, { ITourPackage } from "@/lib/model/TourPackage";
import Category from "@/lib/model/Category";
import mongoose from "mongoose";
// Add these imports
import { uploadFileToS3 } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid"; // You might need this if not in s3.ts

// Force this route to be dynamic
export const dynamic = "force-dynamic";

// GET - Fetch all tour packages
export async function GET(request: NextRequest) {
  console.log("🚀 GET /api/tour-packages - Starting...");

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const difficulty = searchParams.get("difficulty");
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const populate = searchParams.get("populate") === "true";

    console.log("📥 Query parameters:", {
      category,
      isActive,
      isFeatured,
      difficulty,
      location,
      minPrice,
      maxPrice,
      page,
      limit,
      sortBy,
      sortOrder,
      populate,
    });

    // Connect to database
    console.log("🔌 Connecting to database...");
    await db.connect();
    console.log("✅ Database connected successfully");

    // Build query
    const query: any = {};

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    console.log("🔍 Executing query:", { query, skip, limit, sort });

    // Build aggregation pipeline or simple query
    let tourPackagesQuery = TourPackage.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (populate) {
      tourPackagesQuery = tourPackagesQuery.populate(
        "category",
        "name description slug"
      );
    }

    // Fetch tour packages with pagination
    const [tourPackages, totalCount] = await Promise.all([
      tourPackagesQuery.lean(),
      TourPackage.countDocuments(query),
    ]);

    console.log("📊 Found tour packages:", tourPackages.length);

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      tourPackages: tourPackages, // Use the lean objects directly
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    console.log("📤 Returning tour packages with pagination");
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("💥 Error in GET /api/tour-packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch tour packages", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new tour package
// app/api/tour-packages/route.ts

// POST - Create new tour package (UPDATED)
export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/tour-packages - Starting...");

  try {
    // 1. Correctly parse multipart/form-data instead of JSON
    const formData = await request.formData();
    console.log("📥 FormData received, processing...");

    // 2. Extract fields from the FormData object
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const shortDescription = formData.get("shortDescription") as string | null;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const duration = formData.get("duration") as string;
    const price = formData.get("price") as string;
    const discountedPrice = formData.get("discountedPrice") as string | null;
    const currency = formData.get("currency") as string;
    const maxGroupSize = formData.get("maxGroupSize") as string;
    const difficulty = formData.get("difficulty") as string;
    const photos = formData.getAll("photos") as File[]; // This will be an array of File objects

    // 3. Parse stringified arrays and booleans
    const highlights = JSON.parse(
      (formData.get("highlights") as string) || "[]"
    ) as string[];
    const inclusions = JSON.parse(
      (formData.get("inclusions") as string) || "[]"
    ) as string[];
    const exclusions = JSON.parse(
      (formData.get("exclusions") as string) || "[]"
    ) as string[];
    const isActive = formData.get("isActive") === "true";
    const isFeatured = formData.get("isFeatured") === "true";

    const timeSlotType = (formData.get("timeSlotType") as string) || "daily";
    const timeSlots = JSON.parse(
      (formData.get("timeSlots") as string) ||
        '[{"startTime":"09:00","endTime":"17:00","maxCapacity":10,"isActive":true}]'
    );
    const operatingDays = JSON.parse(
      (formData.get("operatingDays") as string) ||
        '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]'
    );
    const advanceBookingDays = parseInt(
      (formData.get("advanceBookingDays") as string) || "1",
      10
    );

    // 4. Create a temporary object for validation
    const body = {
      name,
      description,
      category,
      location,
      duration,
      price,
      maxGroupSize,
    };

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "category",
      "location",
      "duration",
      "price",
      "maxGroupSize",
    ];
    const missingFields = requiredFields.filter(
      (field) => !body[field as keyof typeof body]
    );

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`Found ${photos.length} photos to upload.`);
    const uploadedImageUrls: string[] = [];

    // Check if there are actual files to upload
    if (photos && photos.length > 0 && photos[0].size > 0) {
      // Use Promise.all to upload all files in parallel for better performance
      const uploadPromises = photos.map((photo) => uploadFileToS3(photo));
      // Wait for all uploads to complete
      const urls = await Promise.all(uploadPromises);
      // Add the returned URLs to our array
      uploadedImageUrls.push(...urls);
      console.log(
        "✅ All photos uploaded successfully. URLs:",
        uploadedImageUrls
      );
    } else {
      console.log("No valid photos found to upload.");
    }

    // Connect to database
    await db.connect();

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    // Create new tour package with parsed and converted data
    const newTourPackage = new TourPackage({
      name: name.trim(),
      description: description.trim(),
      shortDescription: shortDescription?.trim(),
      category,
      location: location.trim(),
      duration: parseInt(duration, 10),
      price: parseFloat(price),
      discountedPrice:
        discountedPrice && discountedPrice !== "0"
          ? parseFloat(discountedPrice)
          : undefined,
      currency: currency || "JPY",
      maxGroupSize: parseInt(maxGroupSize, 10),
      difficulty: difficulty || "moderate",
      timeSlotType,
      timeSlots,
      operatingDays,
      advanceBookingDays,
      images: uploadedImageUrls, // Use the URLs from your file upload logic
      highlights: highlights || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      isActive,
      isFeatured,
      itinerary: [], // The form doesn't send this, so default to empty
    });

    const savedTourPackage = await newTourPackage.save();
    console.log(
      "✅ Tour package saved successfully with ID:",
      savedTourPackage._id
    );

    await savedTourPackage.populate("category", "name description slug");
    const tourPackageObj = db.convertDocToObj(savedTourPackage);

    return NextResponse.json(tourPackageObj, { status: 201 });
  } catch (error: any) {
    console.error("💥 Error in POST /api/tour-packages:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Tour package with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create tour package", details: error.message },
      { status: 500 }
    );
  }
}
