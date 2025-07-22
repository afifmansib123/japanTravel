"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Package,
  ArrowLeft,
  Upload,
  X,
  Plus,
  MapPin,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface TourFormData {
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  location: string;
  duration: number;
  price: number;
  discountedPrice: number;
  currency: string;
  maxGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme';
  images: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  isActive: boolean;
  isFeatured: boolean;
}

const AdminCreateTour: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const [formData, setFormData] = useState<TourFormData>({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    location: '',
    duration: 1,
    price: 0,
    discountedPrice: 0,
    currency: 'JPY',
    maxGroupSize: 1,
    difficulty: 'moderate',
    images: [],
    highlights: [],
    inclusions: [],
    exclusions: [],
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories?isActive=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TourFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field: 'highlights' | 'inclusions' | 'exclusions' | 'images', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      
      // Clear the input
      if (field === 'highlights') setNewHighlight('');
      if (field === 'inclusions') setNewInclusion('');
      if (field === 'exclusions') setNewExclusion('');
      if (field === 'images') setNewImageUrl('');
    }
  };

  const removeFromArray = (field: 'highlights' | 'inclusions' | 'exclusions' | 'images', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Tour name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (formData.duration <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }
    if (formData.maxGroupSize <= 0) {
      toast.error('Max group size must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/tour-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTour = await response.json();
        toast.success('Tour created successfully!');
        router.push('/admin/tours');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create tour');
      }
    } catch (error) {
      console.error('Error creating tour:', error);
      toast.error('Error creating tour');
    } finally {
      setSubmitting(false);
    }
  };

  const actions = (
    <div className="flex space-x-2">
      <Button asChild variant="outline">
        <Link href="/admin/tours">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tours
        </Link>
      </Button>
      <Button 
        type="submit" 
        form="tour-form" 
        disabled={submitting}
      >
        {submitting ? 'Creating...' : 'Create Tour'}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout
        title="Create New Tour"
        subtitle="Add a new tour package to your catalog"
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
      title="Create New Tour"
      subtitle="Add a new tour package to your catalog"
      actions={actions}
    >
      <form id="tour-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details about your tour package
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tour Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Amazing Mountain Adventure"
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Tokyo, Japan"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Brief summary for listings..."
                maxLength={300}
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the tour..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tour Details */}
        <Card>
          <CardHeader>
            <CardTitle>Tour Details</CardTitle>
            <CardDescription>
              Pricing, duration, and logistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (Days) *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxGroupSize">Max Group Size *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="maxGroupSize"
                    type="number"
                    min="1"
                    value={formData.maxGroupSize}
                    onChange={(e) => handleInputChange('maxGroupSize', parseInt(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (JPY) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="discountedPrice">Discounted Price (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="discountedPrice"
                    type="number"
                    min="0"
                    value={formData.discountedPrice}
                    onChange={(e) => handleInputChange('discountedPrice', parseFloat(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Tour Images</CardTitle>
            <CardDescription>
              Add image URLs for your tour gallery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter image URL..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button 
                  type="button" 
                  onClick={() => addToArray('images', newImageUrl)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((image, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-2">
                      <span className="truncate max-w-xs">{image}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('images', index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Highlights, Inclusions, Exclusions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Highlights</CardTitle>
              <CardDescription>
                Key attractions and experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add highlight..."
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={() => addToArray('highlights', newHighlight)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{highlight}</span>
                      <X 
                        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500" 
                        onClick={() => removeFromArray('highlights', index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inclusions */}
          <Card>
            <CardHeader>
              <CardTitle>Inclusions</CardTitle>
              <CardDescription>
                What's included in the price
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add inclusion..."
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={() => addToArray('inclusions', newInclusion)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{inclusion}</span>
                      <X 
                        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500" 
                        onClick={() => removeFromArray('inclusions', index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exclusions */}
          <Card>
            <CardHeader>
              <CardTitle>Exclusions</CardTitle>
              <CardDescription>
                What's not included
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add exclusion..."
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={() => addToArray('exclusions', newExclusion)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{exclusion}</span>
                      <X 
                        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500" 
                        onClick={() => removeFromArray('exclusions', index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tour Settings</CardTitle>
            <CardDescription>
              Visibility and status options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-gray-600">
                    Make this tour visible to customers
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isFeatured">Featured</Label>
                  <p className="text-sm text-gray-600">
                    Show this tour in featured sections
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
};

export default AdminCreateTour;