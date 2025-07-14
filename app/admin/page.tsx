'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Package, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingTour, setIsAddingTour] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  // Form states
  const [tourForm, setTourForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    location: '',
    category: '',
    image: '',
    features: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const stats = [
    { title: 'Total Tours', value: tours.length, icon: Package },
    { title: 'Total Bookings', value: '1,234', icon: Users },
    { title: 'Revenue (Month)', value: '$45,678', icon: DollarSign },
    { title: 'Growth Rate', value: '+12.5%', icon: TrendingUp }
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    // Demo data
    setCategories([
      { id: 1, name: 'Adventure', description: 'Thrilling outdoor experiences' },
      { id: 2, name: 'Cultural', description: 'Immersive cultural experiences' },
      { id: 3, name: 'Beach', description: 'Relaxing beach destinations' },
      { id: 4, name: 'Mountain', description: 'Scenic mountain adventures' },
      { id: 5, name: 'City', description: 'Urban exploration tours' }
    ]);

    setTours([
      {
        id: 1,
        name: 'Tropical Paradise Escape',
        description: 'Luxury overwater bungalows and pristine beaches',
        price: 2499,
        duration: '7 Days',
        location: 'Maldives',
        category: 'Beach',
        rating: 4.9,
        image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['All-inclusive', 'Overwater villa', 'Spa included', 'Snorkeling']
      },
      {
        id: 2,
        name: 'Himalayan Adventure Trek',
        description: 'Epic mountain trekking with experienced guides',
        price: 1899,
        duration: '14 Days',
        location: 'Nepal Himalayas',
        category: 'Adventure',
        rating: 4.8,
        image: 'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Expert guides', 'Tea house stays', 'Permits included', 'Equipment rental']
      }
    ]);
  };

  const handleAddTour = () => {
    if (!tourForm.name || !tourForm.price || !tourForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTour: Tour = {
      id: Date.now(),
      name: tourForm.name,
      description: tourForm.description,
      price: parseInt(tourForm.price),
      duration: tourForm.duration,
      location: tourForm.location,
      category: tourForm.category,
      rating: 4.5,
      image: tourForm.image || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: tourForm.features.split(',').map(f => f.trim()).filter(f => f)
    };

    setTours([...tours, newTour]);
    setTourForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      location: '',
      category: '',
      image: '',
      features: ''
    });
    setIsAddingTour(false);
    toast.success('Tour added successfully!');
  };

  const handleEditTour = (tour: Tour) => {
    setEditingTour(tour);
    setTourForm({
      name: tour.name,
      description: tour.description,
      price: tour.price.toString(),
      duration: tour.duration,
      location: tour.location,
      category: tour.category,
      image: tour.image,
      features: tour.features.join(', ')
    });
  };

  const handleUpdateTour = () => {
    if (!editingTour) return;

    const updatedTour: Tour = {
      ...editingTour,
      name: tourForm.name,
      description: tourForm.description,
      price: parseInt(tourForm.price),
      duration: tourForm.duration,
      location: tourForm.location,
      category: tourForm.category,
      image: tourForm.image,
      features: tourForm.features.split(',').map(f => f.trim()).filter(f => f)
    };

    setTours(tours.map(t => t.id === editingTour.id ? updatedTour : t));
    setEditingTour(null);
    setTourForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      location: '',
      category: '',
      image: '',
      features: ''
    });
    toast.success('Tour updated successfully!');
  };

  const handleDeleteTour = (id: number) => {
    setTours(tours.filter(t => t.id !== id));
    toast.success('Tour deleted successfully!');
  };

  const handleAddCategory = () => {
    if (!categoryForm.name) {
      toast.error('Please enter category name');
      return;
    }

    const newCategory: Category = {
      id: Date.now(),
      name: categoryForm.name,
      description: categoryForm.description
    };

    setCategories([...categories, newCategory]);
    setCategoryForm({ name: '', description: '' });
    setIsAddingCategory(false);
    toast.success('Category added successfully!');
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Category deleted successfully!');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your tours and categories</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Categories Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Name</Label>
                    <Input
                      id="categoryName"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">Description</Label>
                    <Textarea
                      id="categoryDescription"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      placeholder="Category description"
                    />
                  </div>
                  <Button onClick={handleAddCategory} className="w-full">
                    Add Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tours Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tours</CardTitle>
            <Dialog open={isAddingTour} onOpenChange={setIsAddingTour}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tour
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Tour</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tourName">Name</Label>
                    <Input
                      id="tourName"
                      value={tourForm.name}
                      onChange={(e) => setTourForm({...tourForm, name: e.target.value})}
                      placeholder="Tour name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tourPrice">Price</Label>
                    <Input
                      id="tourPrice"
                      type="number"
                      value={tourForm.price}
                      onChange={(e) => setTourForm({...tourForm, price: e.target.value})}
                      placeholder="Price in USD"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tourLocation">Location</Label>
                    <Input
                      id="tourLocation"
                      value={tourForm.location}
                      onChange={(e) => setTourForm({...tourForm, location: e.target.value})}
                      placeholder="Location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tourDuration">Duration</Label>
                    <Input
                      id="tourDuration"
                      value={tourForm.duration}
                      onChange={(e) => setTourForm({...tourForm, duration: e.target.value})}
                      placeholder="e.g., 7 Days"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tourCategory">Category</Label>
                    <Select value={tourForm.category} onValueChange={(value) => setTourForm({...tourForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tourImage">Image URL</Label>
                    <Input
                      id="tourImage"
                      value={tourForm.image}
                      onChange={(e) => setTourForm({...tourForm, image: e.target.value})}
                      placeholder="Image URL"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="tourDescription">Description</Label>
                    <Textarea
                      id="tourDescription"
                      value={tourForm.description}
                      onChange={(e) => setTourForm({...tourForm, description: e.target.value})}
                      placeholder="Tour description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="tourFeatures">Features (comma separated)</Label>
                    <Input
                      id="tourFeatures"
                      value={tourForm.features}
                      onChange={(e) => setTourForm({...tourForm, features: e.target.value})}
                      placeholder="Feature 1, Feature 2, Feature 3"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button onClick={handleAddTour} className="w-full">
                      Add Tour
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tours.map((tour) => (
                <div key={tour.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">{tour.name}</h3>
                        <p className="text-sm text-gray-600">{tour.location} • {tour.duration}</p>
                        <Badge variant="secondary">{tour.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">${tour.price}</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTour(tour)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Tour</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="editTourName">Name</Label>
                              <Input
                                id="editTourName"
                                value={tourForm.name}
                                onChange={(e) => setTourForm({...tourForm, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="editTourPrice">Price</Label>
                              <Input
                                id="editTourPrice"
                                type="number"
                                value={tourForm.price}
                                onChange={(e) => setTourForm({...tourForm, price: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="editTourLocation">Location</Label>
                              <Input
                                id="editTourLocation"
                                value={tourForm.location}
                                onChange={(e) => setTourForm({...tourForm, location: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="editTourDuration">Duration</Label>
                              <Input
                                id="editTourDuration"
                                value={tourForm.duration}
                                onChange={(e) => setTourForm({...tourForm, duration: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="editTourCategory">Category</Label>
                              <Select value={tourForm.category} onValueChange={(value) => setTourForm({...tourForm, category: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="editTourImage">Image URL</Label>
                              <Input
                                id="editTourImage"
                                value={tourForm.image}
                                onChange={(e) => setTourForm({...tourForm, image: e.target.value})}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="editTourDescription">Description</Label>
                              <Textarea
                                id="editTourDescription"
                                value={tourForm.description}
                                onChange={(e) => setTourForm({...tourForm, description: e.target.value})}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="editTourFeatures">Features (comma separated)</Label>
                              <Input
                                id="editTourFeatures"
                                value={tourForm.features}
                                onChange={(e) => setTourForm({...tourForm, features: e.target.value})}
                              />
                            </div>
                            <div className="col-span-2">
                              <Button onClick={handleUpdateTour} className="w-full">
                                Update Tour
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTour(tour.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}