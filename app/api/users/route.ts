// app/api/users/route.ts - Fixed for static export
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import User , {IUser} from '@/lib/model/User';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/users - Starting...');
  
  try {
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

    const { cognitoId, email, name, role } = body;

    // Validate required fields
    if (!cognitoId || !email || !name) {
      console.error('❌ Missing required fields:', { 
        cognitoId: !!cognitoId, 
        email: !!email, 
        name: !!name 
      });
      return NextResponse.json(
        { error: 'Missing required fields: cognitoId, email, name' },
        { status: 400 }
      );
    }

    console.log('✅ Fields validated:', { cognitoId, email, name, role });

    // Connect to database
    console.log('🔌 Connecting to database...');
    await db.connect();
    console.log('✅ Database connected successfully');

    // Check if user already exists
    console.log('🔍 Checking for existing user with cognitoId:', cognitoId);
    const existingUser = await User.findOne({ cognitoId });
    
    if (existingUser) {
      console.log('👤 User already exists, returning existing user:', existingUser._id);
      const userObj = db.convertDocToObj(existingUser);
      console.log('📤 Returning existing user:', userObj);
      return NextResponse.json(userObj);
    }

    console.log('✅ No existing user found, proceeding with creation');

    // Create new user
    console.log('👤 Creating new user...');
    const userData = {
      cognitoId,
      email,
      name,
      role: role || 'user',
      emailVerified: false,
    };
    
    console.log('📝 User data to save:', userData);
    
    const newUser = new User(userData);
    console.log('🏗️ User model created, saving...');
    
    const savedUser = await newUser.save();
    console.log('✅ User saved successfully with ID:', savedUser._id);

    // Convert to plain object
    const userObj = db.convertDocToObj(savedUser);
    console.log('📤 Returning new user:', userObj);
    
    return NextResponse.json(userObj, { status: 201 });

  } catch (error: any) {
    console.error('💥 Error in POST /api/users:', error);
    
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
        { error: 'User with this email or cognitoId already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}

// Test endpoint

export async function GET(request: NextRequest) {
  console.log('🔍 GET /api/users - Fetching all users');
  
  try {
    await db.connect();
    console.log('✅ Database connected for GET request');
    
    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    
    // Build filter object
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { cognitoId: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Fetch users with pagination - REMOVED .lean() and handle conversion properly
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-__v') // Exclude version field
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit), // REMOVED .lean() here
      User.countDocuments(filter)
    ]);
    
    console.log(`📊 Found ${users.length} users out of ${totalUsers} total`);
    
    // Convert Mongoose documents to plain objects using your existing helper
    const plainUsers = users.map(user => {
      try {
        return db.convertDocToObj(user);
      } catch (convertError) {
        console.error('Error converting user:', convertError);
        // Fallback: manually convert if convertDocToObj fails
        return {
          _id: user._id.toString(),
          cognitoId: user.cognitoId,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      }
    });
    
    console.log('✅ Successfully converted users to plain objects');
    
    return NextResponse.json({
      users: plainUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1
      },
      filters: {
        search,
        role
      }
    });
    
  } catch (error: any) {
    console.error('❌ GET request error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}