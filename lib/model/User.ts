// lib/models/User.ts - Simple User Model
import mongoose from 'mongoose';

// User interface for TypeScript
export interface IUser {
  _id?: string;
  cognitoId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose schema
const userSchema = new mongoose.Schema({
  cognitoId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
});

// Export the model
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;