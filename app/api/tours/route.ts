import { NextResponse } from 'next/server';

const demoTours = [
  {
    id: 1,
    name: 'Tropical Paradise Escape',
    description: 'Luxury overwater bungalows and pristine beaches in the Maldives',
    price: 2499,
    duration: '7 Days',
    location: 'Maldives',
    category: 'beach',
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['All-inclusive', 'Overwater villa', 'Spa included', 'Snorkeling']
  },
  {
    id: 2,
    name: 'Himalayan Adventure Trek',
    description: 'Epic mountain trekking with experienced guides through Nepal',
    price: 1899,
    duration: '14 Days',
    location: 'Nepal Himalayas',
    category: 'adventure',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Expert guides', 'Tea house stays', 'Permits included', 'Equipment rental']
  },
  {
    id: 3,
    name: 'European Cultural Journey',
    description: 'Explore historic cities and world-class cuisine across Italy and France',
    price: 3299,
    duration: '10 Days',
    location: 'Italy & France',
    category: 'cultural',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Museum passes', 'Local guides', 'Cooking classes', 'Wine tasting']
  },
  {
    id: 4,
    name: 'African Safari Adventure',
    description: 'Wildlife viewing and luxury lodge accommodations in Kenya',
    price: 4199,
    duration: '12 Days',
    location: 'Kenya',
    category: 'adventure',
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1963622/pexels-photo-1963622.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Game drives', 'Luxury lodges', 'Photography guide', 'Conservation visit']
  },
  {
    id: 5,
    name: 'Swiss Alps Retreat',
    description: 'Mountain villages, alpine lakes, and scenic railway journeys',
    price: 2899,
    duration: '8 Days',
    location: 'Switzerland',
    category: 'mountain',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Scenic trains', 'Cable car rides', 'Mountain hotels', 'Hiking trails']
  },
  {
    id: 6,
    name: 'Tokyo City Explorer',
    description: 'Modern metropolis meets traditional culture in Japan',
    price: 2699,
    duration: '9 Days',
    location: 'Tokyo, Japan',
    category: 'city',
    rating: 4.6,
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['City tours', 'Temple visits', 'Food experiences', 'Cultural workshops']
  }
];

export async function GET() {
  return NextResponse.json(demoTours);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // In a real app, save to database
  const newTour = {
    id: Date.now(),
    ...body,
    rating: 4.5
  };
  
  return NextResponse.json(newTour, { status: 201 });
}