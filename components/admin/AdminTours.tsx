"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  MoreHorizontal,
  Filter,
  Star,
  MapPin,
  Calendar,
  Users,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface TourPackage {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: Category;
  location: string;
  duration: number;
  price: number;
  discountedPrice?: number;
  currency: string;
  maxGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme';
  images: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  isActive: boolean;
  isFeatured: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface ToursResponse {
  tourPackages: TourPackage[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const AdminTours: React.FC = () => {
  const { t } = useLanguage();
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchTours();
  }, [currentPage, selectedCategory, selectedDifficulty, showActiveOnly, showFeaturedOnly]);

  useEffect(() => {
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchTours();
    }
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?isActive=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        populate: 'true',
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedDifficulty !== 'all') {
        params.append('difficulty', selectedDifficulty);
      }
      if (showActiveOnly) {
        params.append('isActive', 'true');
      }
      if (showFeaturedOnly) {
        params.append('isFeatured', 'true');
      }

      const response = await fetch(`/api/tour-packages?${params.toString()}`);
      if (response.ok) {
        const data: ToursResponse = await response.json();
        let filteredTours = data.tourPackages;

        // Apply search filter on frontend
        if (searchTerm) {
          filteredTours = filteredTours.filter(tour =>
            tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tour.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tour.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setTours(filteredTours);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } else {
        toast.error('Failed to fetch tours');
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast.error('Error fetching tours');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm('Are you sure you want to delete this tour package?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tour-packages/${tourId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTours(tours.filter(tour => tour._id !== tourId));
        toast.success('Tour package deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete tour package');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast.error('Error deleting tour package');
    }
  };

  const toggleFeatured = async (tourId: string, isFeatured: boolean) => {
    try {
      const tour = tours.find(t => t._id === tourId);
      if (!tour) return;

      const response = await fetch(`/api/tour-packages/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tour,
          isFeatured: !isFeatured,
        }),
      });

      if (response.ok) {
        const updatedTour = await response.json();
        setTours(tours.map(t => t._id === tourId ? updatedTour : t));
        toast.success(`Tour ${!isFeatured ? 'featured' : 'unfeatured'} successfully`);
      } else {
        toast.error('Failed to update tour');
      }
    } catch (error) {
      console.error('Error updating tour:', error);
      toast.error('Error updating tour');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setShowActiveOnly(false);
    setShowFeaturedOnly(false);
  };

  const actions = (
    <div className="flex space-x-2">
      <Button asChild>
        <Link href="/admin/tours/new" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>{t('admin.tours.create')}</span>
        </Link>
      </Button>
    </div>
  );

  if (loading && tours.length === 0) {
    return (
      <AdminLayout
        title={t('admin.tours.title')}
        subtitle={t('admin.tours.subtitle')}
        actions={actions}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t('admin.tours.title')}
      subtitle={t('admin.tours.subtitle')}
      actions={actions}
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('admin.common.search') + ' tours...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">{t('admin.difficulty.easy')}</SelectItem>
                <SelectItem value="moderate">{t('admin.difficulty.moderate')}</SelectItem>
                <SelectItem value="challenging">{t('admin.difficulty.challenging')}</SelectItem>
                <SelectItem value="extreme">{t('admin.difficulty.extreme')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggles */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-filter"
                  checked={showActiveOnly}
                  onCheckedChange={setShowActiveOnly}
                />
                <Label htmlFor="active-filter" className="text-sm">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured-filter"
                  checked={showFeaturedOnly}
                  onCheckedChange={setShowFeaturedOnly}
                />
                <Label htmlFor="featured-filter" className="text-sm">Featured</Label>
              </div>
            </div>
          </div>
          
          {/* Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear Filters
            </Button>
            <span className="text-sm text-gray-600">
              Showing {tours.length} of {totalCount} tours
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            {t('admin.tours.title')} ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {totalCount === 0 ? t('admin.tours.noTours') : 'No matching tours'}
              </h3>
              <p className="text-gray-600 mb-4">
                {totalCount === 0 ? t('admin.tours.createFirst') : 'Try adjusting your search or filters'}
              </p>
              {totalCount === 0 && (
                <Button asChild>
                  <Link href="/admin/tours/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.tours.create')}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.tours.name')}</TableHead>
                      <TableHead>{t('admin.tours.category')}</TableHead>
                      <TableHead>{t('admin.tours.location')}</TableHead>
                      <TableHead>{t('admin.tours.duration')}</TableHead>
                      <TableHead>{t('admin.tours.price')}</TableHead>
                      <TableHead>{t('admin.tours.difficulty')}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">{t('admin.tours.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tour) => (
                      <TableRow key={tour._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {tour.images.length > 0 ? (
                                <img
                                  src={tour.images[0]}
                                  alt={tour.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {tour.name}
                                {tour.isFeatured && (
                                  <Star className="inline h-4 w-4 text-yellow-500 ml-1" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {tour.shortDescription || tour.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tour.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {tour.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {tour.duration} days
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ¥{tour.price.toLocaleString()}
                            {tour.discountedPrice && (
                              <div className="text-xs text-gray-500 line-through">
                                ¥{tour.discountedPrice.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(tour.difficulty)}>
                            {t(`admin.difficulty.${tour.difficulty}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant={tour.isActive ? 'default' : 'secondary'}>
                              {tour.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {tour.isFeatured && (
                              <Badge variant="outline" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tours/${tour._id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t('admin.common.view')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tours/${tour._id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  {t('admin.common.edit')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => toggleFeatured(tour._id, tour.isFeatured)}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                {tour.isFeatured ? 'Unfeature' : 'Feature'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTour(tour._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('admin.common.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTours;