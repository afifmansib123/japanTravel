// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Category from '@/lib/model/Category';
import TourPackage from '@/lib/model/TourPackage';
import mongoose from 'mongoose';

interface CategoryDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
}

// GET - Fetch single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 GET /api/categories/[id] - Starting...');
  
  try {
    const { id } = params;
    console.log('📥 Category ID:', id);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('❌ Invalid category ID format:', id);
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('🔌 Connecting to database...');
    await db.connect();
    console.log('✅ Database connected successfully');

    // Find category
    console.log('🔍 Searching for category...');
    const category = await Category.findById(id).lean() as CategoryDocument | null;
    
    if (!category) {
      console.error('❌ Category not found:', id);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    console.log('✅ Category found:', category.name);

    // Convert to plain object
    const categoryObj = {
      ...category,
      _id: category._id.toString(),
    };
    console.log('📤 Returning category:', categoryObj);
    
    return NextResponse.json(categoryObj);

  } catch (error: any) {
    console.error('💥 Error in GET /api/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update category by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 PUT /api/categories/[id] - Starting...');
  
  try {
    const { id } = params;
    console.log('📥 Category ID:', id);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('❌ Invalid category ID format:', id);
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('📥 Request body received:', body);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { name, description, isActive } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      console.error('❌ Missing required field: name');
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    console.log('✅ Fields validated:', { name, description, isActive });

    // Connect to database
    console.log('🔌 Connecting to database...');
    await db.connect();
    console.log('✅ Database connected successfully');

    // Get current category to check if name changed
    const currentCategory = await Category.findById(id) as CategoryDocument | null;
    if (!currentCategory) {
      console.error('❌ Category not found for update:', id);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      description: description?.trim() || '',
    };

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Generate new slug if name changed
    if (currentCategory.name !== name.trim()) {
      const baseSlug = generateSlug(name.trim());
      let slug = baseSlug;
      let counter = 1;

      // Check for existing slug and make it unique if necessary (excluding current category)
      while (await Category.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      updateData.slug = slug;
    }

    console.log('📝 Update data:', updateData);

const updatedCategory = await Category.findByIdAndUpdate(
  id,
  updateData,
  { new: true, runValidators: true }
).lean() as CategoryDocument | null;

if (!updatedCategory) {
  console.error('❌ Failed to update category:', id);
  return NextResponse.json(
    { error: 'Failed to update category' },
    { status: 500 }
  );
}

console.log('✅ Category updated successfully');

// Convert to plain object
const categoryObj = {
  ...updatedCategory,
  _id: updatedCategory._id.toString(),
};
console.log('📤 Returning updated category:', categoryObj);

return NextResponse.json(categoryObj);

  } catch (error: any) {
    console.error('💥 Error in PUT /api/categories/[id]:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      console.error('📋 Validation errors:', error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      console.error('🔄 Duplicate key error:', error.keyPattern);
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete category by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 DELETE /api/categories/[id] - Starting...');
  
  try {
    const { id } = params;
    console.log('📥 Category ID:', id);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('❌ Invalid category ID format:', id);
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('🔌 Connecting to database...');
    await db.connect();
    console.log('✅ Database connected successfully');

    // Check if category has associated tour packages
    console.log('🔍 Checking for associated tour packages...');
    const associatedTours = await TourPackage.countDocuments({ category: id });
    
    if (associatedTours > 0) {
      console.error('❌ Cannot delete category with associated tour packages:', associatedTours);
      return NextResponse.json(
        { 
          error: 'Cannot delete category', 
          message: `This category has ${associatedTours} associated tour package(s). Please reassign or delete them first.` 
        },
        { status: 400 }
      );
    }

    // Delete category
    const deletedCategory = await Category.findByIdAndDelete(id).lean() as CategoryDocument | null;

    if (!deletedCategory) {
      console.error('❌ Category not found for deletion:', id);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    console.log('✅ Category deleted successfully:', deletedCategory.name);
    
    return NextResponse.json({ 
      message: 'Category deleted successfully',
      deletedCategory: {
        ...deletedCategory,
        _id: deletedCategory._id.toString(),
      }
    });

  } catch (error: any) {
    console.error('💥 Error in DELETE /api/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', details: error.message },
      { status: 500 }
    );
  }
}