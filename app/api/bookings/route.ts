import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Booking from '@/lib/model/Booking';
import TourPackage from '@/lib/model/TourPackage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cognitoId = searchParams.get('cognitoId'); // For user-specific bookings
    
    await db.connect();
    
    const query = cognitoId ? { cognitoId } : {}; // If cognitoId provided, filter by user
    
    const bookings = await Booking.find(query)
      .populate('tourId', 'name location images timeSlots')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}