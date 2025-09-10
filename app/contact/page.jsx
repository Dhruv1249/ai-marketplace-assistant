'use client';
import React, { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import TryOutPlatform from '@/components/animated icon/TryOutPlatform';
import SocalsIcons from '@/components/animated icon/SocalsIcons';

export default function Contact() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help from our support team',
      contact: 'support@aimarketplace.com',
      availability: '24/7 response within 2 hours',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team',
      contact: '+1 (555) 123-4567',
      availability: 'Mon-Fri, 9AM-6PM EST',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant help when you need it',
      contact: 'Available in app',
      availability: 'Mon-Fri, 9AM-9PM EST',
    },
  ];

  const faqs = [
    {
      question: 'How does the AI content generation work?',
      answer: 'Our AI uses advanced language models to analyze your product description and generate optimized content including titles, descriptions, features, and SEO keywords.',
    },
    {
      question: 'Is there a limit to how many products I can create?',
      answer: 'Free accounts can create up to 10 products per month. Premium plans offer unlimited product creation.',
    },
    {
      question: 'Can I edit the AI-generated content?',
      answer: 'Absolutely! All AI-generated content is fully editable. You can modify titles, descriptions, features, and any other content before publishing.',
    },
    {
      question: 'How accurate is the SEO optimization?',
      answer: 'Our SEO optimization is based on current best practices and is continuously updated. However, we recommend reviewing and customizing keywords for your specific market.',
    },
  ];

  const heroRef = useRef(null);
  const methodsRef = useRef(null);
  const formRef = useRef(null);
  const faqRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    let timeout = null;
    // Clean previous triggers (before rendering new ones)
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    gsap.globalTimeline.clear();

    timeout = setTimeout(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll('.contact-anim'), {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.16,
        });
      }
      if (methodsRef.current) {
        gsap.from(methodsRef.current.querySelectorAll('.contact-card'), {
          scrollTrigger: {
            trigger: methodsRef.current,
            start: 'top 82%'
          },
          y: 70,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.22,
        });
      }
      if (formRef.current) {
        gsap.from(formRef.current.querySelectorAll('.contact-form-anim'), {
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 85%',
          },
          y: 54,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          stagger: 0.22,
        });
      }
      if (faqRef.current) {
        gsap.from(faqRef.current.querySelectorAll('.faq-card'), {
          scrollTrigger: {
            trigger: faqRef.current,
            start: 'top 88%',
          },
          y: 36,
          opacity: 0,
          duration: 0.92,
          ease: 'power3.out',
          stagger: 0.11,
        });
      }
      ScrollTrigger.refresh();
    }, 100); // 100ms delay to ensure DOM/hydration

    // Cleanup
    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.globalTimeline.clear();
    };
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="bg-gradient-to-r from-indigo-200 to-purple-300 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="contact-anim text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="contact-anim text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Have questions about our AI marketplace assistant? We're here to help! 
              Reach out to our team for support, feedback, or partnership opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div ref={methodsRef} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="contact-anim text-3xl font-bold text-gray-900 mb-4">
              How can we help you?
            </h2>
            <p className="contact-anim text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the best way to reach us based on your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="contact-card bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {method.description}
                  </p>
                  <p className="font-medium text-blue-600 mb-2">
                    {method.contact}
                  </p>
                  <p className="text-sm text-gray-500">
                    {method.availability}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div ref={formRef} className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="contact-form-anim bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    required
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Feature Request</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-indigo-200 to-purple-300 text-gray-800 border-0 shadow-none hover:from-indigo-300 hover:to-purple-400">
                  <Send className="mr-2" size={16} />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Company Info */}
            <div className="contact-form-anim space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Company Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        123 Innovation Drive<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Business Hours</p>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                        Saturday: 10:00 AM - 4:00 PM EST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link href="/create" className="block text-blue-600 hover:text-blue-800">
                    → Start Creating Products
                  </Link>
                  <Link href="/marketplace" className="block text-blue-600 hover:text-blue-800">
                    → Browse Marketplace
                  </Link>
                  <Link href="/about" className="block text-blue-600 hover:text-blue-800">
                    → Learn About Us
                  </Link>
                </div>
              </div>
              {/* Socials */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Socials
                </h3>
                <SocalsIcons />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div ref={faqRef} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="contact-anim text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="contact-anim text-xl text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for?
            </p>
            <Link href="/create">
              <TryOutPlatform>
                
              </TryOutPlatform>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
