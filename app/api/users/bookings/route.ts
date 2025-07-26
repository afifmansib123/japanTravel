// app/api/user/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Booking from '@/lib/model/Booking';
import TourPackage from '@/lib/model/TourPackage';
import Category from '@/lib/model/Category';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// GET - Fetch user bookings (using exact same pattern as categories API)

interface TourDocument {
  _id: any;
  name: string;
  category: any;
  timeSlots?: any[];
  [key: string]: any;
}

interface CategoryDocument {
  _id: any;
  name: string;
  [key: string]: any;
}
export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/user/bookings - Starting...');
  
  try {
    const { searchParams } = new URL(request.url);
    const cognitoId = searchParams.get('cognitoId');

    console.log('📥 Query parameters:', { cognitoId });

    if (!cognitoId) {
      console.error('❌ Missing cognitoId parameter');
      return NextResponse.json(
        { error: 'cognitoId is required' },
        { status: 400 }
      );
    }

    // Connect to database (same as categories API)
    console.log('🔌 Connecting to database...');
    await db.connect();
    console.log('✅ Database connected successfully');

    // Find bookings for this user (no populate, just raw data)
    console.log('🔍 Searching for bookings...');
    const bookings = await Booking.find({ cognitoId })
      .sort({ createdAt: -1 })
      .lean();

    console.log('📊 Found bookings:', bookings.length);

    // Get tour details separately for each booking
    const bookingsWithTours = [];
    
    for (const booking of bookings as any[]) {
      try {
        console.log('🔍 Fetching tour for booking:', booking._id);
        
        const tour = await TourPackage.findById(booking.tourId).lean() as TourDocument | null;
        
        if (tour) {
          // Get category info
          const category = await Category.findById(tour.category).lean() as CategoryDocument | null;
          
          // Get time slot info
          const timeSlot = tour.timeSlots?.[booking.timeSlotIndex];
          const timeSlotString = timeSlot 
            ? `${timeSlot.startTime}-${timeSlot.endTime}` 
            : 'Time not available';

          bookingsWithTours.push({
            ...booking,
            _id: booking._id.toString(),
            tourId: {
              ...tour,
              _id: tour._id.toString(),
              category: category ? {
                _id: category._id.toString(),
                name: category.name
              } : { name: 'Unknown Category' }
            },
            timeSlot: timeSlotString
          });
        } else {
          console.warn('⚠️ Tour not found for booking:', booking._id);
          bookingsWithTours.push({
            ...booking,
            _id: booking._id.toString(),
            tourId: {
              _id: booking.tourId.toString(),
              name: 'Tour not found',
              location: 'Unknown',
              images: [],
              timeSlots: [],
              category: { name: 'Unknown' }
            },
            timeSlot: 'Time not available'
          });
        }
      } catch (error) {
        console.error('❌ Error processing booking:', booking._id, error);
      }
    }

    console.log('📤 Returning bookings:', bookingsWithTours.length);

    return NextResponse.json({
      bookings: bookingsWithTours,
      count: bookingsWithTours.length
    });

  } catch (error: any) {
    console.error('💥 Error in GET /api/user/bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user bookings', details: error.message },
      { status: 500 }
    );
  }
}