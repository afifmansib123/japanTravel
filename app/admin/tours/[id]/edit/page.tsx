// app/admin/tours/edit/[id]/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// --- COMPONENT IMPORTS (Shadcn/UI, etc.) ---
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// --- ZOD VALIDATION SCHEMA (This should match your create page) ---
const formSchema = z.object({
  name: z.string().min(5, { message: "Tour name must be at least 5 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  shortDescription: z.string().optional(),
  category: z.string({ required_error: "Please select a category." }).min(1, "Category is required."),
  location: z.string().min(2, { message: "Location is required." }),
  duration: z.coerce.number({ required_error: "Duration is required." }).positive("Duration must be a positive number."),
  price: z.coerce.number({ required_error: "Price is required." }).positive("Price must be a positive number."),
  discountedPrice: z.coerce.number().optional().nullable(),
  currency: z.string().default("JPY"),
  maxGroupSize: z.coerce.number({ required_error: "Max group size is required." }).positive("Max group size must be a positive number."),
  difficulty: z.enum(["easy", "moderate", "challenging", "extreme"]),
  // Note: We won't handle file re-uploads in this basic version for simplicity.
  // We will pass existing image URLs.
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type TourFormData = z.infer<typeof formSchema>;

interface Category {
  _id: string;
  name: string;
}

// --- MAIN COMPONENT ---
const EditTourPage = () => {
  const params = useParams();
  const tourId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<TourFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Form will be populated by useEffect
    },
  });
  
  // --- DATA FETCHING AND FORM POPULATION ---
  useEffect(() => {
    if (!tourId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories and the specific tour in parallel
        const [categoriesResponse, tourResponse] = await Promise.all([
          fetch('/api/categories?isActive=true'),
          fetch(`/api/tour-packages/${tourId}`)
        ]);

        if (!categoriesResponse.ok || !tourResponse.ok) {
          throw new Error('Failed to fetch initial data.');
        }

        const categoriesData = await categoriesResponse.json();
        const tourData = await tourResponse.json();

        setCategories(categoriesData.categories || []);

        // Populate the form with the fetched tour data
        form.reset({
          name: tourData.name,
          description: tourData.description,
          shortDescription: tourData.shortDescription || "",
          category: tourData.category,
          location: tourData.location,
          duration: tourData.duration,
          price: tourData.price,
          discountedPrice: tourData.discountedPrice || null,
          currency: tourData.currency,
          maxGroupSize: tourData.maxGroupSize,
          difficulty: tourData.difficulty,
          isActive: tourData.isActive,
          isFeatured: tourData.isFeatured,
        });

      } catch (error) {
        console.error("Failed to fetch tour data:", error);
        toast.error("Failed to load tour data. Please try again.");
        router.push("/admin/tours");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tourId, form, router]);


  // --- FORM SUBMISSION HANDLER ---
  const onSubmit: SubmitHandler<TourFormData> = async (submittedData) => {
    setIsSubmitting(true);
    
    // We are not handling file uploads here, so we send JSON
    try {
      const response = await fetch(`/api/tour-packages/${tourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update tour.');
      }

      toast.success("Tour updated successfully!");
      router.push("/admin/tours"); // Redirect back to the tours list
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading tour details...</div>;
  }

  // --- JSX (almost identical to your create page) ---
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button asChild variant="outline">
            <Link href="/admin/tours">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tours
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Tour Package</h1>
        <p className="text-md text-gray-600 mt-1">Update the details for this tour package.</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Tour Overview Section */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tour Overview</h2>
            <div className="space-y-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Tour Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="shortDescription" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Short Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Full Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>

          {/* Tour Details Section */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tour Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField name="category" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="-- Select Category --" /></SelectTrigger></FormControl>
                    <SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField name="location" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="difficulty" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="-- Select Difficulty --" /></SelectTrigger></FormControl>
                    <SelectContent>{['easy', 'moderate', 'challenging', 'extreme'].map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField name="duration" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Duration (Days)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="maxGroupSize" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Max Group Size</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="price" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Price ({form.getValues('currency')})</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="discountedPrice" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discounted Price (Optional)</FormLabel>
                    <FormControl>
                        <Input 
                            type="number"
                            placeholder="e.g., 20000"
                            // Important: Convert null/undefined to an empty string for the input
                            value={field.value ?? ''} 
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
             )} />
            </div>
          </div>
          
          {/* Settings Section */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-4">
              <FormField name="isActive" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal">Make this tour active</FormLabel>
                </FormItem>
              )} />
              <FormField name="isFeatured" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal">Feature this tour</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditTourPage;