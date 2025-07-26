// app/api/categories/[id]/tour-packages/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import TourPackage from "@/lib/model/TourPackage";
import Category from "@/lib/model/Category";
import mongoose from "mongoose";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

// GET - Fetch all tour packages for a specific category

interface CategoryDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
}

interface TourPackageDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: any;
  [key: string]: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("🚀 GET /api/categories/[id]/tour-packages - Starting...");

  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const difficulty = searchParams.get("difficulty");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("📥 Category ID:", id);
    console.log("📥 Query parameters:", {
      isActive,
      isFeatured,
      difficulty,
      minPrice,
      maxPrice,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("❌ Invalid category ID format:", id);
      return NextResponse.json(
        { error: "Invalid category ID format" },
        { status: 400 }
      );
    }

    // Connect to database
    console.log("🔌 Connecting to database...");
    await db.connect();
    console.log("✅ Database connected successfully");

    // Verify category exists
    const category = (await Category.findById(
      id
    ).lean()) as CategoryDocument | null;
    if (!category) {
      console.error("❌ Category not found:", id);
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Build query
    const query: any = { category: id };

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    if (difficulty) {
      query.difficulty = difficulty;
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

    // Fetch tour packages with pagination
    const [tourPackages, totalCount] = await Promise.all([
      TourPackage.find(query)
        .populate("category", "name description slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      TourPackage.countDocuments(query),
    ]);

    console.log("📊 Found tour packages:", tourPackages.length);

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
  category: {
    ...category,
    _id: (category as any)?._id?.toString(),
  },
  tourPackages: (tourPackages as any[]).map((pkg: any) => ({
    ...pkg,
    _id: pkg._id?.toString(),
    category: pkg.category && typeof pkg.category === 'object' && '_id' in pkg.category 
      ? {
          ...pkg.category,
          _id: pkg.category._id?.toString(),
        }
      : pkg.category
  })),
  pagination: {
    currentPage: page,
    totalPages,
    totalCount,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
};

    console.log("📤 Returning tour packages for category");
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("💥 Error in GET /api/categories/[id]/tour-packages:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tour packages for category",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
