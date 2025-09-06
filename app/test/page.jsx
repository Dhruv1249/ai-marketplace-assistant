'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Settings, RotateCcw, Save } from 'lucide-react';
import UniversalPreviewPage from '@/components/shared/UniversalPreviewPage';

// Import templates (same as seller-info page)
import journeyTemplate from '@/components/seller-info/templates/journey-template.json';
import craftTemplate from '@/components/seller-info/templates/craft-template.json';
import impactTemplate from '@/components/seller-info/templates/impact-template.json';
import modernTemplate from '@/components/seller-info/templates/modern-template.json';

const TEMPLATE_MAP = {
  'journey': journeyTemplate,
  'craft': craftTemplate,
  'impact': impactTemplate,
  'modern': modernTemplate,
};

// Sample test data with actual product story structure (600 char limits from seller-info)
const SAMPLE_DATA = {
  basics: {
    name: 'Revolutionary Smart Home Security ',
    category: 'Smart Home Security & Automation Technology with Advanced AI Integration and Cloud-Based Monitoring Solutions for Modern Residential Properties',
    problem: 'Traditional home security systems are outdated, unreliable, and provide false alarms that waste time and resources. Homeowners struggle with complex installations, expensive monthly fees, and systems that fail when they need them most. Current solutions lack intelligent threat detection, provide poor mobile integration, and offer limited customization options. Many systems are vulnerable to hacking, have poor battery life, and require professional installation that costs thousands of dollars. The result is inadequate protection that leaves families feeling unsafe and frustrated with their security investment.',
    audience: 'Tech-savvy homeowners aged 25-55 who value security, convenience, and smart home integration. Primary targets include young families with children, remote workers who need reliable home monitoring, busy professionals who travel frequently, and early adopters of smart home technology. Secondary audiences include elderly homeowners seeking peace of mind, renters looking for portable security solutions, and small business owners who need affordable commercial-grade security. These customers typically have household incomes of $50,000+ and are comfortable with technology.',
    value: 'Our AI-powered security system provides military-grade protection with consumer-friendly simplicity. Unlike traditional systems, we offer intelligent threat detection that learns your family\'s patterns and eliminates false alarms. Installation takes 15 minutes with no drilling or wiring required. Our system costs 70% less than competitors while providing superior protection through advanced machine learning algorithms. Features include instant mobile alerts, two-way communication, cloud storage, smart home integration, and 24/7 professional monitoring. The system pays for itself by preventing break-ins and reducing insurance premiums.'
  },
  story: {
    origin: 'The idea was born when our founder\'s home was burglarized while his family was on vacation. Despite having a traditional security system, the burglars disabled it within minutes and stole irreplaceable family heirlooms. This traumatic experience revealed the fundamental flaws in existing security technology. After months of research and development, working with former military security experts and AI engineers, we created a system that would have prevented that break-in. Our mission became clear: make advanced security technology accessible to every family, not just the wealthy.',
    solution: 'We developed a revolutionary approach combining artificial intelligence, advanced sensors, and cloud computing to create the smartest security system ever built. Our proprietary AI algorithms learn your family\'s daily routines and can distinguish between normal activity and genuine threats. The system uses military-grade encryption, multiple communication channels, and redundant power sources to ensure it never fails when you need it most. Professional monitoring is included at no extra cost, and our mobile app provides complete control from anywhere in the world.',
    unique: 'What sets us apart is our breakthrough AI technology that virtually eliminates false alarms while detecting threats other systems miss. Our patented sensor fusion technology combines multiple detection methods for unprecedented accuracy. Unlike competitors, we offer lifetime hardware warranties, free software updates, and no long-term contracts. Our system is the only one that can differentiate between family members, pets, and intruders using advanced biometric analysis. Installation is tool-free and takes minutes, not hours.',
    vision: 'We envision a world where every family feels completely secure in their home, where advanced security technology is affordable and accessible to everyone, not just the wealthy. Our goal is to eliminate home break-ins through intelligent prevention and rapid response. We\'re building the foundation for smart cities where interconnected security systems create safer communities. By 2030, we aim to protect over 10 million homes worldwide and reduce residential crime by 50% in the communities we serve.'
  },
  process: {
    creation: 'Our development process combines cutting-edge AI research with rigorous real-world testing. Each system undergoes 500+ hours of testing in our state-of-the-art facility, simulating every possible scenario from power outages to cyber attacks. We work with former military security experts, ethical hackers, and AI researchers from top universities. Every component is manufactured to military specifications and tested for extreme weather conditions. Our software is continuously updated based on data from millions of installations worldwide.',
    materials: 'We use only premium materials including aircraft-grade aluminum housings, military-spec sensors, and enterprise-grade processors. Our cameras feature Sony CMOS sensors with night vision capabilities, while our communication modules use cellular, WiFi, and satellite backup systems. All components are weatherproof to IP67 standards and designed to operate in temperatures from -40°F to 140°F. Our batteries are lithium-ion with 5-year lifespans, and all electronics are protected against electromagnetic interference.',
    time: 'Each system represents over 50,000 hours of research and development by our team of 30+ engineers and security experts. From initial concept to market launch took 3 years of intensive development and testing. Manufacturing each unit requires 40+ precision assembly steps performed by certified technicians. Quality control testing adds another 8 hours per unit. Our AI algorithms are trained on datasets containing millions of security events, requiring months of computational processing on supercomputer clusters.',
    quality: 'We maintain the highest quality standards in the industry with ISO 9001 certification and FCC compliance for all electronic components. Every unit undergoes 72-hour burn-in testing and comprehensive quality assurance checks. Our manufacturing facility is certified to automotive industry standards, ensuring consistent quality and reliability. We maintain less than 0.1% defect rates and offer lifetime warranties on all hardware components. Third-party security audits are conducted quarterly to ensure our systems meet bank-level security standards.',
    ethics: 'We\'re committed to sustainable manufacturing using recycled materials wherever possible and carbon-neutral shipping. Our packaging is 100% recyclable, and we offer free recycling programs for old security equipment. We maintain strict privacy policies, never selling customer data and using end-to-end encryption for all communications. Our manufacturing partners are audited for fair labor practices, and we donate 1% of profits to community safety programs. All software is open-source auditable to ensure transparency and security.'
  },
  impact: {
    testimonials: [
      'This system saved my family from a break-in attempt. The AI detected suspicious activity and alerted police before the intruder even reached our door.',
      'Installation was incredibly easy, and the false alarm rate is virtually zero. Best security investment I\'ve ever made.',
      'The mobile app is intuitive and the customer service is outstanding. I feel completely secure when traveling for work.',
      'After 6 months, our insurance company reduced our premiums by 20% because of this system. It\'s already paying for itself.',
      'The customer support team is amazing. They helped me set up everything remotely and answered all my questions patiently.',
      'I love how the system learns our daily routines. No more false alarms when the dog moves around or when we come home late.',
      'The video quality is crystal clear, even at night. We caught a package thief and the footage was perfect for police.',
      'Setup took literally 10 minutes. No drilling, no wiring, just stick and connect. My elderly parents could install this.',
      'The monthly cost is so much lower than traditional systems, and the features are way more advanced. Great value.',
      'Peace of mind is priceless. This system gives us that and more. Highly recommend to anyone considering home security.'
    ],
    cases: [
      'Prevented 15,000+ break-in attempts in first year of operation across customer base',
      'Reduced false alarm rates by 95% compared to traditional systems in independent testing',
      'Helped police solve 200+ crimes through high-quality video evidence and rapid response',
      'Achieved 99.9% uptime reliability across all installations during severe weather events'
    ],
    metrics: [
      '50,000+ homes protected worldwide with 99.9% customer satisfaction rating',
      'Average response time of 12 seconds from threat detection to emergency services notification',
      '95% reduction in false alarms compared to traditional security systems',
      '$2.5M in prevented losses for customers based on insurance company data'
    ],
    awards: [
      'CES Innovation Award 2024 for Best Smart Home Security Solution',
      'Security Industry Association Product of the Year 2023',
      'TIME Magazine Best Inventions 2023 - Home Security Category',
      'Consumer Reports Top Pick for Smart Security Systems 2024'
    ]
  },
  visuals: {
    hero: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        alt: 'Smart security system main unit',
        type: 'uploaded',
        name: 'hero-image-1.jpg'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        alt: 'Security system in modern home',
        type: 'uploaded',
        name: 'hero-image-2.jpg'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
        alt: 'Mobile app interface',
        type: 'uploaded',
        name: 'hero-image-3.jpg'
      },
      {
        id: 4,
        url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        alt: 'Smart home control panel',
        type: 'uploaded',
        name: 'hero-image-4.jpg'
      },
      {
        id: 5,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        alt: 'Security camera close-up',
        type: 'uploaded',
        name: 'hero-image-5.jpg'
      },
      {
        id: 6,
        url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        alt: 'Smart home dashboard',
        type: 'uploaded',
        name: 'hero-image-6.jpg'
      },
      {
        id: 7,
        url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
        alt: 'Security app features',
        type: 'uploaded',
        name: 'hero-image-7.jpg'
      },
      {
        id: 8,
        url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        alt: 'Home automation system',
        type: 'uploaded',
        name: 'hero-image-8.jpg'
      },
      {
        id: 9,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        alt: 'Advanced security features',
        type: 'uploaded',
        name: 'hero-image-9.jpg'
      },
      {
        id: 10,
        url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        alt: 'Complete security solution',
        type: 'uploaded',
        name: 'hero-image-10.jpg'
      }
    ],
    process: [
      {
        id: 11,
        url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
        alt: 'Manufacturing process',
        type: 'uploaded',
        name: 'process-image-1.jpg'
      },
      {
        id: 12,
        url: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&h=600&fit=crop',
        alt: 'Quality testing lab',
        type: 'uploaded',
        name: 'process-image-2.jpg'
      },
      {
        id: 13,
        url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
        alt: 'Assembly line',
        type: 'uploaded',
        name: 'process-image-3.jpg'
      },
      {
        id: 14,
        url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
        alt: 'Component testing',
        type: 'uploaded',
        name: 'process-image-4.jpg'
      },
      {
        id: 15,
        url: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&h=600&fit=crop',
        alt: 'Final inspection',
        type: 'uploaded',
        name: 'process-image-5.jpg'
      },
      {
        id: 16,
        url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
        alt: 'Research and development',
        type: 'uploaded',
        name: 'process-image-6.jpg'
      },
      {
        id: 17,
        url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
        alt: 'Material sourcing',
        type: 'uploaded',
        name: 'process-image-7.jpg'
      },
      {
        id: 18,
        url: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&h=600&fit=crop',
        alt: 'Precision manufacturing',
        type: 'uploaded',
        name: 'process-image-8.jpg'
      },
      {
        id: 19,
        url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
        alt: 'Quality assurance',
        type: 'uploaded',
        name: 'process-image-9.jpg'
      },
      {
        id: 20,
        url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
        alt: 'Packaging and shipping',
        type: 'uploaded',
        name: 'process-image-10.jpg'
      }
    ],
    beforeAfter: [
      {
        id: 21,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Before installation',
        type: 'uploaded',
        name: 'before-after-1.jpg'
      },
      {
        id: 22,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'After installation',
        type: 'uploaded',
        name: 'before-after-2.jpg'
      },
      {
        id: 23,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Installation comparison',
        type: 'uploaded',
        name: 'before-after-3.jpg'
      },
      {
        id: 24,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Setup difference',
        type: 'uploaded',
        name: 'before-after-4.jpg'
      },
      {
        id: 25,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Security upgrade',
        type: 'uploaded',
        name: 'before-after-5.jpg'
      },
      {
        id: 26,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Old vs new system',
        type: 'uploaded',
        name: 'before-after-6.jpg'
      },
      {
        id: 27,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Installation transformation',
        type: 'uploaded',
        name: 'before-after-7.jpg'
      },
      {
        id: 28,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Security improvement',
        type: 'uploaded',
        name: 'before-after-8.jpg'
      },
      {
        id: 29,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Complete makeover',
        type: 'uploaded',
        name: 'before-after-9.jpg'
      },
      {
        id: 30,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Final comparison',
        type: 'uploaded',
        name: 'before-after-10.jpg'
      }
    ],
    lifestyle: [
      {
        id: 31,
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        alt: 'Family using security system',
        type: 'uploaded',
        name: 'lifestyle-1.jpg'
      },
      {
        id: 32,
        url: 'https://images.unsplash.com/photo-1560448204-61ef9b229e84?w=800&h=600&fit=crop',
        alt: 'Remote monitoring',
        type: 'uploaded',
        name: 'lifestyle-2.jpg'
      },
      {
        id: 33,
        url: 'https://images.unsplash.com/photo-1560448204-444092e4c2b8?w=800&h=600&fit=crop',
        alt: 'Peace of mind',
        type: 'uploaded',
        name: 'lifestyle-3.jpg'
      },
      {
        id: 34,
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        alt: 'Home security comfort',
        type: 'uploaded',
        name: 'lifestyle-4.jpg'
      },
      {
        id: 35,
        url: 'https://images.unsplash.com/photo-1560448204-61ef9b229e84?w=800&h=600&fit=crop',
        alt: 'Smart home living',
        type: 'uploaded',
        name: 'lifestyle-5.jpg'
      },
      {
        id: 36,
        url: 'https://images.unsplash.com/photo-1560448204-444092e4c2b8?w=800&h=600&fit=crop',
        alt: 'Connected home experience',
        type: 'uploaded',
        name: 'lifestyle-6.jpg'
      },
      {
        id: 37,
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        alt: 'Modern family security',
        type: 'uploaded',
        name: 'lifestyle-7.jpg'
      },
      {
        id: 38,
        url: 'https://images.unsplash.com/photo-1560448204-61ef9b229e84?w=800&h=600&fit=crop',
        alt: 'Secure lifestyle',
        type: 'uploaded',
        name: 'lifestyle-8.jpg'
      },
      {
        id: 39,
        url: 'https://images.unsplash.com/photo-1560448204-444092e4c2b8?w=800&h=600&fit=crop',
        alt: 'Home automation lifestyle',
        type: 'uploaded',
        name: 'lifestyle-9.jpg'
      },
      {
        id: 40,
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        alt: 'Complete security solution',
        type: 'uploaded',
        name: 'lifestyle-10.jpg'
      }
    ]
  }
};

// Field configuration based on actual seller-info validation (from step components)
const FIELD_CONFIG = {
  // STEP 1 - ALL MANDATORY (ProductBasicsStep validates all 5 fields as required)
  'basics.name': { mandatory: true, maxLength: 600, label: 'Product Name' },
  'basics.category': { mandatory: true, maxLength: 600, label: 'Category/Type' },
  'basics.problem': { mandatory: true, maxLength: 600, label: 'Main Problem It Solves' },
  'basics.audience': { mandatory: true, maxLength: 600, label: 'Target Audience' },
  'basics.value': { mandatory: true, maxLength: 600, label: 'Value Proposition' },
  
  // STEP 2 - 3 MANDATORY, 1 OPTIONAL (ProductStoryStep validates origin, solution, unique as required)
  'story.origin': { mandatory: true, maxLength: 600, label: 'Origin Story' },
  'story.solution': { mandatory: true, maxLength: 600, label: 'Solution Journey' },
  'story.unique': { mandatory: true, maxLength: 600, label: 'What Makes It Unique' },
  'story.vision': { mandatory: false, maxLength: 600, label: 'Vision & Mission' },
  
  // STEP 3 - ALL OPTIONAL (Process step is optional - step3: true)
  'process.creation': { mandatory: false, maxLength: 600, label: 'Creation Process' },
  'process.materials': { mandatory: false, maxLength: 600, label: 'Materials & Technology' },
  'process.time': { mandatory: false, maxLength: 600, label: 'Time Investment' },
  'process.quality': { mandatory: false, maxLength: 600, label: 'Quality Standards' },
  'process.ethics': { mandatory: false, maxLength: 600, label: 'Ethics & Sustainability' }
};

// Array field configuration
const ARRAY_CONFIG = {
  'impact.testimonials': { 
    mandatory: false, 
    minItems: 0, 
    maxItems: 10, 
    itemMaxLength: 300, 
    label: 'Customer Testimonials' 
  },
  'impact.cases': { 
    mandatory: false, 
    minItems: 0, 
    maxItems: 10, 
    itemMaxLength: 300, 
    label: 'Case Studies' 
  },
  'impact.metrics': { 
    mandatory: false, 
    minItems: 0, 
    maxItems: 10, 
    itemMaxLength: 300, 
    label: 'Key Metrics' 
  },
  'impact.awards': { 
    mandatory: false, 
    minItems: 0, 
    maxItems: 10, 
    itemMaxLength: 300, 
    label: 'Awards & Recognition' 
  }
};

// Image field configuration
const IMAGE_CONFIG = {
  'visuals.hero': { label: 'Hero Images', maxImages: 10, mandatory: false },
  'visuals.process': { label: 'Process Images', maxImages: 10, mandatory: false },
  'visuals.beforeAfter': { label: 'Before/After Images', maxImages: 10, mandatory: false },
  'visuals.lifestyle': { label: 'Lifestyle Images', maxImages: 10, mandatory: false }
};

export default function SellerInfoTestPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('journey');
  const [testData, setTestData] = useState(SAMPLE_DATA);
  const [fieldVisibility, setFieldVisibility] = useState({});
  const [fieldLengths, setFieldLengths] = useState({});
  const [arrayLengths, setArrayLengths] = useState({});
  const [arrayVisibility, setArrayVisibility] = useState({});
  const [imageVisibility, setImageVisibility] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [previewKey, setPreviewKey] = useState(0); // Force preview refresh

  // Initialize field visibility and lengths
  useEffect(() => {
    const initialVisibility = {};
    const initialLengths = {};
    
    Object.keys(FIELD_CONFIG).forEach(field => {
      initialVisibility[field] = true;
      initialLengths[field] = FIELD_CONFIG[field].maxLength;
    });

    const initialArrayLengths = {};
    const initialArrayVisibility = {};
    Object.keys(ARRAY_CONFIG).forEach(field => {
      initialArrayLengths[field] = ARRAY_CONFIG[field].maxItems;
      initialArrayVisibility[field] = true;
    });

    const initialImageVisibility = {};
    Object.keys(IMAGE_CONFIG).forEach(field => {
      initialImageVisibility[field] = true;
    });

    setFieldVisibility(initialVisibility);
    setFieldLengths(initialLengths);
    setArrayLengths(initialArrayLengths);
    setArrayVisibility(initialArrayVisibility);
    setImageVisibility(initialImageVisibility);
  }, []);

  // Update localStorage whenever test data changes and force preview refresh
  useEffect(() => {
    // Extract all images from visuals
    const allImages = [];
    if (testData.visuals) {
      Object.values(testData.visuals).forEach(visualArray => {
        if (Array.isArray(visualArray)) {
          visualArray.forEach(visual => {
            if (visual.url) allImages.push(visual.url);
          });
        }
      });
    }

    const previewData = {
      model: TEMPLATE_MAP[selectedTemplate],
      content: testData,
      images: allImages,
      templateType: selectedTemplate,
      productStoryData: testData // For compatibility with product-story type
    };

    localStorage.setItem('sellerInfoTestPreviewData', JSON.stringify(previewData));
    
    // Force preview refresh
    setPreviewKey(prev => prev + 1);
  }, [testData, selectedTemplate]);

  // Helper function to get nested value
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Helper function to set nested value
  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  // Toggle field visibility
  const toggleFieldVisibility = (field) => {
    if (FIELD_CONFIG[field].mandatory) return; // Can't toggle mandatory fields
    
    setFieldVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));

    // Update test data - remove or restore field
    setTestData(prev => {
      const newData = { ...prev };
      if (fieldVisibility[field]) {
        // Hide field - set to empty
        setNestedValue(newData, field, '');
      } else {
        // Show field - restore sample data
        setNestedValue(newData, field, getNestedValue(SAMPLE_DATA, field));
      }
      return newData;
    });
  };

  // Update field character limit
  const updateFieldLength = (field, newLength) => {
    const config = FIELD_CONFIG[field];
    const clampedLength = Math.max(10, Math.min(config.maxLength, parseInt(newLength) || config.maxLength));
    
    setFieldLengths(prev => ({
      ...prev,
      [field]: clampedLength
    }));

    // Truncate field value if necessary, or restore from sample if increasing
    setTestData(prev => {
      const newData = { ...prev };
      const currentValue = getNestedValue(newData, field) || '';
      const sampleValue = getNestedValue(SAMPLE_DATA, field) || '';
      
      if (currentValue.length > clampedLength) {
        // Truncate if current value is longer than new limit
        setNestedValue(newData, field, currentValue.substring(0, clampedLength));
      } else if (currentValue.length < clampedLength && sampleValue.length > currentValue.length) {
        // Restore from sample data if increasing limit and sample has more content
        const restoredValue = sampleValue.substring(0, clampedLength);
        setNestedValue(newData, field, restoredValue);
      }
      return newData;
    });
  };

  // Update array length
  const updateArrayLength = (field, newLength) => {
    const config = ARRAY_CONFIG[field];
    const clampedLength = Math.max(config.minItems, Math.min(config.maxItems, parseInt(newLength) || config.maxItems));
    
    setArrayLengths(prev => ({
      ...prev,
      [field]: clampedLength
    }));

    // Update array in test data
    setTestData(prev => {
      const newData = { ...prev };
      const currentArray = getNestedValue(newData, field) || [];
      const sampleArray = getNestedValue(SAMPLE_DATA, field) || [];
      
      if (clampedLength > currentArray.length) {
        // Add items from sample data
        const itemsToAdd = clampedLength - currentArray.length;
        const newItems = sampleArray.slice(currentArray.length, currentArray.length + itemsToAdd);
        setNestedValue(newData, field, [...currentArray, ...newItems]);
      } else if (clampedLength < currentArray.length) {
        // Remove items
        setNestedValue(newData, field, currentArray.slice(0, clampedLength));
      }
      
      return newData;
    });
  };

  // Toggle array visibility
  const toggleArrayVisibility = (field) => {
    setArrayVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));

    // Update test data - remove or restore array
    setTestData(prev => {
      const newData = { ...prev };
      if (arrayVisibility[field]) {
        // Hide array - set to empty
        setNestedValue(newData, field, []);
      } else {
        // Show array - restore sample data
        setNestedValue(newData, field, getNestedValue(SAMPLE_DATA, field));
      }
      return newData;
    });
  };

  // Toggle image visibility
  const toggleImageVisibility = (field) => {
    setImageVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));

    // Update test data - remove or restore images
    setTestData(prev => {
      const newData = { ...prev };
      if (imageVisibility[field]) {
        // Hide images - set to empty
        setNestedValue(newData, field, []);
      } else {
        // Show images - restore sample data
        setNestedValue(newData, field, getNestedValue(SAMPLE_DATA, field));
      }
      return newData;
    });
  };

  // Update image array length
  const updateImageArrayLength = (field, newLength) => {
    const config = IMAGE_CONFIG[field];
    const clampedLength = Math.max(0, Math.min(config.maxImages, parseInt(newLength) || config.maxImages));
    
    // Update image array in test data
    setTestData(prev => {
      const newData = { ...prev };
      const currentArray = getNestedValue(newData, field) || [];
      const sampleArray = getNestedValue(SAMPLE_DATA, field) || [];
      
      if (clampedLength > currentArray.length) {
        // Add items from sample data
        const itemsToAdd = clampedLength - currentArray.length;
        const newItems = sampleArray.slice(currentArray.length, currentArray.length + itemsToAdd);
        setNestedValue(newData, field, [...currentArray, ...newItems]);
      } else if (clampedLength < currentArray.length) {
        // Remove items
        setNestedValue(newData, field, currentArray.slice(0, clampedLength));
      }
      
      return newData;
    });
  };

  // Reset to sample data
  const resetToSampleData = () => {
    setTestData(SAMPLE_DATA);
    
    // Reset all controls
    const resetVisibility = {};
    const resetLengths = {};
    Object.keys(FIELD_CONFIG).forEach(field => {
      resetVisibility[field] = true;
      resetLengths[field] = FIELD_CONFIG[field].maxLength;
    });

    const resetArrayLengths = {};
    Object.keys(ARRAY_CONFIG).forEach(field => {
      resetArrayLengths[field] = ARRAY_CONFIG[field].maxItems;
    });

    setFieldVisibility(resetVisibility);
    setFieldLengths(resetLengths);
    setArrayLengths(resetArrayLengths);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Controls Panel */}
      {showControls && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">Seller Info Test Preview</h1>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">TEST MODE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetToSampleData}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
                <button
                  onClick={() => setShowControls(false)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm"
                >
                  <Eye size={14} />
                  Hide Controls
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(TEMPLATE_MAP).map(template => (
                  <option key={template} value={template}>
                    {template.charAt(0).toUpperCase() + template.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Field Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Field Controls</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(FIELD_CONFIG).map(([field, config]) => (
                    <div key={field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleFieldVisibility(field)}
                          disabled={config.mandatory}
                          className={`p-1 rounded ${
                            config.mandatory 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : fieldVisibility[field] 
                                ? 'text-green-600 hover:text-green-700' 
                                : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {fieldVisibility[field] ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {config.label}
                            {config.mandatory && <span className="text-red-500 ml-1">*</span>}
                          </span>
                          <div className="text-xs text-gray-500">
                            Current: {getNestedValue(testData, field)?.length || 0} chars
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="10"
                          max={config.maxLength}
                          value={fieldLengths[field] || config.maxLength}
                          onChange={(e) => updateFieldLength(field, e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-500">max</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Array Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Array Controls</h3>
                <div className="space-y-3">
                  {Object.entries(ARRAY_CONFIG).map(([field, config]) => (
                    <div key={field} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleArrayVisibility(field)}
                            className={`p-1 rounded ${
                              arrayVisibility[field] 
                                ? 'text-green-600 hover:text-green-700' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {arrayVisibility[field] ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {config.label}
                              {config.mandatory && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            <div className="text-xs text-gray-500">
                              Current: {getNestedValue(testData, field)?.length || 0} items
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={config.minItems}
                            max={config.maxItems}
                            value={arrayLengths[field] || config.maxItems}
                            onChange={(e) => updateArrayLength(field, e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">items</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Range: {config.minItems}-{config.maxItems} items, {config.itemMaxLength} chars each
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Image Controls</h3>
                <div className="space-y-3">
                  {Object.entries(IMAGE_CONFIG).map(([field, config]) => (
                    <div key={field} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleImageVisibility(field)}
                            className={`p-1 rounded ${
                              imageVisibility[field] 
                                ? 'text-green-600 hover:text-green-700' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {imageVisibility[field] ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {config.label}
                            </span>
                            <div className="text-xs text-gray-500">
                              Current: {getNestedValue(testData, field)?.length || 0} images
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={config.maxImages}
                            value={getNestedValue(testData, field)?.length || 0}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value) || 0;
                              updateImageArrayLength(field, newValue);
                            }}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">images</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Max: {config.maxImages} images
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Controls Button (when hidden) */}
      {!showControls && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-lg text-sm"
          >
            <Settings size={14} />
            Show Controls
          </button>
        </div>
      )}

      {/* Preview */}
      <div className={showControls ? '' : 'pt-0'}>
        <UniversalPreviewPage
          key={previewKey}
          type="seller-info"
          backUrl="/seller-info"
          storageKey="sellerInfoTestPreviewData"
          title="Test Preview"
          helpText="This is a test preview with sample data. Use controls above to modify fields."
          showHeader={showControls}
          showEditingUI={true}
        />
      </div>
    </div>
  );
}