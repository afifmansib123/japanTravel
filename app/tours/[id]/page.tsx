// app/tours/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle,
  XCircle,
  Sun,
  Wind,
  Mountain,
  Utensils,
  Flag,
  X,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Clock, Plus, Minus, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Interfaces remain the same...
interface Tour {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: { _id: string; name: string };
  location: string;
  duration: number;
  timeSlotType: "hourly" | "daily" | "custom";
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    maxCapacity: number;
    isActive: boolean;
  }>;
  operatingDays: string[];
  advanceBookingDays: number;
  price: number;
  discountedPrice?: number;
  currency: string;
  maxGroupSize: number;
  difficulty: "easy" | "moderate" | "challenging" | "extreme";
  images: string[];
  highlights: string[];
  itinerary: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  isActive: boolean;
  isFeatured: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingSelection {
  date: string;
  timeSlotIndex: number;
  quantity: number;
  totalPrice: number;
}

interface TimeSlotModalProps {
  tour: Tour;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selections: BookingSelection[]) => void;
}

interface ImageLightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

// ImageLightbox component with enhanced styling
const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  startIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-0 duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-300">
        <Image
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          width={1200}
          height={800}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          priority
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
        <span className="font-medium">{currentIndex + 1} / {images.length}</span>
      </div>
    </div>
  );
};

const TimeSlotSelectionModal: React.FC<TimeSlotModalProps> = ({
  tour,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selections, setSelections] = useState<BookingSelection[]>([]);
  const { t } = useLanguage();

  const [availabilityData, setAvailabilityData] = useState<{
    [key: string]: number;
  }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const getAvailableDates = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 90);

    const availableDates: Date[] = [];

    for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dayName = d
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      if (tour.operatingDays.includes(dayName)) {
        const checkDate = new Date(d);
        checkDate.setDate(checkDate.getDate() - tour.advanceBookingDays);
        if (checkDate <= today) {
          availableDates.push(new Date(d));
        }
      }
    }
    return availableDates;
  };

  const checkAvailability = async (date: Date) => {
    if (!date) return;

    setLoadingAvailability(true);
    try {
      const dateString = date.toISOString().split("T")[0];
      const response = await fetch(
        `/api/tours/${tour._id}/availability?date=${dateString}`
      );
      const data = await response.json();

      if (response.ok) {
        setAvailabilityData(data.availability);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate);
    }
  }, [selectedDate]);

  const formatTimeSlot = (timeSlot: any) => {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  const addSelection = (timeSlotIndex: number) => {
    if (!selectedDate) return;

    const dateString = selectedDate.toISOString().split("T")[0];
    // Use discounted price if available, otherwise use regular price
    const currentPrice = tour.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price
      ? tour.discountedPrice
      : tour.price;

    const existingIndex = selections.findIndex(
      (s) => s.date === dateString && s.timeSlotIndex === timeSlotIndex
    );

    if (existingIndex >= 0) {
      const updated = [...selections];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice =
        updated[existingIndex].quantity * currentPrice;
      setSelections(updated);
    } else {
      setSelections([
        ...selections,
        {
          date: dateString,
          timeSlotIndex,
          quantity: 1,
          totalPrice: currentPrice,
        },
      ]);
    }
  };

  const updateQuantity = (index: number, change: number) => {
    const updated = [...selections];
    const currentPrice = tour.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price
      ? tour.discountedPrice
      : tour.price;

    updated[index].quantity = Math.max(0, updated[index].quantity + change);
    updated[index].totalPrice = updated[index].quantity * currentPrice;

    if (updated[index].quantity === 0) {
      updated.splice(index, 1);
    }

    setSelections(updated);
  };

  const getTotalPrice = () => {
    return selections.reduce((sum, selection) => sum + selection.totalPrice, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: tour.currency,
    }).format(price);
  };

  const currentPrice = tour.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price
    ? tour.discountedPrice
    : tour.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Select Date & Time</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Choose Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const dayName = date
                  .toLocaleDateString("en-US", { weekday: "long" })
                  .toLowerCase();
                return (
                  !tour.operatingDays.includes(dayName) ||
                  date < new Date() ||
                  date > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                );
              }}
              className="rounded-lg border shadow-sm bg-white"
            />
          </div>

          {/* Time Slots */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Available Time Slots</h3>
            {selectedDate ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loadingAvailability ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Checking availability...</p>
                  </div>
                ) : (
                  tour.timeSlots
                    .filter((slot) => slot.isActive)
                    .map((timeSlot, index) => {
                      const bookedQuantity = availabilityData[index] || 0;
                      const isFullyBooked = bookedQuantity >= timeSlot.maxCapacity;

                      return (
                        <div
                          key={index}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            isFullyBooked
                              ? "bg-gray-50 border-gray-200 opacity-60"
                              : "hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-semibold text-lg mb-1">
                                {formatTimeSlot(timeSlot)}
                              </div>
                              <div className="mb-2">
                                {isFullyBooked ? (
                                  <Badge variant="destructive" className="text-xs">
                                    Fully Booked
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    Available
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {tour.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 line-through text-sm">
                                      {formatPrice(tour.price)}
                                    </span>
                                    <span className="text-red-600 font-bold text-lg">
                                      {formatPrice(tour.discountedPrice)}
                                    </span>
                                    <Badge variant="destructive" className="text-xs">
                                      Save {formatPrice(tour.price - tour.discountedPrice)}
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-blue-600 font-bold text-lg">
                                    {formatPrice(tour.price)}
                                  </span>
                                )}
                                <span className="text-gray-500 text-sm">per person</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => addSelection(index)}
                              size="lg"
                              className="ml-4 bg-blue-600 hover:bg-blue-700"
                              disabled={isFullyBooked}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Please select a date first</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Items */}
        {selections.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Your Selections</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {selections.map((selection, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold">
                      {new Date(selection.date).toLocaleDateString()} - {formatTimeSlot(tour.timeSlots[selection.timeSlotIndex])}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selection.quantity} × {formatPrice(currentPrice)} = {formatPrice(selection.totalPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} size="lg">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selections)}
            disabled={selections.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            Add to Cart ({selections.length} {selections.length === 1 ? "booking" : "bookings"})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Tour Detail Page Component
const TourDetailView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const tourId = params.id as string;
  const { addItem } = useCart();
  const { t, locale } = useLanguage();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!tourId) {
      setError("Invalid Tour ID.");
      setLoading(false);
      return;
    }
    const fetchTourDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/tour-packages/${tourId}?populate=true`
        );
        if (!response.ok) throw new Error("Failed to fetch tour details.");
        const data: Tour = await response.json();
        setTour(data);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchTourDetails();
  }, [tourId]);

  const openLightbox = (index: number) => {
    setLightboxStartIndex(index);
    setLightboxOpen(true);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to book tours");
      return;
    }

    if (user.role !== "user") {
      toast.error("Only customers can book tours");
      return;
    }

    setShowTimeSlotModal(true);
  };

  const handleTimeSlotConfirm = (selections: BookingSelection[]) => {
    if (!tour) return;

    const currentPrice = tour.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price
      ? tour.discountedPrice
      : tour.price;

    selections.forEach((selection) => {
      const timeSlot = tour.timeSlots[selection.timeSlotIndex];
      const bookingDetails = {
        id: `${tour._id}-${selection.date}-${selection.timeSlotIndex}`,
        name: `${tour.name} - ${selection.date} (${timeSlot.startTime}-${timeSlot.endTime})`,
        price: currentPrice,
        originalPrice: tour.price,
        discountedPrice: tour.discountedPrice || null,
        quantity: selection.quantity,
        image: tour.images[0],
        bookingDate: selection.date,
        timeSlot: `${timeSlot.startTime}-${timeSlot.endTime}`,
        tourId: tour._id,
        currency: tour.currency,
      };

      addItem(bookingDetails as any);
    });

    toast.success(`${selections.length} booking(s) added to cart!`);
    setShowTimeSlotModal(false);
  };

  const formatPrice = (price: number, currency: string) => {
    const priceLocale =
      locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US";
    return new Intl.NumberFormat(priceLocale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'challenging':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'extreme':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateSavings = () => {
    if (tour?.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price) {
      const savings = tour.price - tour.discountedPrice;
      const percentage = Math.round((savings / tour.price) * 100);
      return { amount: savings, percentage };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-200 rounded-xl h-96"></div>
                <div className="bg-gray-200 rounded-xl h-64"></div>
              </div>
              <div className="bg-gray-200 rounded-xl h-80"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">{t("tourDetail.error")}</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/tours")} variant="outline">
            {t("tourDetail.back")}
          </Button>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">{t("tourDetail.notFound")}</h3>
          <p className="text-gray-500 mb-4">The tour you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/tours")} variant="outline">
            Browse All Tours
          </Button>
        </div>
      </div>
    );
  }

  const savings = calculateSavings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/tours")}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> {t("tourDetail.back")}
            </Button>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <div className="relative h-[350px] sm:h-[450px] md:h-[550px] w-full group">
                {tour.images && tour.images.length > 0 ? (
                  <>
                    <button
                      onClick={() => openLightbox(lightboxStartIndex)}
                      className="w-full h-full"
                    >
                      <Image
                        src={tour.images[lightboxStartIndex]}
                        alt={`${tour.name} - Image ${lightboxStartIndex + 1}`}
                        layout="fill"
                        objectFit="cover"
                        priority={true}
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    
                    {tour.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxStartIndex(
                              (prev) => (prev - 1 + tour.images.length) % tour.images.length
                            );
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxStartIndex(
                              (prev) => (prev + 1) % tour.images.length
                            );
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No Image Available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Thumbnail Gallery */}
              {tour.images && tour.images.length > 1 && (
                <div className="p-6">
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {tour.images.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setLightboxStartIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          index === lightboxStartIndex
                            ? "border-blue-500 scale-105 shadow-lg"
                            : "border-transparent hover:border-gray-300 hover:scale-105"
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Tour Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                      {tour.category.name}
                    </Badge>
                    {tour.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {tour.name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                    <span className="text-lg font-medium">{tour.location}</span>
                  </div>
                </div>

                {/* Enhanced Price Display */}
                <div className="text-center lg:text-right bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-2xl border border-blue-100 lg:flex-shrink-0">
                  {tour.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(tour.price, tour.currency)}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          -{savings?.percentage}%
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold text-red-600">
                        {formatPrice(tour.discountedPrice, tour.currency)}
                      </div>
                      <div className="text-sm text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                        Save {formatPrice(savings?.amount || 0, tour.currency)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-blue-600">
                      {formatPrice(tour.price, tour.currency)}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-2 font-medium">per person</div>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <CalendarDays className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {tour.duration}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {tour.duration === 1 ? t("tourDetail.day") : t("tourDetail.days")}
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                  <Users className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {tour.maxGroupSize}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {t("tourDetail.maxGroup")}
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <Mountain className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <div className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${getDifficultyClass(tour.difficulty)} mx-auto inline-block`}>
                    {tour.difficulty}
                  </div>
                  <div className="text-sm text-gray-600 font-medium mt-2">
                    {t("tourDetail.difficulty")}
                  </div>
                </div>
              </div>

              {/* Enhanced Tabs */}
              <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="schedule" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Schedule
                  </TabsTrigger>
                  <TabsTrigger value="description" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    {t("tourDetail.about")}
                  </TabsTrigger>
                  <TabsTrigger value="itinerary" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    {t("tourDetail.itinerary")}
                  </TabsTrigger>
                  <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    {t("tourDetail.whatsIncluded")}
                  </TabsTrigger>
                </TabsList>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="mt-8">
                  <div className="space-y-6">
                    <h4 className="font-bold text-2xl text-gray-900">Schedule & Availability</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <CalendarIcon className="w-6 h-6 mr-3 text-blue-500" />
                          Operating Days
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {tour.operatingDays.map((day) => (
                            <Badge
                              key={day}
                              variant="secondary"
                              className="capitalize bg-blue-100 text-blue-800 border-blue-200 px-3 py-1"
                            >
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Clock className="w-6 h-6 mr-3 text-emerald-500" />
                          Available Times
                        </h5>
                        <div className="space-y-3">
                          {tour.timeSlots
                            .filter((slot) => slot.isActive)
                            .map((timeSlot, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="font-medium text-gray-900">
                                  {timeSlot.startTime} - {timeSlot.endTime}
                                </span>
                                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                                  Max {timeSlot.maxCapacity}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">!</span>
                        </div>
                        <div>
                          <h6 className="font-semibold text-blue-900 mb-2">Booking Policy</h6>
                          <p className="text-sm text-blue-800 leading-relaxed">
                            Book at least <strong>{tour.advanceBookingDays} day(s)</strong> in advance. 
                            Times shown are for <strong>{tour.timeSlotType}</strong> slots. 
                            All bookings are subject to availability and weather conditions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Description Tab */}
                <TabsContent value="description" className="mt-8">
                  <div className="space-y-8">
                    <h4 className="font-bold text-2xl text-gray-900">{t("tourDetail.about")}</h4>

                    {tour.shortDescription && (
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                        <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                          <Star className="w-5 h-5 mr-2" />
                          Quick Overview
                        </h5>
                        <p className="text-blue-800 leading-relaxed text-lg">{tour.shortDescription}</p>
                      </div>
                    )}

                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                        {tour.description || "No detailed description available for this tour."}
                      </p>
                    </div>

                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="font-bold text-xl text-gray-900">Tour Highlights</h5>
                        <div className="grid gap-4">
                          {tour.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-colors">
                              <Star className="w-6 h-6 text-yellow-500 mr-4 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-800 leading-relaxed font-medium">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Itinerary Tab */}
                <TabsContent value="itinerary" className="mt-8">
                  {tour.itinerary && tour.itinerary.length > 0 ? (
                    <div className="space-y-8">
                      <h4 className="font-bold text-2xl text-gray-900">{t("tourDetail.itinerary")}</h4>
                      <div className="space-y-8">
                        {tour.itinerary.map((day, index) => (
                          <div key={day.day} className="flex gap-6 group">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <span className="text-sm">{t("tourDetail.day")} {day.day}</span>
                              </div>
                              {index < tour.itinerary.length - 1 && (
                                <div className="w-0.5 h-16 bg-gradient-to-b from-blue-300 to-gray-200 mt-4"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <h5 className="font-bold text-xl text-gray-900 mb-3">
                                  {day.title}
                                </h5>
                                <p className="text-gray-700 leading-relaxed">
                                  {day.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 max-w-lg mx-auto">
                        <CalendarDays className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h5 className="text-xl font-semibold text-gray-600 mb-3">
                          Detailed Itinerary Coming Soon
                        </h5>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                          We're preparing a detailed day-by-day itinerary for this{" "}
                          {tour.duration}-day experience. Please contact us for more information.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="font-semibold text-gray-900">{tour.duration}</div>
                            <div className="text-gray-600">Days</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="font-semibold text-gray-900">{tour.maxGroupSize}</div>
                            <div className="text-gray-600">Max Group</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="mt-8">
                  {(tour.inclusions && tour.inclusions.length > 0) ||
                  (tour.exclusions && tour.exclusions.length > 0) ? (
                    <div className="space-y-8">
                      <h4 className="font-bold text-2xl text-gray-900">What's Included & Excluded</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Inclusions */}
                        <div className="space-y-4">
                          <h5 className="font-bold text-xl text-green-700 flex items-center">
                            <CheckCircle className="w-6 h-6 mr-2" />
                            {t("tourDetail.inclusions")}
                          </h5>
                          {tour.inclusions && tour.inclusions.length > 0 ? (
                            <div className="space-y-3">
                              {tour.inclusions.map((inclusion, index) => (
                                <div key={index} className="flex items-start p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-800 leading-relaxed">{inclusion}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-xl">
                              Details will be provided upon booking confirmation.
                            </p>
                          )}
                        </div>

                        {/* Exclusions */}
                        <div className="space-y-4">
                          <h5 className="font-bold text-xl text-red-700 flex items-center">
                            <XCircle className="w-6 h-6 mr-2" />
                            {t("tourDetail.exclusions")}
                          </h5>
                          {tour.exclusions && tour.exclusions.length > 0 ? (
                            <div className="space-y-3">
                              {tour.exclusions.map((exclusion, index) => (
                                <div key={index} className="flex items-start p-4 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
                                  <XCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-800 leading-relaxed">{exclusion}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-xl">
                              Exclusion details will be clarified during booking.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 max-w-2xl mx-auto">
                        <ClipboardList className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h5 className="text-xl font-semibold text-gray-600 mb-3">
                          Package Details Coming Soon
                        </h5>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                          We're finalizing the inclusions and exclusions for this tour package. 
                          Contact us directly for the most up-to-date information.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 bg-white rounded-xl border border-blue-200">
                            <h6 className="font-semibold text-blue-900 mb-4">Tour Information</h6>
                            <div className="space-y-2 text-sm text-blue-800">
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span className="font-medium">{tour.duration} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Max Group:</span>
                                <span className="font-medium">{tour.maxGroupSize} people</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Difficulty:</span>
                                <span className="font-medium capitalize">{tour.difficulty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Location:</span>
                                <span className="font-medium">{tour.location}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-white rounded-xl border border-green-200">
                            <h6 className="font-semibold text-green-900 mb-4">Pricing</h6>
                            <div className="space-y-2 text-sm text-green-800">
                              {tour.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price ? (
                                <>
                                  <div className="flex justify-between">
                                    <span>Original Price:</span>
                                    <span className="line-through">{formatPrice(tour.price, tour.currency)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Discounted Price:</span>
                                    <span className="font-bold text-lg text-red-600">
                                      {formatPrice(tour.discountedPrice, tour.currency)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>You Save:</span>
                                    <span className="font-medium text-green-600">
                                      {formatPrice(tour.price - tour.discountedPrice, tour.currency)}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex justify-between">
                                  <span>Price:</span>
                                  <span className="font-bold text-lg">
                                    {formatPrice(tour.price, tour.currency)}
                                  </span>
                                </div>
                              )}
                              <div className="text-center pt-2 border-t border-green-200">
                                <span className="text-xs text-gray-600">per person</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Enhanced Booking Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-32 animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("tourDetail.ready")}</h3>
                <p className="text-gray-600">Select your preferred date and time</p>
              </div>

              {/* Price Summary */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                {tour.discountedPrice && tour.discountedPrice > 0 && tour.discountedPrice < tour.price ? (
                  <div className="text-center">
                    <div className="text-sm text-gray-500 line-through mb-1">
                      {formatPrice(tour.price, tour.currency)}
                    </div>
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      {formatPrice(tour.discountedPrice, tour.currency)}
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Save {savings?.percentage}% • {formatPrice(savings?.amount || 0, tour.currency)}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(tour.price, tour.currency)}
                    </div>
                  </div>
                )}
                <div className="text-center text-sm text-gray-600 mt-1">per person</div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
                  disabled={!user || user.role !== "user"}
                  size="lg"
                >
                  {!user
                    ? "Login to Book Tour"
                    : user.role !== "user"
                    ? "Customer Access Only"
                    : "Select Date & Time"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full py-4 text-lg font-medium rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  size="lg"
                >
                  <ClipboardList className="w-5 h-5 mr-2" />
                  {t("tourDetail.askQuestion")}
                </Button>
              </div>

              <Separator className="my-6" />
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">{t("tourDetail.bookWithConfidence")}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">{t("tourDetail.securePayments")}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Best Price Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={tour.images}
          startIndex={lightboxStartIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {showTimeSlotModal && (
        <TimeSlotSelectionModal
          tour={tour}
          isOpen={showTimeSlotModal}
          onClose={() => setShowTimeSlotModal(false)}
          onConfirm={handleTimeSlotConfirm}
        />
      )}
    </div>
  );
};

export default TourDetailView;