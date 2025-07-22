"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// --- SHADCN/UI & OTHER COMPONENT IMPORTS ---
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

// --- FILEPOND IMPORTS ---
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

// --- TOUR SPECIFIC OPTIONS ---
const DIFFICULTY_OPTIONS = [
  "easy",
  "moderate", 
  "challenging",
  "extreme"
];


interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

// --- ZOD VALIDATION SCHEMA ---
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
  photos: z.array(z.instanceof(File)).min(1, { message: "At least one tour photo is required." }),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type TourFormData = z.infer<typeof formSchema>;

// --- API CALL FUNCTION ---
const createTourAPI = async (
  formData: FormData
): Promise<{ success: boolean; tour?: any; message?: string }> => {
  console.log("API CALL (POST): /api/tour-packages...");
  try {
    const response = await fetch("/api/tour-packages", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok)
      return {
        success: false,
        message: data.message || `Error: ${response.status}`,
      };
    return {
      success: true,
      tour: data,
      message: "Tour created successfully!",
    };
  } catch (error) {
    console.error("createTourAPI error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
};

// --- MAIN COMPONENT ---
const NewTourPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const form = useForm<TourFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      category: "",
      location: "",
      duration: 1,
      price: 0,
      discountedPrice: 0,
      currency: "JPY",
      maxGroupSize: 1,
      difficulty: "moderate",
      photos: [],
      isActive: true,
      isFeatured: false,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
  } = form;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories?isActive=true');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const onInvalid = (errors: any) => {
    console.error("Form validation failed:", errors);
    const errorFields = Object.keys(errors)
      .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(", ");
    alert(
      `Please fix the errors before submitting.\n\nCheck the following fields: ${errorFields}`
    );
  };

  const onSubmit: SubmitHandler<TourFormData> = async (submittedData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    if (!user) {
      setSubmitMessage({ type: "error", text: "Authentication error. Please log in." });
      setIsSubmitting(false);
      return;
    }

    const formDataToSubmit = new FormData();

    // Handle regular fields
    Object.entries(submittedData).forEach(([key, value]) => {
      const K = key as keyof TourFormData;
      if (K === "photos") return;
      
      // Handle array fields
      if (Array.isArray(value)) {
        formDataToSubmit.append(K, JSON.stringify(value || []));
      } else if (value !== undefined && value !== null && value !== "") {
        formDataToSubmit.append(K, String(value));
      }
    });

    // Handle tour photos
    if (submittedData.photos && submittedData.photos.length > 0) {
      submittedData.photos.forEach((file) => formDataToSubmit.append("photos", file));
    }

    // DEBUG: Log what we're sending
    console.log("=== FORM DATA DEBUG ===");
    for (const [key, value] of formDataToSubmit.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    const response = await createTourAPI(formDataToSubmit);
    if (response.success) {
      setSubmitMessage({ type: "success", text: response.message || "Tour created successfully!" });
      reset();
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/tours");
      }, 2000);
    } else {
      setSubmitMessage({ type: "error", text: response.message || "Failed to create tour." });
    }
    setIsSubmitting(false);
  };

  const sectionCardClassName = "bg-white shadow-md rounded-xl p-6";
  const sectionTitleClassName = "text-xl font-semibold text-gray-900 mb-1";
  const sectionDescriptionClassName = "text-sm text-gray-600 mb-6";

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
        
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Tour Package
        </h1>
        <div className="text-md text-gray-600 mt-1">
          <p>
            Add a new tour package to your catalog with detailed information and beautiful photos.
          </p>
        </div>
      </header>

      {submitMessage && (
        <div
          className={`mb-6 p-4 rounded-md ${
            submitMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-8"
        >
          {/* Tour Overview */}
          <div className={sectionCardClassName}>
            <h2 className={sectionTitleClassName}>Tour Overview</h2>
            <div className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tour Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Amazing Tokyo Cultural Experience"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief summary for listings..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the tour experience..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tour Details */}
          <div className={sectionCardClassName}>
            <h2 className={sectionTitleClassName}>Tour Details</h2>
            <p className={sectionDescriptionClassName}>
              Specify the tour logistics and pricing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={categoriesLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={categoriesLoading ? "Loading..." : "-- Select Category --"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Tokyo, Japan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Select Difficulty --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="maxGroupSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Group Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (¥ JPY)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 25000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6">
              <FormField
                control={control}
                name="discountedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discounted Price (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 20000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tour Photos */}
          <div className={sectionCardClassName}>
            <h2 className={sectionTitleClassName}>Tour Photos</h2>
            <FormField
              control={control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Photos (Required)</FormLabel>
                  <FormDescription>
                    Upload high-quality photos of your tour. JPG, PNG, WEBP accepted. Max 5MB each.
                  </FormDescription>
                  <FormControl>
                    <FilePond
                      files={field.value as File[]}
                      onupdatefiles={(fileItems) =>
                        field.onChange(
                          fileItems.map((item) => item.file as File)
                        )
                      }
                      allowMultiple={true}
                      maxFiles={15}
                      name="photos"
                      labelIdle={`Drag & Drop your photos or <span class="filepond--label-action">Browse</span>`}
                      allowImagePreview={true}
                      imagePreviewHeight={160}
                      acceptedFileTypes={[
                        "image/png",
                        "image/jpeg",
                        "image/webp",
                      ]}
                      allowFileSizeValidation={true}
                      maxFileSize="5MB"
                      credits={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tour Settings */}
          <div className={sectionCardClassName}>
            <h2 className={sectionTitleClassName}>Tour Settings</h2>
            <div className="space-y-4">
              <FormField
                control={control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Make this tour active and visible to customers
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Feature this tour (show in featured sections)
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submission */}
          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating Tour..." : "Create Tour Package"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewTourPage;