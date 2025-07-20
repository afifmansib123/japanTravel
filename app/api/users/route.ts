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
export async function GET() {
  console.log('🔍 GET /api/users - Testing endpoint');
  
  try {
    await db.connect();
    console.log('✅ Database connected for GET request');
    
    const userCount = await User.countDocuments();
    console.log('📊 Total users in database:', userCount);
    
    return NextResponse.json({ 
      message: 'Users API is working', 
      totalUsers: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ GET request error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users info', details: error.message },
      { status: 500 }
    );
  }
}