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
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    await db.connect();

    // Get tour details
    const tour = await TourPackage.findById(params.id);
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Create date range for the entire day (start and end of day)
    const startOfDay = new Date(dateParam);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateParam);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('🔍 Checking availability for tour:', params.id);
    console.log('📅 Date param:', dateParam);
    console.log('🌅 Start of day:', startOfDay);
    console.log('🌄 End of day:', endOfDay);

    // Get all confirmed AND pending bookings for this date range
    const bookings = await Booking.find({
      tourId: params.id,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending'] }
    });

    console.log('📋 Found bookings:', bookings.length);
    bookings.forEach(booking => {
      console.log(`  - Booking: ${booking._id}, Date: ${booking.bookingDate}, Slot: ${booking.timeSlotIndex}, Qty: ${booking.quantity}, Status: ${booking.status}`);
    });

const availability: {[key: number]: number} = {};

tour.timeSlots.forEach((slot, index) => {
  // Check if ANY booking exists for this time slot
  const hasBooking = bookings.some(booking => booking.timeSlotIndex === index);
  
  // If any booking exists, set to max capacity (fully booked)
  // If no booking, set to 0 (fully available)
  availability[index] = hasBooking ? slot.maxCapacity : 0;
  
  console.log(`  🎯 Slot ${index}: ${hasBooking ? 'BOOKED' : 'AVAILABLE'} (${availability[index]}/${slot.maxCapacity})`);
});

    console.log('✅ Final availability:', availability);

    return NextResponse.json({ availability });

  } catch (error: any) {
    console.error('❌ Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}