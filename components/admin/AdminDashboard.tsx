"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from "./AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  FolderOpen,
  Users,
  BarChart3,
  TrendingUp,
  Calendar,
  Star,
  MapPin,
  Plus,
  ArrowRight,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  overview: {
    totalCategories: number;
    activeCategories: number;
    totalTourPackages: number;
    activeTourPackages: number;
    featuredTourPackages: number;
    inactiveCategories: number;
    inactiveTourPackages: number;
  };
  tourPackagesByDifficulty: Array<{
    difficulty: string;
    count: number;
  }>;
  tourPackagesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  recentTourPackages: Array<{
    _id: string;
    name: string;
    location: string;
    price: number;
    createdAt: string;
    category: {
      name: string;
    };
  }>;
  priceStatistics: {
    averagePrice: number;
    minimumPrice: number;
    maximumPrice: number;
    totalPackagesWithPrice: number;
  };
  generatedAt: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: t('admin.quickActions.newTour'),
      description: t('admin.quickActions.newTourDesc'),
      href: '/admin/tours/new',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: t('admin.quickActions.newCategory'),
      description: t('admin.quickActions.newCategoryDesc'),
      href: '/admin/categories',
      icon: FolderOpen,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: t('admin.quickActions.viewBookings'),
      description: t('admin.quickActions.viewBookingsDesc'),
      href: '/admin/tours',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600',
    },

  ];

  if (loading) {
    return (
      <AdminLayout
        title={t('admin.dashboard.title')}
        subtitle={t('admin.dashboard.subtitle')}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t('admin.dashboard.title')}
      subtitle={t('admin.dashboard.subtitle')}
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('admin.dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Overview Stats */}
        {stats && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('admin.dashboard.overview')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t('admin.dashboard.totalCategories')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {stats.overview.totalCategories}
                      </span>
                      <FolderOpen className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.overview.activeCategories} {t('admin.dashboard.active')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t('admin.dashboard.totalTours')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {stats.overview.totalTourPackages}
                      </span>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.overview.activeTourPackages} {t('admin.dashboard.active')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t('admin.dashboard.featuredTours')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {stats.overview.featuredTourPackages}
                      </span>
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t('admin.dashboard.averagePrice')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        ¥{stats.priceStatistics.averagePrice.toLocaleString()}
                      </span>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      ¥{stats.priceStatistics.minimumPrice.toLocaleString()} - ¥{stats.priceStatistics.maximumPrice.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tours by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2 text-green-600" />
                    {t('admin.dashboard.toursByCategory')}
                  </CardTitle>
                  <CardDescription>
                    {t('admin.dashboard.toursByCategoryDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.tourPackagesByCategory.slice(0, 5).map((category) => (
                      <div key={category.categoryId} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {category.categoryName}
                            </span>
                            <span className="text-sm text-gray-600">
                              {category.count}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
    style={{
      width: `${Math.min((category.count / stats.overview.totalTourPackages) * 100, 100)}%`
    }}
  ></div>
</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tours by Difficulty */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    {t('admin.dashboard.toursByDifficulty')}
                  </CardTitle>
                  <CardDescription>
                    {t('admin.dashboard.toursByDifficultyDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.tourPackagesByDifficulty.map((difficulty) => (
                      <div key={difficulty.difficulty} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={
                              difficulty.difficulty === 'easy' ? 'secondary' :
                              difficulty.difficulty === 'moderate' ? 'default' :
                              difficulty.difficulty === 'challenging' ? 'destructive' : 'outline'
                            }
                          >
                            {t(`admin.difficulty.${difficulty.difficulty}`)}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {difficulty.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tours */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-blue-600" />
                      {t('admin.dashboard.recentTours')}
                    </CardTitle>
                    <CardDescription>
                      {t('admin.dashboard.recentToursDesc')}
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/tours">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('admin.dashboard.viewAll')}
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentTourPackages.map((tour) => (
                    <div key={tour._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{tour.name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {tour.location}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {tour.category.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          ¥{tour.price.toLocaleString()}
                        </span>
                        <p className="text-xs text-gray-500">
                          {new Date(tour.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;