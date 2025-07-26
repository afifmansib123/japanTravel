import Booking from './Booking';
import TourPackage from './TourPackage';
import Category from './Category';
import User from './User';

// Export all models to ensure they're registered
export {
  Booking,
  TourPackage,
  Category,
  User
};

// Function to ensure all models are registered
export function ensureModelsRegistered() {
  console.log('📋 Ensuring all models are registered...');
  
  // Access each model to trigger registration
  try {
    Booking.collection;
    TourPackage.collection;
    Category.collection;
    User.collection;
    
    console.log('✅ All models registered successfully');
    return true;
  } catch (error) {
    console.error('❌ Error registering models:', error);
    return false;
  }
}