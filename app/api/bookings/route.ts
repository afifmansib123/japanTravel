import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Booking, TourPackage, Category, ensureModelsRegistered } from "@/lib/model"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cognitoId = searchParams.get('cognitoId');
    
    console.log('🚀 GET /api/bookings - cognitoId:', cognitoId);
    
    await db.connect();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const query = cognitoId ? { cognitoId } : {};
    console.log('🔍 MongoDB query:', query);
    
    const bookings = await Booking.find(query)
      .populate('tourId', 'name location images timeSlots category')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('📊 Found bookings:', bookings.length);
    
    return NextResponse.json({ bookings });
    
  } catch (error: any) {
    console.error('💥 Error fetching bookings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}