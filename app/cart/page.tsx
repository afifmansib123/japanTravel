"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, CreditCard, ShoppingBag, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useLanguage();

const handleCheckout = async () => {
  if (!user) {
    toast.error(t('cart.signin.required'));
    router.push('/auth/signin');
    return;
  }

  // Debug log
  console.log('User object in checkout:', user);

  if (items.length === 0) {
    toast.error(t('cart.empty.title'));
    return;
  }

  setIsProcessing(true);
  
  try {
    // Try different possible field names for cognitoId
    // Cast user as any to bypass type checking:
const cognitoId = (user as any).cognitoId || (user as any).id || (user as any)._id || (user as any).userId;
    
    if (!cognitoId) {
      console.error('No cognitoId found in user object:', user);
      throw new Error('User identification missing');
    }

    console.log('Using cognitoId:', cognitoId);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        items,
        cognitoId
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Checkout API error:', data);
      throw new Error(data.error || 'Checkout failed');
    }

    // Redirect to Stripe
    const stripe = await import('@stripe/stripe-js').then(mod => 
      mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    );
    
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    }
    
  } catch (error: any) {
    console.error('Checkout error:', error);
    toast.error(error.message || 'Checkout failed');
  } finally {
    setIsProcessing(false);
  }
};

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">0</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            {t("cart.empty.title")}
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">{t("cart.empty.subtitle")}</p>
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Link href="/tours" className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("cart.empty.browse")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t("cart.title")}
                </h1>
                <p className="text-gray-600 text-sm">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
              </div>
            </div>
            <Link href="/tours" className="text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative overflow-hidden w-32 h-32 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                            {item.name}
                          </h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600">
                              <span className="text-2xl font-bold text-blue-600">¥{item.price}</span>
                              <span className="ml-2 text-sm">{t("common.perPerson")}</span>
                            </div>
                            
                            {(item as any).bookingDate && (
                              <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date((item as any).bookingDate).toLocaleDateString()}
                              </div>
                            )}
                            
                            {(item as any).timeSlot && (
                              <div className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                                <Clock className="w-3 h-3 mr-1" />
                                {(item as any).timeSlot}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-50 rounded-lg p-1 border">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 p-0 hover:bg-white"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center border-0 bg-transparent font-semibold"
                              min="1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0 hover:bg-white"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Price and Remove */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 mb-2">
                              ¥{item.price * item.quantity}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Booking Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-blue-900">
                  <Users className="w-5 h-5 mr-2" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-blue-600">{items.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total People</p>
                    <p className="text-2xl font-bold text-green-600">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                </div>
                
                {items.some((item) => (item as any).bookingDate) && (
                  <div className="mt-4 bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Booking Dates</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set(
                          items
                            .map((item) => (item as any).bookingDate)
                            .filter(Boolean)
                        )
                      ).map((date, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {new Date(date!).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="text-xl text-gray-900">{t("cart.summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t("cart.subtotal")}</span>
                    <span className="font-semibold text-lg">¥{total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t("cart.serviceFee")}</span>
                    <span className="font-semibold text-green-600">¥0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t("cart.taxes")}</span>
                    <span className="font-semibold">¥{Math.round(total * 0.01)}</span>
                  </div>
                  
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">{t("cart.total")}</span>
                      <span className="text-2xl font-bold text-blue-600">¥{total + Math.round(total * 0.01)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {user ? (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t("cart.processing")}
                        </div>
                      ) : (
                        t("cart.checkout")
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-yellow-800 font-medium">
                          {t("cart.signin.required")}
                        </p>
                      </div>
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                        size="lg"
                      >
                        <Link href="/auth/signin">{t("nav.signin")}</Link>
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200" 
                    asChild
                  >
                    <Link href="/tours" className="flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t("cart.continue")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}