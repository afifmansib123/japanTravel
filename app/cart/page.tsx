"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, CreditCard } from "lucide-react";
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
    const cognitoId = user.cognitoId || user.id || user._id || user.userId;
    
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("cart.empty.title")}
          </h2>
          <p className="text-gray-600 mb-8">{t("cart.empty.subtitle")}</p>
          <Button asChild size="lg">
            <Link href="/tours">{t("cart.empty.browse")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t("cart.title")}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-600">
                          ¥{item.price} {t("common.perPerson")}
                        </p>
                        {item.bookingDate && (
                          <p className="text-sm text-blue-600">
                            📅 {new Date(item.bookingDate).toLocaleDateString()}
                          </p>
                        )}
                        {item.timeSlot && (
                          <p className="text-sm text-blue-600">
                            🕒 {item.timeSlot}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ¥{item.price * item.quantity}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Total Bookings:{" "}
                    <span className="font-semibold">{items.length}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total People:{" "}
                    <span className="font-semibold">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </p>
                  {items.some((item) => item.bookingDate) && (
                    <p className="text-sm text-gray-600">
                      Booking Dates:{" "}
                      <span className="font-semibold">
                        {Array.from(
                          new Set(
                            items
                              .map((item) => item.bookingDate)
                              .filter(Boolean)
                          )
                        )
                          .map((date) => new Date(date!).toLocaleDateString())
                          .join(", ")}
                      </span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("cart.summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>{t("cart.subtotal")}</span>
                  <span>¥{total}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("cart.serviceFee")}</span>
                  <span>¥99</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("cart.taxes")}</span>
                  <span>¥{Math.round((total + 99) * 0.1)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t("cart.total")}</span>
                    <span>¥{total + 99 + Math.round((total + 99) * 0.1)}</span>
                  </div>
                </div>

                {user ? (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isProcessing ? t("cart.processing") : t("cart.checkout")}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 text-center">
                      {t("cart.signin.required")}
                    </p>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/auth/signin">{t("nav.signin")}</Link>
                    </Button>
                  </div>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/tours">{t("cart.continue")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
