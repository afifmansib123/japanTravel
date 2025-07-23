import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  _id: string;
  cognitoId: string; // Changed from userId to cognitoId
  tourId: mongoose.Types.ObjectId;
  bookingDate: Date;
  timeSlotIndex: number;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  cognitoId: { // Changed from userId
    type: String,
    required: true
  },
  tourId: {
    type: Schema.Types.ObjectId,
    ref: 'TourPackage',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlotIndex: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  stripeSessionId: String,
  stripePaymentIntentId: String,
}, {
  timestamps: true
});

// Updated index
bookingSchema.index({ 
  tourId: 1, 
  bookingDate: 1, 
  timeSlotIndex: 1, 
  status: 1 
});

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;