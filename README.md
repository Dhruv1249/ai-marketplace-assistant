# 🤖 AI Marketplace Assistant

A comprehensive Next.js application that leverages Google's Gemini AI to create professional e-commerce product pages with AI-generated content, real-time streaming, Firebase authentication, and a complete marketplace platform.

![AI Marketplace Assistant](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-FFCA28?style=for-the-badge&logo=firebase)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-Service_Account-4285F4?style=for-the-badge&logo=google-cloud)

## ✨ Features

### 🎯 AI-Powered Content Generation
- **Smart Product Descriptions**: Generate compelling 2-3 paragraph product descriptions
- **SEO-Optimized Titles**: Create catchy titles under 60 characters
- **Feature Lists**: Automatically extract and list 4-6 key product features
- **Feature Explanations**: AI-generated detailed explanations for each feature
- **Technical Specifications**: Generate relevant product specifications (5-8 items)
- **SEO Keywords**: Get 8-12 targeted keywords for better search visibility
- **Meta Descriptions**: Create SEO-friendly meta descriptions under 160 characters
- **Real-time Streaming**: Watch content being generated in real-time with streaming AI interface
- **Content Regeneration**: Regenerate individual sections or entire content

### 🎨 User Experience & Interface
- **Multi-Step Product Creation**: 5-step guided process for creating products
- **Intuitive Interface**: Clean, modern UI built with Tailwind CSS and animated components
- **Real-time Validation**: Form validation with character counters and Zod schema validation
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Loading States**: Visual feedback during content generation with progress indicators
- **Error Handling**: Comprehensive error messages and fallback content
- **Interactive Animations**: GSAP-powered animations and Framer Motion components
- **Live Preview**: Real-time preview of product pages during creation

### 🔐 Authentication & User Management
- **Firebase Authentication**: Complete user authentication system
- **Google Sign-in**: OAuth integration for easy user registration
- **GitHub OAuth**: Additional authentication provider
- **User Dashboard**: Personalized welcome messages and user-specific content
- **Session Management**: Secure session handling with Firebase Auth
- **Firebase Realtime Database**: Option for real-time updates for user-specific content or notifications.
- **Firebase Storage**: Secure file uploads and storage for profile pictures, documents, or media.
- **Service Account Integration**: Use Firebase service accounts for secure server-side access to Firestore, Storage, and other Firebase services.

### 🛍️ Marketplace Platform
- **Product Marketplace**: Browse and discover products created by other users
- **Product Pages**: Dynamic product pages with customizable layouts
- **Template System**: Multiple layout templates (Gallery Focused, Classic, Modern, Minimal)
- **Image Management**: Upload and manage product images with drag-and-drop
- **Pricing System**: Flexible pricing with discount options
- **SEO Optimization**: Built-in SEO features for better search visibility

### 🛠️ Technical Features
- **Next.js 15**: Latest Next.js with App Router and TypeScript support
- **Google Gemini AI**: Integration with Google's advanced AI model (gemini-2.5-flash-lite)
- **Streaming AI**: Real-time content generation with streaming responses
- **Component Architecture**: Modular, reusable React components
- **Type Safety**: Full TypeScript implementation with custom type definitions
- **Template Engine**: JSON-based template system for flexible layouts
- **Image Upload**: File upload system with image optimization
- **API Routes**: RESTful API endpoints for all functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google AI Studio account for Gemini API key
- Firebase project for authentication
- Git installed

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-marketplace-assistant.git
cd ai-marketplace-assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Get your API keys:
   - **Gemini API**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **Firebase**: Create a project at [Firebase Console](https://console.firebase.google.com/)
   - **GitHub OAuth**: Create an OAuth app at [GitHub Developer Settings](https://github.com/settings/developers)
   - **Google Cloud Service Account**: Generate a service account key from [Google Cloud Console](https://console.cloud.google.com/).  

3. Update your `.env` file:
```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OAuth Providers
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_GITHUB_CLIENT_SECRET=your_github_client_secret

# Firebase Admin SDK
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```


### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
ai-marketplace-assistant/
├── app/                              # Next.js App Router
│   ├── api/                          # API routes
│   │   ├── ai/                       # AI-related endpoints
│   │   │   ├── generate-content/     # Main content generation
│   │   │   ├── generate-content-stream/ # Streaming content generation
│   │   │   ├── generate-feature-explanations/ # Feature explanations
│   │   │   ├── generate-field/       # Individual field generation
│   │   │   ├── modify-template/      # Template modifications
│   │   │   ├── optimize-seo/         # SEO optimization
│   │   │   ├── regenerate-section/   # Section regeneration
│   │   │   └── suggest-layout/       # Layout suggestions
│   │   ├── generate-content/         # Legacy content generation
│   │   ├── generate-photo/           # Photo generation
│   │   └── products/                 # Product management
│   ├── about/                        # About page
│   ├── contact/                      # Contact page
│   ├── create/                       # Product creation workflow
│   │   └── CreateProductPage.jsx     # Main creation interface
│   ├── login/                        # Authentication pages
│   │   ├── firebase.js               # Firebase configuration
│   │   ├── login.jsx                 # Login component
│   │   └── page.jsx                  # Login page
│   ├── marketplace/                  # Marketplace pages
│   │   ├── [productId]/              # Dynamic product pages
│   │   ├── preview-standard/         # Preview templates
│   │   └── page.jsx                  # Marketplace listing
│   ├── preview/                      # Product preview system
│   ├── seller-info/                  # Seller information pages
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.jsx                      # Home page with animations
├── components/                       # React components
│   ├── ai/                           # AI-related components
��   ├── animated icon/                # Animated icon components
│   │   ├── Box.jsx                   # Animated box icon
│   │   ├── ChartNoAxes.jsx           # Chart icon
│   │   ├── Explore.jsx               # Explore button
│   │   ├── ReadMoreButton.jsx        # Read more button
│   │   ├── Rocket.jsx                # Rocket icon
│   │   ├── SmartphoneNfc.jsx         # Smartphone icon
│   │   └── Users.jsx                 # Users icon
│   ├── create-product/               # Product creation components
│   │   ├── ContentGenerationStep.jsx # Step 1: Content generation
│   │   ├── ContentReviewStep.jsx     # Step 2: Content review
│   │   ├── ImagesLayoutStep.jsx      # Step 4: Images and layout
│   │   ├── PricingStep.jsx           # Step 3: Pricing setup
│   │   └── PublishStep.jsx           # Step 5: Publishing
│   ├── editors/                      # Content editors
│   ├── layout/                       # Layout components
│   ├── seller-info/                  # Seller information components
│   ├── templates/                    # Template components
│   └── ui/                           # UI components
│       ├── Button.jsx                # Reusable button component
│       ├── Input.jsx                 # Form input component
│       ├── Modal.jsx                 # Modal dialog component
│       └── index.js                  # UI components export
├── lib/                              # Utility libraries
│   ├── ai/                           # AI integration
│   │   └── gemini.ts                 # Gemini AI functions
│   ├── templates/                    # Layout templates
│   │   ├── classic.json              # Classic template
│   │   ├── gallery-focused.json      # Gallery-focused template
│   │   ├── minimal.json              # Minimal template
│   │   └── modern.json               # Modern template
│   ├── ComponentRegistry.js          # Component registry
│   ├── SampleData.js                 # Sample data for testing
│   ├── templateStorage.js            # Template storage utilities
│   └── TemplateValidator.js          # Template validation
├── types/                            # TypeScript type definitions
│   ├── pageModal.ts                  # Page modal types
│   ├── product.ts                    # Product types
│   └── user.ts                       # User types
├── public/                           # Static assets
├── .env                              # Environment variables
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies and scripts
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── service-account.json              # Google Application credentials    
└── README.md                         # This file

```

## 🎮 Usage Guide

### Creating a Product (5-Step Process)

#### Step 1: Generate Content
1. Navigate to `/create` or click "Start Creating" on the homepage
2. Fill in the product description (minimum 10 characters)
3. Optionally specify:
   - **Category**: Electronics, Clothing, Home & Garden, etc.
   - **Target Audience**: Tech enthusiasts, Parents, Professionals, etc.
   - **Tone**: Professional, Casual, Friendly, or Technical
4. Click "Generate Content" to create AI-powered content

#### Step 2: Review & Edit Content
- Review generated title, description, features, specifications
- Edit any content directly in the interface
- Generate feature explanations for better customer understanding
- Regenerate individual sections or entire content if needed

#### Step 3: Set Pricing
- Set base price for your product
- Configure optional discounts (percentage or fixed amount)
- Preview final pricing with discount calculations

#### Step 4: Images & Layout
- Upload thumbnail image (required)
- Add additional product images
- Choose from 4 layout templates:
  - **Gallery Focused**: Emphasizes product images
  - **Classic**: Traditional e-commerce layout
  - **Modern**: Contemporary design with clean lines
  - **Minimal**: Simple, focused presentation

#### Step 5: Publish
- Review all product information
- Publish to the marketplace
- Share your product page with customers

### Example Generated Content

For a "wireless bluetooth headphones" product:

```json
{
  "title": "Premium Wireless Bluetooth Headphones - Studio Quality",
  "description": "Experience exceptional audio quality with these premium wireless Bluetooth headphones. Featuring advanced noise cancellation technology and superior comfort design, they're perfect for music lovers, professionals, and anyone seeking high-quality audio on the go.",
  "features": [
    "Active Noise Cancellation",
    "30-Hour Battery Life",
    "Quick Charge Technology",
    "Premium Comfort Padding",
    "High-Resolution Audio",
    "Multi-Device Connectivity"
  ],
  "specifications": {
    "Driver Size": "40mm Dynamic Drivers",
    "Frequency Response": "20Hz - 20kHz",
    "Battery Life": "30 hours with ANC off",
    "Charging Time": "2 hours (Quick charge: 15 min = 3 hours)",
    "Bluetooth Version": "5.2",
    "Weight": "250g",
    "Impedance": "32 ohms"
  },
  "seoKeywords": [
    "wireless headphones",
    "bluetooth headphones",
    "noise cancelling",
    "premium audio",
    "studio quality",
    "long battery life"
  ],
  "metaDescription": "Premium wireless Bluetooth headphones with active noise cancellation, 30-hour battery life, and studio-quality sound. Perfect for music and calls."
}
```

## 🔧 API Endpoints

### Content Generation
- **POST** `/api/ai/generate-content` - Generate comprehensive product content
- **POST** `/api/ai/generate-content-stream` - Stream content generation in real-time
- **POST** `/api/ai/regenerate-section` - Regenerate specific content sections
- **POST** `/api/ai/generate-feature-explanations` - Generate feature explanations
- **POST** `/api/ai/generate-field` - Generate individual fields

### Template & Layout
- **POST** `/api/ai/suggest-layout` - Get layout suggestions based on product type
- **POST** `/api/ai/modify-template` - Modify existing templates

### SEO & Optimization
- **POST** `/api/ai/optimize-seo` - Optimize content for SEO

### Product Management
- **GET/POST** `/api/products` - Manage products in the marketplace

### Photo Generation
- **POST** `/api/generate-photo` - Generate product photos (if implemented)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Key Technologies & Dependencies

#### Core Framework
- **Next.js 15.4.6**: React framework with App Router and TypeScript
- **React 18.2.0**: UI library with hooks and modern features
- **TypeScript 5**: Full type safety and IntelliSense

#### Styling & UI
- **Tailwind CSS 4**: Utility-first CSS framework
- **Styled Components 6.1.19**: CSS-in-JS styling
- **Lucide React 0.294.0**: Beautiful icon library
- **Framer Motion 10.16.16**: Animation library
- **GSAP 3.13.0**: Professional animation library
- **Lenis 1.3.8**: Smooth scrolling

#### AI & Backend
- **@google/genai 0.3.0**: Google Gemini AI integration
- **Firebase 12.1.0**: Authentication and backend services
- **Next-Auth 4.24.5**: Authentication for Next.js
- **Service Account Integration**: Secure server-side access to Firestore, Storage, and Firebase Admin services for backend operations.
  
#### Form Handling & Validation
- **React Hook Form 7.48.2**: Performant forms with easy validation
- **Zod 3.22.4**: TypeScript-first schema validation
- **@dnd-kit**: Drag and drop functionality

#### Utilities
- **JSONata 2.1.0**: JSON query and transformation
- **React Dropzone 14.2.3**: File upload with drag and drop
- **Mime 4.0.1**: MIME type detection
- **Dotenv 17.2.1**: Environment variable management

### Environment Variables

| Variable | Description | Required | 
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes | 
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes | 
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes | 
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes | 
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes | 
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes | 
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase analytics ID | No | 
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID | No | 
| `NEXT_PUBLIC_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No | 
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase Admin SDK service account JSON (server-side only) | Yes (for server ops) |


## 🎨 Component Architecture

### Core Components

#### StreamingContentGenerator
Main component for AI content generation with real-time streaming, form validation, and error handling.

#### CreateProductPage
Multi-step product creation workflow with state management and progress tracking.

#### Template System
JSON-based template system supporting multiple layout options:
- Gallery Focused: Image-centric layout
- Classic: Traditional e-commerce design
- Modern: Contemporary styling
- Minimal: Clean, simple presentation

#### UI Components
- **Button**: Multiple variants (primary, secondary, outline, danger)
- **Input**: Form inputs with validation and error display
- **Modal**: Overlay dialogs for confirmations and forms

### Animation Components
- **TypingText**: Animated text with typing effect
- **AnimatedCartButton**: Interactive button with hover effects
- **Animated Icons**: Custom animated SVG icons

## 🔒 Security & Best Practices

- ✅ Environment variables for sensitive data
- ✅ Input validation with Zod schemas
- ✅ Error handling and fallback content
- ✅ TypeScript for compile-time type safety
- ✅ ESLint for code quality and consistency
- ✅ Firebase security rules for authentication
- ✅ API rate limiting and error handling
- ✅ Responsive design principles
- ✅ SEO optimization built-in
- ✅ Content Security Policy headers

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically with each push

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- **Netlify**: Static site generation support
- **Railway**: Full-stack deployment
- **DigitalOcean App Platform**: Container-based deployment
- **AWS Amplify**: AWS-native deployment

### Build Configuration
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add JSDoc comments for complex functions
- Ensure responsive design
- Test on multiple browsers

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful AI capabilities
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for beautiful utility-first styling
- [Firebase](https://firebase.google.com/) for authentication and backend services
- [Lucide](https://lucide.dev/) for clean, consistent icons
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [GSAP](https://greensock.com/gsap/) for professional animations
- [Google Cloud](https://cloud.google.com/) for service account credentials and secure authentication  

## 📞 Support & Community

If you have questions or need help:

1. **Documentation**: Check this README and inline code comments
2. **Issues**: Create an issue on GitHub with detailed information
3. **Discussions**: Join GitHub Discussions for community support
4. **Email**: Contact the maintainers for urgent issues

### Reporting Issues
When reporting issues, please include:
- Operating system and browser version
- Node.js version
- Steps to reproduce the issue
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if applicable)

---

**Made with ❤️ and AI** - Transform your product ideas into professional e-commerce pages in minutes!

## 🔄 Recent Updates

- ✅ Multi-step product creation workflow
- ✅ Real-time AI content streaming
- ✅ Firebase authentication integration
- ✅ Template system with 4 layout options
- ✅ Feature explanation generation
- ✅ Image upload and management
- ✅ Pricing system with discounts
- ✅ SEO optimization features
- ✅ Responsive design improvements
- ✅ Enhanced error handling and validation
