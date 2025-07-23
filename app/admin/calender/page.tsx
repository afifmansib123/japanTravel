'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Booking {
  _id: string;
  cognitoId: string;
  tourId: {
    _id: string;
    name: string;
    location: string;
    images: string[];
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      maxCapacity: number;
    }>;
  };
  bookingDate: string;
  timeSlotIndex: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDateBookings, setSelectedDateBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      const dayBookings = bookings.filter(booking => 
        booking.bookingDate.split('T')[0] === dateString
      );
      setSelectedDateBookings(dayBookings);
    }
  }, [selectedDate, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlot = (booking: Booking) => {
    const timeSlot = booking.tourId.timeSlots[booking.timeSlotIndex];
    return timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if a date has bookings for calendar styling
  const hasBookings = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.some(booking => booking.bookingDate.split('T')[0] === dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="outline" asChild className="mr-4">
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
            <p className="text-gray-600 mt-1">View bookings by date</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasBookings: (date) => hasBookings(date)
                  }}
                  modifiersStyles={{
                    hasBookings: {
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: 'bold'
                    }
                  }}
                />
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                    Days with bookings
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Bookings for {selectedDate?.toLocaleDateString()}
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {selectedDateBookings.length} booking(s) found
                </div>
              </CardHeader>
              <CardContent>
                {selectedDateBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg">No bookings for this date</div>
                    <p className="text-gray-500 mt-2">Select a different date to view bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateBookings.map((booking) => (
                      <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={booking.tourId.images[0]}
                              alt={booking.tourId.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {booking.tourId.name}
                              </h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {getTimeSlot(booking)}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {booking.tourId.location}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {booking.quantity} people
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              ¥{booking.totalPrice.toLocaleString()}
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                          <div className="flex justify-between">
                            <span>Customer: {booking.cognitoId.slice(0, 8)}...</span>
                            <span>Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}