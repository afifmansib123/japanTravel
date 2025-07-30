import { Users, Award, Globe, Heart } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Happy Travelers', value: '50,000+' },
    { icon: Globe, label: 'Destinations', value: '120+' },
    { icon: Award, label: 'Awards Won', value: '25+' },
    { icon: Heart, label: 'Years Experience', value: '15+' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Passionate traveler with 20 years in the tourism industry'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Operations',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Expert in logistics and sustainable tourism practices'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Cultural Experience Director',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Specialist in authentic cultural immersion experiences'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1200)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About glowetsu</h1>
            <p className="text-xl md:text-2xl">
              Creating unforgettable memories through authentic travel experiences since 2008
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index}>
                  <IconComponent className="h-12 w-12 mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2008 by a group of passionate travelers,glowetsu was born 
                  from a simple belief: travel should transform lives, not just provide vacations.
                </p>
                <p>
                  We started as a small team organizing adventure trips for friends and family. 
                  Word spread quickly about our attention to detail, authentic experiences, and 
                  commitment to sustainable tourism.
                </p>
                <p>
                  Today, we're proud to have guided over 50,000 travelers to more than 120 destinations 
                  worldwide, while maintaining our core values of authenticity, sustainability, and 
                  creating meaningful connections between travelers and local communities.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Travel adventure"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Mission & Values</h2>
            <p className="text-xl text-gray-600">What drives us every day</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Authentic Experiences</h3>
              <p className="text-gray-600">
                We believe in showcasing the real essence of each destination through 
                genuine cultural exchanges and off-the-beaten-path adventures.
              </p>
            </div>
            <div className="text-center">
              <Heart className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Sustainable Tourism</h3>
              <p className="text-gray-600">
                Our tours are designed to benefit local communities while preserving 
                the natural and cultural heritage of destinations for future generations.
              </p>
            </div>
            <div className="text-center">
              <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Excellence in Service</h3>
              <p className="text-gray-600">
                From planning to execution, we maintain the highest standards of service 
                to ensure every moment of your journey exceeds expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The passionate people behind your adventures</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8">
            Join thousands of travelers who have discovered the world with us
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a
              href="/tours"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Tours
            </a>
            <a
              href="/contact"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}