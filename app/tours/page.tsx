"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, MapPin, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

// --- 1. UPDATE THE TOUR INTERFACE TO MATCH YOUR API DATA ---
interface Tour {
  _id: string; // Changed from id: number
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  duration: number; // Changed from string
  location: string;
  category: {
    // Category is now an object
    _id: string;
    name: string;
  };
  difficulty: string;
  images: string[]; // Changed from image: string
  highlights: string[];
}

interface Category {
  _id: string;
  name: string;
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { t } = useLanguage();

  // --- 2. FETCH REAL TOURS AND CATEGORIES ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch tours and categories in parallel
        const [toursResponse, categoriesResponse] = await Promise.all([
          fetch("/api/tour-packages?populate=true&isActive=true"),
          fetch("/api/categories?isActive=true"),
        ]);

        if (!toursResponse.ok || !categoriesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const toursData = await toursResponse.json();
        const categoriesData = await categoriesResponse.json();

        setTours(toursData.tourPackages || []);
        setFilteredTours(toursData.tourPackages || []); // Initially show all tours
        setCategories(categoriesData.categories || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load tour data. Please try again later.");
        // You could keep the demo data as a fallback here if you want
        setTours([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run only once on component mount

  // --- 3. UPDATE FILTERING LOGIC ---
  useEffect(() => {
    let filtered = tours;

    // Filter by search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tour) =>
          tour.name.toLowerCase().includes(lowercasedTerm) ||
          tour.location.toLowerCase().includes(lowercasedTerm) ||
          (tour.shortDescription &&
            tour.shortDescription.toLowerCase().includes(lowercasedTerm))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (tour) => tour.category?._id === selectedCategory
      );
    }

    setFilteredTours(filtered);
  }, [searchTerm, selectedCategory, tours]);

  const handleAddToCart = (tour: Tour) => {
    addItem({
      id: tour._id as any,
      name: tour.name,
      price: tour.price,
      // Use the first image from the images array
      image: tour.images[0] || "/placeholder.png",
    });
    toast.success(`${tour.name} ${t("tours.addToCart")}!`);
  };

  if (loading) {
    // ... (Loading spinner component remains the same)
  }

  // --- 4. UPDATE THE JSX TO USE REAL DATA FIELDS ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* ... (Header component remains the same) */}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("tours.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              {t("tours.filters")}
            </Button>
          </div>
        </div>

        {/* Results */}
        {/* ... (Results count remains the same) */}

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <Card
              key={tour._id}
              className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="relative h-48">
                <img
                  src={
                    tour.images[0] ||
                    "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-blue-600">
                  {tour.category?.name || "Uncategorized"}
                </Badge>
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                  ¥{tour.price}
                </div>
              </div>
              <CardContent className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{tour.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {tour.duration} {tour.duration === 1 ? "Day" : "Days"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                  {tour.shortDescription || tour.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {tour.highlights.slice(0, 3).map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/tours/${tour._id}`}>
                      {t("tours.viewDetails")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results Message */}
        {/* ... (No results component remains the same) */}
      </div>
    </div>
  );
}
