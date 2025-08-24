export const getSampleData = () => {
  return {
    content: {
      title: "Premium Wireless Headphones",
      description: "Experience crystal-clear audio with our premium wireless headphones. Featuring advanced noise cancellation, 30-hour battery life, and premium comfort design for all-day listening.",
      features: [
        "Active Noise Cancellation",
        "30-Hour Battery Life", 
        "Premium Comfort Design",
        "Crystal Clear Audio",
        "Wireless Connectivity"
      ],
      featureExplanations: {
        "Active Noise Cancellation": "Advanced ANC technology blocks out ambient noise for immersive listening experience.",
        "30-Hour Battery Life": "Extended battery life ensures your music plays all day without interruption.",
        "Premium Comfort Design": "Ergonomically designed with soft padding for comfortable extended wear.",
        "Crystal Clear Audio": "High-fidelity drivers deliver exceptional sound quality across all frequencies.",
        "Wireless Connectivity": "Seamless Bluetooth 5.0 connection with stable, long-range performance."
      },
      specifications: {
        "Driver Size": "40mm Dynamic",
        "Frequency Response": "20Hz - 20kHz",
        "Battery Life": "30 hours",
        "Charging Time": "2 hours",
        "Bluetooth Version": "5.0",
        "Weight": "250g",
        "Impedance": "32 ohms",
        "Sensitivity": "105 dB"
      },
      price: "$299.99",
      rating: 4.8,
      reviews: 1247
    },
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
    ]
  };
};

export const getEmptyData = () => {
  return {
    content: {
      title: "Product Title",
      description: "Product description goes here...",
      features: [
        "Feature 1",
        "Feature 2", 
        "Feature 3"
      ],
      featureExplanations: {
        "Feature 1": "Explanation for feature 1",
        "Feature 2": "Explanation for feature 2",
        "Feature 3": "Explanation for feature 3"
      },
      specifications: {
        "Spec 1": "Value 1",
        "Spec 2": "Value 2",
        "Spec 3": "Value 3"
      }
    },
    images: [
      "https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=Product+Image+1",
      "https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=Product+Image+2",
      "https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=Product+Image+3"
    ]
  };
};

export const getDataForTemplate = (templateType) => {
  const baseData = getSampleData();
  
  switch (templateType) {
    case 'classic':
      return {
        ...baseData,
        content: {
          ...baseData.content,
          title: "Artisan Crafted Timepiece",
          description: "A masterfully crafted timepiece that combines traditional watchmaking with modern precision. Each piece is hand-assembled by skilled artisans using premium materials.",
          features: [
            "Swiss Movement Precision",
            "Handcrafted Leather Strap",
            "Sapphire Crystal Glass",
            "Water Resistant Design",
            "Limited Edition"
          ]
        }
      };
      
    case 'modern':
      return {
        ...baseData,
        content: {
          ...baseData.content,
          title: "Smart Fitness Tracker",
          description: "Next-generation fitness tracking with AI-powered insights. Monitor your health, track workouts, and achieve your fitness goals with cutting-edge technology.",
          features: [
            "AI Health Insights",
            "24/7 Heart Rate Monitoring",
            "GPS Tracking",
            "Sleep Analysis",
            "Smart Notifications"
          ]
        }
      };
      
    case 'minimal':
      return {
        ...baseData,
        content: {
          ...baseData.content,
          title: "Essential Notebook",
          description: "Clean, simple design meets premium quality. Perfect for daily notes, sketches, and ideas.",
          features: [
            "Premium Paper",
            "Durable Binding",
            "Minimalist Design"
          ]
        }
      };
      
    default:
      return baseData;
  }
};