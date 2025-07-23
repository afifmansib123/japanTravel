import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Booking from '@/lib/model/Booking';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    console.log('Fetching bookings for session:', params.sessionId);
    
    await db.connect();

    const bookings = await Booking.find({
      stripeSessionId: params.sessionId
    }).populate('tourId', 'name location images timeSlots').lean();

    console.log('Found bookings:', bookings.length);

    // Add timeSlot string to each booking for display
    const bookingsWithTimeSlots = bookings.map(booking => {
      const tour = booking.tourId as any;
      const timeSlot = tour?.timeSlots?.[booking.timeSlotIndex];
      
      return {
        ...booking,
        timeSlot: timeSlot ? `${timeSlot.startTime}-${timeSlot.endTime}` : 'Time slot info'
      };
    });

    return NextResponse.json({ bookings: bookingsWithTimeSlots });
  } catch (error: any) {
    console.error('Error fetching bookings by session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}