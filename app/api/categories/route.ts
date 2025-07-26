// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import Category, { ICategory } from "@/lib/model/Category";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

interface CategoryDocument {
  _id: any;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/(^-|-$)/g, ""); // Remove leading/trailing hyphens
}

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  console.log("🚀 GET /api/categories - Starting...");

  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("📥 Query parameters:", {
      isActive,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Connect to database
    console.log("🔌 Connecting to database...");
    await db.connect();
    console.log("✅ Database connected successfully");

    // Build query
    const query: any = {};
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    console.log("🔍 Executing query:", { query, skip, limit, sort });

    // Fetch categories with pagination
    const [categories, totalCount] = await Promise.all([
      Category.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Category.countDocuments(query),
    ]);

    console.log("📊 Found categories:", categories.length);

    const totalPages = Math.ceil(totalCount / limit);

    // Convert lean objects to plain objects (fix the _id field)
    const convertedCategories = categories.map((category: any) => ({
  ...category,
  _id: category._id.toString(),
}));

    const response = {
      categories: convertedCategories,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    console.log("📤 Returning categories with pagination");
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("💥 Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/categories - Starting...");

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("📥 Request body received:", body);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { name, description, isActive } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      console.error("❌ Missing required field: name");
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    console.log("✅ Fields validated:", { name, description, isActive });

    // Connect to database
    console.log("🔌 Connecting to database...");
    await db.connect();
    console.log("✅ Database connected successfully");

    // Generate slug from name
    const baseSlug = generateSlug(name.trim());
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slug and make it unique if necessary
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create new category
    console.log("📝 Creating new category...");
    const categoryData = {
      name: name.trim(),
      description: description?.trim() || "",
      slug: slug,
      isActive: isActive !== undefined ? isActive : true,
    };

    console.log("📝 Category data to save:", categoryData);

    const newCategory = new Category(categoryData);
    console.log("🏗️ Category model created, saving...");

    const savedCategory = await newCategory.save();
    console.log("✅ Category saved successfully with ID:", savedCategory._id);

    // Convert to plain object
    const categoryObj = {
      ...savedCategory.toObject(),
      _id: savedCategory._id.toString(),
    };
    console.log("📤 Returning new category:", categoryObj);

    return NextResponse.json(categoryObj, { status: 201 });
  } catch (error: any) {
    console.error("💥 Error in POST /api/categories:", error);

    // Handle specific errors
    if (error.name === "ValidationError") {
      console.error("📋 Validation errors:", error.errors);
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      console.error("🔄 Duplicate key error:", error.keyPattern);
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
      { status: 500 }
    );
  }
}
