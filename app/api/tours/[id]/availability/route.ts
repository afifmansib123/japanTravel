import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Booking from '@/lib/model/Booking';
import TourPackage from '@/lib/model/TourPackage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    await db.connect();

    // Get tour details
    const tour = await TourPackage.findById(params.id);
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Get all confirmed bookings for this date
    const bookings = await Booking.find({
      tourId: params.id,
      bookingDate: new Date(date),
      status: 'confirmed'
    });

    // Calculate booked quantities per time slot
    const availability: {[key: number]: number} = {};
    
    tour.timeSlots.forEach((_, index) => {
      availability[index] = 0;
    });

    bookings.forEach(booking => {
      if (availability[booking.timeSlotIndex] !== undefined) {
        availability[booking.timeSlotIndex] += booking.quantity;
      }
    });

    return NextResponse.json({ availability });

  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}