import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Wand2, ShoppingBag, Zap, Users, TrendingUp, Star } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Wand2,
      title: 'AI-Powered- Content Generation',
      description: 'Generate compelling product descriptions, titles, and features using advanced AI technology.',
    },
    {
      icon: Zap,
      title: 'Real-time Streaming',
      description: 'Watch your content being generated in real-time with our streaming AI interface.',
    },
    {
      icon: ShoppingBag,
      title: 'Marketplace Integration',
      description: 'Seamlessly publish your products to our integrated marketplace platform.',
    },
    {
      icon: Users,
      title: 'Seller Dashboard',
      description: 'Manage all your products, analytics, and settings from one central dashboard.',
    },
  ];

  const stats = [
    { label: 'Products Created', value: '10,000+' },
    { label: 'Active Sellers', value: '2,500+' },
    { label: 'AI Generations', value: '50,000+' },
    { label: 'Success Rate', value: '98%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered
              <span className="text-blue-600"> Marketplace</span>
              <br />
              Assistant
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create stunning product pages in minutes with our AI assistant. 
              Generate content, optimize for SEO, and publish to your marketplace 
              with just a few clicks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button size="lg" className="w-full sm:w-auto">
                  <Wand2 className="mr-2" size={20} />
                  Start Creating
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <ShoppingBag className="mr-2" size={20} />
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to create, 
              optimize, and sell your products online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your product listings?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who are already using AI to create 
            better product pages and increase their sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Wand2 className="mr-2" size={20} />
                Get Started Free
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What our users say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'E-commerce Seller',
                content: 'This AI assistant has revolutionized how I create product listings. What used to take hours now takes minutes!',
                rating: 5,
              },
              {
                name: 'Mike Chen',
                role: 'Small Business Owner',
                content: 'The SEO optimization features have significantly improved my product visibility. Sales are up 40%!',
                rating: 5,
              },
              {
                name: 'Emily Rodriguez',
                role: 'Digital Marketer',
                content: 'The streaming AI generation is amazing to watch. The quality of content is consistently excellent.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}