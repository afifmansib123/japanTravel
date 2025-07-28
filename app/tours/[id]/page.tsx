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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext"; // --- IMPORT useLanguage ---
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

// ImageLightbox component remains the same...
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
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div className="relative max-w-[90vw] max-h-[90vh]">
        <Image
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          width={1200}
          height={800}
          className="max-w-full max-h-full object-contain"
          priority
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
        {currentIndex + 1} / {images.length}
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
    maxDate.setDate(today.getDate() + 90); // 3 months ahead

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
    const currentPrice =
      tour.discountedPrice && tour.discountedPrice < tour.price
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
    const currentPrice =
      tour.discountedPrice && tour.discountedPrice < tour.price
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Date & Time</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <h3 className="font-semibold mb-4">Choose Date</h3>
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
              className="rounded-md border"
            />
          </div>

          {/* Time Slots */}
          {/* Time Slots */}
          <div>
            <h3 className="font-semibold mb-4">Available Time Slots</h3>
            {selectedDate ? (
              <div className="space-y-3">
                {loadingAvailability ? (
                  <p className="text-gray-500">Checking availability...</p>
                ) : (
                  tour.timeSlots
                    .filter((slot) => slot.isActive)
                    .map((timeSlot, index) => {
                      const bookedQuantity = availabilityData[index] || 0;
                      const isFullyBooked =
                        bookedQuantity >= timeSlot.maxCapacity;
                      const currentPrice =
                        tour.discountedPrice &&
                        tour.discountedPrice < tour.price
                          ? tour.discountedPrice
                          : tour.price;

                      return (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg ${
                            isFullyBooked
                              ? "bg-gray-100 opacity-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {formatTimeSlot(timeSlot)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {isFullyBooked ? (
                                  <span className="text-red-600 font-medium">
                                    Fully Booked
                                  </span>
                                ) : (
                                  <span className="text-green-600 font-medium">
                                    Available
                                  </span>
                                )}
                              </div>
                              <div className="text-sm font-medium">
                                {tour.discountedPrice &&
                                tour.discountedPrice < tour.price ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 line-through text-xs">
                                      {formatPrice(tour.price)}
                                    </span>
                                    <span className="text-red-600 font-bold">
                                      {formatPrice(tour.discountedPrice)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-blue-600">
                                    {formatPrice(tour.price)}
                                  </span>
                                )}
                                <span className="text-gray-500">
                                  {" "}
                                  per person
                                </span>
                              </div>
                            </div>
                            <Button
                              onClick={() => addSelection(index)}
                              size="sm"
                              className="ml-2"
                              disabled={isFullyBooked}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            ) : (
              <p className="text-gray-500">Please select a date first</p>
            )}
          </div>
        </div>

        {/* Selected Items */}
        {selections.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-4">Your Selections</h3>
            <div className="space-y-3">
              {selections.map((selection, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(selection.date).toLocaleDateString()} -
                      {formatTimeSlot(tour.timeSlots[selection.timeSlotIndex])}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selection.quantity} × {formatPrice(tour.price)} ={" "}
                      {formatPrice(selection.totalPrice)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(index, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-medium">{selection.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(index, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total: {formatPrice(getTotalPrice())}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selections)}
            disabled={selections.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add to Cart ({selections.length}{" "}
            {selections.length === 1 ? "booking" : "bookings"})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- MAIN TOUR DETAIL PAGE COMPONENT (UPDATED FOR LANGUAGE) ---
const TourDetailView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const tourId = params.id as string;
  const { addItem } = useCart();
  const { t, locale } = useLanguage(); // --- USE THE LANGUAGE HOOK ---

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

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

    const currentPrice =
      tour.discountedPrice && tour.discountedPrice < tour.price
        ? tour.discountedPrice
        : tour.price;

    selections.forEach((selection) => {
      const timeSlot = tour.timeSlots[selection.timeSlotIndex];
      const bookingDetails = {
        id: `${tour._id}-${selection.date}-${selection.timeSlotIndex}`,
        name: `${tour.name} - ${selection.date} (${timeSlot.startTime}-${timeSlot.endTime})`,
        price: currentPrice, // Use discounted price if available
        originalPrice: tour.price, // Store original price for reference
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
    // Use locale from context for accurate currency formatting
    const priceLocale =
      locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US";
    return new Intl.NumberFormat(priceLocale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const getDifficultyClass = (difficulty: string) => {
    // ... (no changes needed)
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("tourDetail.loading")}</p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>
          {t("tourDetail.error")}: {error}
        </p>
      </div>
    );
  if (!tour)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("tourDetail.notFound")}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/tours")}
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {t("tourDetail.back")}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Main Image Display */}
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
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                    {/* Navigation Arrows on Main Image */}
                    {tour.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxStartIndex(
                              (prev) =>
                                (prev - 1 + tour.images.length) %
                                tour.images.length
                            );
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full transition-opacity z-10"
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full transition-opacity z-10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    {/* Placeholder for when there are no images */}
                    <p className="text-gray-500">No Image Available</p>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {tour.images && tour.images.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {tour.images.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setLightboxStartIndex(index)}
                        className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === lightboxStartIndex
                            ? "border-blue-500 scale-105"
                            : "border-transparent hover:border-gray-400"
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          width={96}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Badge className="mb-2">{tour.category.name}</Badge>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {tour.name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{tour.location}</span>
                  </div>
                </div>

                {/* UPDATED PRICE DISPLAY */}
                <div className="text-right">
                  {tour.discountedPrice && tour.discountedPrice < tour.price ? (
                    <div>
                      <div className="text-lg text-gray-500 line-through">
                        {formatPrice(tour.price, tour.currency)}
                      </div>
                      <div className="text-3xl font-bold text-red-600">
                        {formatPrice(tour.discountedPrice, tour.currency)}
                      </div>
                      <div className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full mt-1">
                        Save{" "}
                        {formatPrice(
                          tour.price - tour.discountedPrice,
                          tour.currency
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPrice(tour.price, tour.currency)}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-1">per person</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CalendarDays className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-gray-900">
                    {tour.duration}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("tourDetail.days")}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-gray-900">
                    {tour.maxGroupSize}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("tourDetail.maxGroup")}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Mountain className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div
                    className={`px-3 py-1 rounded-full text-lg font-semibold capitalize ${getDifficultyClass(
                      tour.difficulty
                    )}`}
                  >
                    {tour.difficulty}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {t("tourDetail.difficulty")}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="description">
                    {t("tourDetail.about")}
                  </TabsTrigger>
                  <TabsTrigger value="itinerary">
                    {t("tourDetail.itinerary")}
                  </TabsTrigger>
                  <TabsTrigger value="details">
                    {t("tourDetail.whatsIncluded")}
                  </TabsTrigger>
                </TabsList>

                {/* SCHEDULE TAB */}
                <TabsContent value="schedule" className="mt-6">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    Schedule & Availability
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Operating Days
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {tour.operatingDays.map((day) => (
                          <Badge
                            key={day}
                            variant="secondary"
                            className="capitalize"
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Available Times
                      </h5>
                      <div className="space-y-2">
                        {tour.timeSlots
                          .filter((slot) => slot.isActive)
                          .map((timeSlot, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <span className="font-medium">
                                {timeSlot.startTime} - {timeSlot.endTime}
                              </span>
                              <span className="text-sm text-gray-600">
                                Max {timeSlot.maxCapacity} people
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Booking Policy:</strong> Book at least{" "}
                      {tour.advanceBookingDays} day(s) in advance. Times shown
                      are for {tour.timeSlotType} slots.
                    </p>
                  </div>
                </TabsContent>

                {/* DESCRIPTION TAB */}
                <TabsContent value="description" className="mt-6">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    {t("tourDetail.about")}
                  </h4>

                  {/* Main Description */}
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {tour.description ||
                        "No detailed description available for this tour."}
                    </p>
                  </div>

                  {/* Short Description if available */}
                  {tour.shortDescription && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h5 className="font-medium text-blue-900 mb-2">
                        Quick Overview
                      </h5>
                      <p className="text-blue-800">{tour.shortDescription}</p>
                    </div>
                  )}

                  {/* Highlights Section - Only show if data exists */}
                  {tour.highlights && tour.highlights.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="font-semibold text-lg text-gray-900 mb-3">
                        {t("tourDetail.highlights")}
                      </h4>
                      <ul className="grid gap-3">
                        {tour.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <Star className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-center">
                        Tour highlights will be updated soon. Contact us for
                        more details about this experience.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* ITINERARY TAB */}
                <TabsContent value="itinerary" className="mt-6">
                  {tour.itinerary && tour.itinerary.length > 0 ? (
                    <div className="space-y-6">
                      {tour.itinerary.map((day) => (
                        <div key={day.day} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center">
                              {t("tourDetail.day")} {day.day}
                            </div>
                            {day.day < tour.itinerary.length && (
                              <div className="w-px h-full bg-gray-200 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <h5 className="font-semibold text-lg text-gray-900 mb-2">
                              {day.title}
                            </h5>
                            <p className="text-gray-700 leading-relaxed">
                              {day.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-gray-600 mb-2">
                        Detailed Itinerary Coming Soon
                      </h5>
                      <p className="text-gray-500 max-w-md mx-auto">
                        We're preparing a detailed day-by-day itinerary for this{" "}
                        {tour.duration}-day experience. Please contact us for
                        more information about the planned activities.
                      </p>
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg inline-block">
                        <p className="text-blue-800">
                          <strong>Duration:</strong> {tour.duration} days
                          <br />
                          <strong>Location:</strong> {tour.location}
                          <br />
                          <strong>Group Size:</strong> Up to {tour.maxGroupSize}{" "}
                          people
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* DETAILS TAB */}
                <TabsContent value="details" className="mt-6">
                  {(tour.inclusions && tour.inclusions.length > 0) ||
                  (tour.exclusions && tour.exclusions.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Inclusions */}
                      <div>
                        <h4 className="font-semibold text-lg text-green-700 mb-3">
                          {t("tourDetail.inclusions")}
                        </h4>
                        {tour.inclusions && tour.inclusions.length > 0 ? (
                          <ul className="space-y-2">
                            {tour.inclusions.map((inclusion, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">
                                  {inclusion}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">
                            Details will be provided upon booking confirmation.
                          </p>
                        )}
                      </div>

                      {/* Exclusions */}
                      <div>
                        <h4 className="font-semibold text-lg text-red-700 mb-3">
                          {t("tourDetail.exclusions")}
                        </h4>
                        {tour.exclusions && tour.exclusions.length > 0 ? (
                          <ul className="space-y-2">
                            {tour.exclusions.map((exclusion, index) => (
                              <li key={index} className="flex items-start">
                                <XCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">
                                  {exclusion}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">
                            Exclusion details will be clarified during booking.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-gray-600 mb-2">
                        Package Details Coming Soon
                      </h5>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        We're finalizing the inclusions and exclusions for this
                        tour package. Contact us directly for the most
                        up-to-date information.
                      </p>

                      {/* Show available tour info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h6 className="font-medium text-blue-900 mb-2">
                            Tour Information
                          </h6>
                          <div className="text-sm text-blue-800 space-y-1">
                            <p>
                              <strong>Duration:</strong> {tour.duration} days
                            </p>
                            <p>
                              <strong>Max Group:</strong> {tour.maxGroupSize}{" "}
                              people
                            </p>
                            <p>
                              <strong>Difficulty:</strong> {tour.difficulty}
                            </p>
                            <p>
                              <strong>Location:</strong> {tour.location}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                          <h6 className="font-medium text-green-900 mb-2">
                            Pricing
                          </h6>
                          <div className="text-sm text-green-800 space-y-1">
                            {tour.discountedPrice ? (
                              <>
                                <p className="line-through text-gray-500">
                                  {formatPrice(tour.price, tour.currency)}
                                </p>
                                <p className="font-bold text-lg">
                                  {formatPrice(
                                    tour.discountedPrice,
                                    tour.currency
                                  )}
                                </p>
                              </>
                            ) : (
                              <p className="font-bold text-lg">
                                {formatPrice(tour.price, tour.currency)}
                              </p>
                            )}
                            <p>per person</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("tourDetail.ready")}
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  disabled={!user || user.role !== "user"}
                >
                  {!user
                    ? "Login to Book"
                    : user.role !== "user"
                    ? "Customer Access Only"
                    : "Select Date & Time"}
                </Button>
                <Button variant="outline" className="w-full py-3">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  {t("tourDetail.askQuestion")}
                </Button>
              </div>
              <Separator className="my-6" />
              <div className="text-center text-sm text-gray-600">
                <p>{t("tourDetail.bookWithConfidence")}</p>
                <p>{t("tourDetail.securePayments")}</p>
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
