'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface BookingDetails {
  _id: string;
  tourId: {
    name: string;
    location: string;
    images: string[];
  };
  bookingDate: string;
  timeSlotIndex: number;
  quantity: number;
  totalPrice: number;
  status: string;
  timeSlot?: string;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    fetchBookingDetails();
  }, [sessionId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/session/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch booking details');
      
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button asChild>
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your tour booking has been successfully confirmed. Check your email for details.
          </p>
        </div>

        {/* Booking Details */}
        <div className="space-y-6 mb-8">
          {bookings.map((booking) => (
            <Card key={booking._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{booking.tourId.name}</span>
                  <span className="text-green-600 text-sm font-normal">
                    {booking.status.toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{booking.timeSlot || 'Time slot info'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{booking.tourId.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <span>{booking.quantity} people</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ¥{booking.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-gray-600">Total paid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/orderhistory">View My Bookings</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/tours">Book Another Tour</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}