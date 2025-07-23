Tour Booking System - Project Documentation
Overview
We have built a comprehensive tour booking system with Stripe payment integration, real-time availability checking, and booking management for both customers and administrators.
System Architecture
Authentication

User Types: Users (role: "user") and Admins (role: "admin")
Authentication Method: AWS Cognito integration via AuthContext
User Identification: Each user has a unique cognitoId and userId

Database Models
TourPackage Model

Location: lib/model/TourPackage.ts
Key Fields:

Basic info: name, description, location, price, currency (JPY)
Time Management:

timeSlotType: 'hourly', 'daily', or 'custom'
timeSlots: Array of time slots with startTime, endTime, maxCapacity
operatingDays: Array of weekdays when tour operates
advanceBookingDays: How many days in advance booking required


Media: images array (stored in S3)
Business logic: isActive, isFeatured, difficulty levels



Booking Model

Location: lib/model/Booking.ts
Key Fields:

User identification: cognitoId
Tour reference: tourId (populated with TourPackage)
Booking details: bookingDate, timeSlotIndex, quantity
Payment: totalPrice, stripeSessionId, stripePaymentIntentId
Status: 'pending', 'confirmed', 'cancelled', 'completed'
Auto-expiry: expiresAt field with MongoDB TTL index (30 minutes for unpaid bookings)



Core Features
1. Tour Management (Admin)

Create Tours: Full tour creation form with image upload to S3
Time Slot Configuration: Flexible time slot system supporting hourly/daily tours
Availability Management: Set operating days and advance booking requirements

2. Customer Booking Flow

Tour Discovery: Browse tours with filtering and search
Date/Time Selection: Calendar interface with real-time availability checking
Cart System: Multiple bookings with date/time details
Payment Processing: Stripe checkout integration

3. Payment Integration

Stripe Setup: Both test and live keys configured
Checkout Flow: Redirects to Stripe hosted checkout
Webhook Handling: Confirms bookings after successful payment
Currency: Japanese Yen (¥) with proper formatting

4. Availability System

Real-time Checking: API endpoint checks booked slots per date
Booking Logic: One booking per time slot (binary availability)
Visual Feedback: Shows "Available" or "Fully Booked" status
Temporary Reservations: 30-minute holds during payment process

API Endpoints
Tour Management

GET/POST /api/tour-packages - CRUD operations for tours
GET/PUT/DELETE /api/tour-packages/[id] - Individual tour operations
GET /api/tours/[id]/availability?date=YYYY-MM-DD - Check availability for specific date

Booking Management

POST /api/checkout - Create Stripe session and temporary bookings
POST /api/webhooks/stripe - Handle successful payments
GET /api/bookings - Fetch all bookings (filtered on frontend)
GET /api/bookings/session/[sessionId] - Get bookings by Stripe session

Categories

GET /api/categories - Fetch tour categories

User Interfaces
Customer-Facing Pages

Tour Listing: Browse all available tours
Tour Details: Individual tour page with booking modal
Cart: Review selections with date/time details
Booking Success: Confirmation page after payment
My Bookings: User's booking history with status tracking

Admin Pages

Tour Creation: Comprehensive form for adding new tours
Admin Orders: List view of all customer bookings
Calendar View: Date-based booking overview for administrators

Key Technical Implementations
Time Slot System

Flexible Configuration: Supports different business models (hourly activities, daily tours)
Capacity Management: Each slot has individual capacity settings
Availability Logic: Binary system - one booking makes slot unavailable

Payment Flow

User selects date/time → Creates temporary booking (30min expiry)
Redirects to Stripe → Processes payment
Webhook confirms → Updates booking status to 'confirmed'
Removes expiry → Permanent booking created

Data Flow

Frontend: React with TypeScript, Tailwind CSS
Backend: Next.js API routes
Database: MongoDB with Mongoose ODM
File Storage: AWS S3 for tour images
Payments: Stripe with webhook confirmation

Security & Authentication

Role-based Access: Different interfaces for users vs admins
Payment Security: Stripe handles all payment processing
Data Validation: Zod schemas for form validation
Environment Variables: Separate test/production configurations

Configuration Files

Environment Variables: Stripe keys, AWS credentials, MongoDB URI
Next.js Configuration: API routes and middleware setup
Database Connection: Centralized in lib/db.ts
Stripe Configuration: Webhook endpoints and event handling

Current Status
The system is fully functional with:

✅ Complete booking flow from selection to payment
✅ Real-time availability checking
✅ Admin and user interfaces
✅ Automated booking confirmation via webhooks
✅ Comprehensive booking management

Areas for Future Enhancement

Email notifications for booking confirmations
SMS reminders for upcoming tours
Advanced reporting for administrators
Multi-language support expansion
Mobile app development