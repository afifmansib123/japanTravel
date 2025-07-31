"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Users, Search, Eye } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { X, CreditCard } from "lucide-react";

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
  stripeSessionId?: string;
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Add this function to handle viewing details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlot = (booking: Booking) => {
    const timeSlot = booking.tourId.timeSlots[booking.timeSlotIndex];
    return timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : "N/A";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.tourId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.cognitoId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
            <p className="text-gray-600 mt-1">Manage all customer bookings</p>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/admin/orders/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by tour name or customer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.length}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter((b) => b.status === "confirmed").length}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.filter((b) => b.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                ¥
                {bookings
                  .reduce((sum, booking) => sum + booking.totalPrice, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card
              key={booking._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={booking.tourId.images[0]}
                      alt={booking.tourId.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.tourId.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {getTimeSlot(booking)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.tourId.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {booking.quantity} people
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        ¥{booking.totalPrice.toLocaleString()}
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-500">
                  <span>Customer ID: {booking.cognitoId}</span>
                  <span>
                    Booked: {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                  {booking.stripeSessionId && (
                    <span>Session: {booking.stripeSessionId.slice(-8)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No orders found</div>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Tour Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Tour Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={selectedBooking.tourId.images[0]}
                        alt={selectedBooking.tourId.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedBooking.tourId.name}
                        </h4>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedBooking.tourId.location}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(
                            selectedBooking.bookingDate
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {getTimeSlot(selectedBooking)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Booking ID</div>
                      <div className="font-semibold text-gray-900">
                        {selectedBooking._id}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Customer ID</div>
                      <div className="font-semibold text-gray-900">
                        {selectedBooking.cognitoId}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Quantity</div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {selectedBooking.quantity} people
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Status</div>
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        {selectedBooking.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Total Price</div>
                      <div className="font-bold text-xl text-gray-900">
                        ¥{selectedBooking.totalPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Booking Date</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(selectedBooking.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                {selectedBooking.stripeSessionId && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Payment Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Stripe Session ID
                          </div>
                          <div className="font-mono text-sm text-gray-900">
                            {selectedBooking.stripeSessionId}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tour Images */}
                {selectedBooking.tourId.images.length > 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Tour Images
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedBooking.tourId.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedBooking.tourId.name} - Image ${
                            index + 1
                          }`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Time Slots */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    All Available Time Slots
                  </h3>
                  <div className="space-y-2">
                    {selectedBooking.tourId.timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          index === selectedBooking.timeSlotIndex
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-600" />
                            <span className="font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            {index === selectedBooking.timeSlotIndex && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Max: {slot.maxCapacity} people
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
