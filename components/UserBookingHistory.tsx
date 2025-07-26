"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Package
} from 'lucide-react';
import Link from 'next/link';

interface Booking {
  _id: string;
  cognitoId: string;
  tourId: {
    _id: string;
    name: string;
    location: string;
    images: string[];
  };
  bookingDate: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  timeSlot: string;
}

export default function UserBookingHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The AuthContext provides user.id as the Cognito ID, not user.cognitoId
    const cognitoId = user?.id; // This is the correct field!
    
    if (cognitoId) {
      console.log('✅ User and cognitoId available, fetching bookings...');
      fetchBookings();
    } else if (user === null) {
      console.log('❌ User is null, not logged in');
      setLoading(false);
    } else {
      console.log('⏳ User exists but no id yet, waiting...');
    }
  }, [user]);

  const fetchBookings = async () => {
    // Use user.id as the cognitoId (based on your AuthContext structure)
    const cognitoId = user?.id;
    
    if (!cognitoId) {
      console.error('❌ Cannot fetch bookings: no user.id');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Fetching bookings for cognitoId (user.id):', cognitoId);
      
      // Use your existing /api/bookings route
      const url = `/api/bookings?cognitoId=${cognitoId}`;
      console.log('📡 API URL:', url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
        console.log('📊 Number of bookings:', data.bookings?.length || 0);
        
        // Process bookings to add timeSlot info
        const processedBookings = (data.bookings || []).map((booking: any) => {
          const tour = booking.tourId;
          const timeSlot = tour?.timeSlots?.[booking.timeSlotIndex];
          
          return {
            ...booking,
            timeSlot: timeSlot ? `${timeSlot.startTime}-${timeSlot.endTime}` : 'Time not available'
          };
        });
        
        setBookings(processedBookings);
      } else {
        const errorData = await response.text(); // Use text() instead of json() for 404 errors
        console.error('❌ API Error:', errorData);
      }
    } catch (error) {
      console.error('💥 Network Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Booking History</h1>
          <p className="text-gray-600">Total bookings: {bookings.length}</p>
        </div>

        <div className="space-y-6">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Start exploring our amazing tours!</p>
                <Button asChild>
                  <Link href="/tours">Browse Tours</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      {booking.tourId?.images?.length > 0 ? (
                        <img
                          src={booking.tourId.images[0]}
                          alt={booking.tourId.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.tourId?.name || 'Tour name unavailable'}
                        </h3>
                        <Badge>{booking.status}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.tourId?.location || 'Location unavailable'}
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {booking.quantity} people
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ¥{booking.totalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Booked on {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}