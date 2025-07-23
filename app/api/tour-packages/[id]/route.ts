// app/api/tour-packages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import TourPackage from "@/lib/model/TourPackage";
import Category from "@/lib/model/Category";
import mongoose from "mongoose";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

// GET - Fetch single tour package by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("🚀 GET /api/tour-packages/[id] - Starting...");

  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get("populate") === "true";

    console.log("📥 Tour Package ID:", id, "Populate:", populate);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("❌ Invalid tour package ID format:", id);
      return NextResponse.json(
        { error: "Invalid tour package ID format" },
        { status: 400 }
      );
    }

    // Connect to database
    console.log("🔌 Connecting to database...");
    await db.connect();
    console.log("✅ Database connected successfully");

    // Find tour package
    console.log("🔍 Searching for tour package...");
    let query = TourPackage.findById(id);

    if (populate) {
      query = query.populate("category", "name description slug");
    }

    const tourPackage = await query.lean();

    if (!tourPackage) {
      console.error("❌ Tour package not found:", id);
      return NextResponse.json(
        { error: "Tour package not found" },
        { status: 404 }
      );
    }

    console.log("✅ Tour package found:", tourPackage.name);

    console.log("📤 Returning tour package");

    return NextResponse.json(tourPackage);
  } catch (error: any) {
    console.error("💥 Error in GET /api/tour-packages/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch tour package", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update tour package by ID
// PUT - Update tour package by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("🚀 PUT /api/tour-packages/[id] - Starting...");

  try {
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid tour package ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("📥 Request body received:", body);

    // --- Start of data preparation ---
    const updateData: any = {
      ...body,
      name: body.name?.trim(),
      description: body.description?.trim(),
      shortDescription: body.shortDescription?.trim(),
      location: body.location?.trim(),
      duration: parseInt(body.duration, 10),
      timeSlotType: body.timeSlotType,
      timeSlots: body.timeSlots || [],
      operatingDays: body.operatingDays || [],
      advanceBookingDays: parseInt(body.advanceBookingDays, 10) || 1,
      price: parseFloat(body.price),
      maxGroupSize: parseInt(body.maxGroupSize, 10),
      discountedPrice:
        body.discountedPrice !== undefined &&
        body.discountedPrice !== null &&
        body.discountedPrice !== ""
          ? parseFloat(body.discountedPrice)
          : undefined,
    };

    // This is a great practice: it removes any fields that ended up as `undefined`
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    console.log("📝 Update data prepared with parsed numbers:", updateData);
    // --- End of data preparation ---

    await db.connect();

    // Optional: You could add category validation here if needed

    // Update tour package
    const updatedTourPackage = await TourPackage.findByIdAndUpdate(
      id,
      updateData, // Use the sanitized and parsed data
      { new: true, runValidators: true }
    )
      .populate("category", "name description slug")
      .lean();

    if (!updatedTourPackage) {
      return NextResponse.json(
        { error: "Tour package not found" },
        { status: 404 }
      );
    }

    console.log("✅ Tour package updated successfully");
    console.log("📤 Returning updated tour package");

    return NextResponse.json(updatedTourPackage);
  } catch (error: any) {
    console.error("💥 Error in PUT /api/tour-packages/[id]:", error);
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
      { error: "Failed to update tour package", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete tour package by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("🚀 DELETE /api/tour-packages/[id] - Starting...");

  try {
    const { id } = params;
    console.log("📥 Tour Package ID:", id);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("❌ Invalid tour package ID format:", id);
      return NextResponse.json(
        { error: "Invalid tour package ID format" },
        { status: 400 }
      );
    }

    // Connect to database
    console.log("🔌 Connecting to database...");
    await db.connect();
    console.log("✅ Database connected successfully");

    // Delete tour package
    const deletedTourPackage = await TourPackage.findByIdAndDelete(id)
      .populate("category", "name description slug")
      .lean();

    if (!deletedTourPackage) {
      console.error("❌ Tour package not found for deletion:", id);
      return NextResponse.json(
        { error: "Tour package not found" },
        { status: 404 }
      );
    }

    console.log(
      "✅ Tour package deleted successfully:",
      deletedTourPackage.name
    );

    return NextResponse.json({
      message: "Tour package deleted successfully",
      deletedTourPackage: deletedTourPackage,
    });
  } catch (error: any) {
    console.error("💥 Error in DELETE /api/tour-packages/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete tour package", details: error.message },
      { status: 500 }
    );
  }
}
