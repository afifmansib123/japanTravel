'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import Link from 'next/link';

interface Tour {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  category: string;
  rating: number;
  image: string;
  features: string[];
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { t } = useLanguage();

  const categories = [
    { value: 'all', label: t('tours.category.all') },
    { value: 'adventure', label: t('tours.category.adventure') },
    { value: 'cultural', label: t('tours.category.cultural') },
    { value: 'beach', label: t('tours.category.beach') },
    { value: 'mountain', label: t('tours.category.mountain') },
    { value: 'city', label: t('tours.category.city') }
  ];

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    filterTours();
  }, [tours, searchTerm, selectedCategory]);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours');
      const data = await response.json();
      setTours(data);
    } catch (error) {
      console.error('Error fetching tours:', error);
      // Demo data fallback
      setTours(demoTours);
    } finally {
      setLoading(false);
    }
  };

  const filterTours = () => {
    let filtered = tours;

    if (searchTerm) {
      filtered = filtered.filter(tour =>
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tour => tour.category === selectedCategory);
    }

    setFilteredTours(filtered);
  };

  const handleAddToCart = (tour: Tour) => {
    addItem({
      id: tour.id,
      name: tour.name,
      price: tour.price,
      image: tour.image
    });
    toast.success(`${tour.name} ${t('tours.addToCart')}!`);
  };

  const demoTours: Tour[] = [
    {
      id: 1,
      name: 'Tropical Paradise Escape',
      description: 'Luxury overwater bungalows and pristine beaches in the Maldives',
      price: 2499,
      duration: '7 Days',
      location: 'Maldives',
      category: 'beach',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['All-inclusive', 'Overwater villa', 'Spa included', 'Snorkeling']
    },
    {
      id: 2,
      name: 'Himalayan Adventure Trek',
      description: 'Epic mountain trekking with experienced guides through Nepal',
      price: 1899,
      duration: '14 Days',
      location: 'Nepal Himalayas',
      category: 'adventure',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Expert guides', 'Tea house stays', 'Permits included', 'Equipment rental']
    },
    {
      id: 3,
      name: 'European Cultural Journey',
      description: 'Explore historic cities and world-class cuisine across Italy and France',
      price: 3299,
      duration: '10 Days',
      location: 'Italy & France',
      category: 'cultural',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Museum passes', 'Local guides', 'Cooking classes', 'Wine tasting']
    },
    {
      id: 4,
      name: 'African Safari Adventure',
      description: 'Wildlife viewing and luxury lodge accommodations in Kenya',
      price: 4199,
      duration: '12 Days',
      location: 'Kenya',
      category: 'adventure',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/1963622/pexels-photo-1963622.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Game drives', 'Luxury lodges', 'Photography guide', 'Conservation visit']
    },
    {
      id: 5,
      name: 'Swiss Alps Retreat',
      description: 'Mountain villages, alpine lakes, and scenic railway journeys',
      price: 2899,
      duration: '8 Days',
      location: 'Switzerland',
      category: 'mountain',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['Scenic trains', 'Cable car rides', 'Mountain hotels', 'Hiking trails']
    },
    {
      id: 6,
      name: 'Tokyo City Explorer',
      description: 'Modern metropolis meets traditional culture in Japan',
      price: 2699,
      duration: '9 Days',
      location: 'Tokyo, Japan',
      category: 'city',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: ['City tours', 'Temple visits', 'Food experiences', 'Cultural workshops']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('tours.title')}</h1>
          <p className="text-xl text-gray-600">{t('tours.subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('tours.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              {t('tours.filters')}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {t('tours.showing')} {filteredTours.length} {filteredTours.length === 1 ? t('tours.tour') : t('tours.tours')}
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-blue-600">
                  {tour.category}
                </Badge>
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-900">
                  ${tour.price}
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{tour.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">{tour.duration}</span>
                </div>
                <div className="flex items-center mb-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{tour.rating}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tour.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {tour.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/tours/${tour.id}`}>{t('tours.viewDetails')}</Link>
                  </Button>
                  <Button 
                    onClick={() => handleAddToCart(tour)}
                    className="flex-1"
                  >
                    {t('tours.addToCart')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('tours.noResults')}</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-4"
            >
              {t('tours.clearFilters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}