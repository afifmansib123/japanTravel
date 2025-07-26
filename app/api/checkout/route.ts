import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import db from '@/lib/db';
import Booking from '@/lib/model/Booking';
import TourPackage from '@/lib/model/TourPackage';

export async function POST(request: NextRequest) {
  try {
    const { items, cognitoId } = await request.json();
    
    if (!cognitoId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.connect();

    // Validate availability and create temporary bookings
    const bookingPromises = items.map(async (item: any) => {
      const tour = await TourPackage.findById(item.tourId);
      if (!tour) throw new Error(`Tour ${item.tourId} not found`);

      const bookingDate = new Date(item.bookingDate);
      
      // Find the timeSlotIndex from the timeSlot string
      const timeSlotIndex = tour.timeSlots.findIndex((slot : any) => 
        `${slot.startTime}-${slot.endTime}` === item.timeSlot
      );
      
      if (timeSlotIndex === -1) {
        throw new Error(`Time slot ${item.timeSlot} not found for tour ${tour.name}`);
      }
      
      const timeSlot = tour.timeSlots[timeSlotIndex];
      
      if (!timeSlot.isActive) {
        throw new Error(`Time slot ${item.timeSlot} is not available`);
      }

      // Check current bookings for this slot
      // In the checkout route, update the availability check:
const existingBookings = await Booking.find({
  tourId: item.tourId,
  bookingDate,
  timeSlotIndex,
  status: { $in: ['confirmed', 'pending'] } // Check both confirmed and pending
});

      const bookedQuantity = existingBookings.reduce((sum, booking) => sum + booking.quantity, 0);
      
      if (bookedQuantity + item.quantity > timeSlot.maxCapacity) {
        throw new Error(`Not enough capacity for ${item.timeSlot}. Available: ${timeSlot.maxCapacity - bookedQuantity}, Requested: ${item.quantity}`);
      }

      // Create temporary booking (expires in 30 minutes)
      const tempBooking = new Booking({
        cognitoId,
        tourId: item.tourId,
        bookingDate,
        timeSlotIndex, // Now we have the correct index
        quantity: item.quantity,
        totalPrice: item.price * item.quantity, // Calculate from price and quantity
        status: 'confirmed',
      });

      return tempBooking.save();
    });

    const bookings = await Promise.all(bookingPromises);

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'jpy',
          product_data: {
            name: item.name,
            images: [item.image],
            description: `${item.bookingDate} - ${item.timeSlot}`,
          },
          unit_amount: Math.round((item.price * item.quantity) / item.quantity), // Price per person
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        bookingIds: bookings.map(b => b._id.toString()).join(','),
        cognitoId,
      },
    });

    // Update bookings with session ID
    await Promise.all(
      bookings.map(booking => 
        Booking.findByIdAndUpdate(booking._id, { 
          stripeSessionId: checkoutSession.id 
        })
      )
    );

    return NextResponse.json({ sessionId: checkoutSession.id });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' }, 
      { status: 500 }
    );
  }
}