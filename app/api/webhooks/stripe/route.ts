import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import db from '@/lib/db';
import Booking from '@/lib/model/Booking';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await db.connect();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const { bookingIds, cognitoId } = session.metadata;

      console.log('Payment successful for bookings:', bookingIds);

      // Update all bookings to confirmed status
      const bookingIdArray = bookingIds.split(',');
      
      await Promise.all(
        bookingIdArray.map(async (bookingId: string) => {
          const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { 
              status: 'confirmed',
              stripePaymentIntentId: session.payment_intent,
              $unset: { expiresAt: 1 } // Remove expiry since it's confirmed
            },
            { new: true }
          ).populate('tourId');

          console.log('Booking confirmed:', booking);
          return booking;
        })
      );

      console.log('All bookings confirmed successfully');
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}