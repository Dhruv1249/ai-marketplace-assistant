# 🤖 AI Marketplace Assistant

A powerful Next.js application that leverages Google's Gemini AI to automatically generate comprehensive e-commerce product content. Create professional product pages with AI-generated titles, descriptions, features, specifications, and SEO-optimized content in seconds.

![AI Marketplace Assistant](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)

## ✨ Features

### 🎯 AI-Powered Content Generation
- **Smart Product Descriptions**: Generate compelling 2-3 paragraph product descriptions
- **SEO-Optimized Titles**: Create catchy titles under 60 characters
- **Feature Lists**: Automatically extract and list key product features
- **Technical Specifications**: Generate relevant product specifications
- **SEO Keywords**: Get targeted keywords for better search visibility
- **Meta Descriptions**: Create SEO-friendly meta descriptions under 160 characters

### 🎨 User Experience
- **Intuitive Interface**: Clean, modern UI built with Tailwind CSS
- **Real-time Validation**: Form validation with character counters
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Loading States**: Visual feedback during content generation
- **Error Handling**: Comprehensive error messages and fallback content

### 🛠️ Technical Features
- **Next.js 15**: Latest Next.js with App Router
- **TypeScript**: Full type safety throughout the application
- **Google Gemini AI**: Integration with Google's advanced AI model
- **Zod Validation**: Runtime type checking and validation
- **Component Architecture**: Modular, reusable React components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google AI Studio account for Gemini API key
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

2. Get your Gemini API key:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API key"
   - Copy the generated API key

3. Update your `.env` file:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
ai-marketplace-assistant/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── ai/                   # AI-related endpoints
│   │       ├── generate-content/ # Regular content generation
│   │       ├── optimize-seo/     # SEO optimization
│   │       └── suggest-layout/   # Layout suggestions
│   ├── create/                   # Product creation pages
│   ├── marketplace/              # Marketplace pages
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.jsx                  # Home page
├── components/                   # React components
│   ├── ai/                       # AI-related components
│   │   └── StreamingContentGenerator.jsx
│   ├── layout/                   # Layout components
│   └── ui/                       # UI components
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       └── index.js
├── lib/                          # Utility libraries
│   └── ai/                       # AI integration
│       └── gemini.ts             # Gemini AI functions
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
└── README.md                     # This file
```

## 🎮 Usage

### Creating Product Content

1. **Navigate to Create Page**: Click "Start Creating" on the homepage or go to `/create`

2. **Fill in Product Details**:
   - **Product Description** (required, min 10 characters): Describe your product in detail
   - **Category** (optional): e.g., Electronics, Clothing, Home & Garden
   - **Target Audience** (optional): e.g., Tech enthusiasts, Parents, Professionals
   - **Tone** (optional): Choose from Professional, Casual, Friendly, or Technical

3. **Generate Content**: Click "Generate Content" and wait for the AI to create your product page content

4. **Review and Edit**: Review the generated content and make any necessary edits

5. **Continue to Layout**: Choose your preferred page layout (coming soon)

6. **Publish**: Publish your product to the marketplace (coming soon)

### Example Generated Content

For a "baseball bat" product, the AI might generate:

```json
{
  "title": "Premium Baseball Bat - Professional Grade",
  "description": "This high-quality baseball bat is perfect for players who value performance and durability. Crafted with precision and built to last, it offers exceptional swing speed and control for both practice and competitive play.",
  "features": [
    "Professional-grade construction",
    "Lightweight yet durable design",
    "Comfortable grip handle",
    "Regulation size and weight"
  ],
  "specifications": {
    "Material": "Premium wood/aluminum",
    "Length": "32-34 inches",
    "Weight": "28-32 oz",
    "Grip": "Non-slip handle"
  },
  "seoKeywords": [
    "baseball bat",
    "professional",
    "sports equipment",
    "baseball gear"
  ],
  "metaDescription": "Premium baseball bat for professional and amateur players. High-quality construction, perfect balance, and exceptional performance."
}
```

## 🔧 API Endpoints

### POST `/api/ai/generate-content`
Generate comprehensive product content using AI.

**Request Body:**
```json
{
  "productDescription": "string (min 10 chars, required)",
  "category": "string (optional)",
  "targetAudience": "string (optional)",
  "tone": "professional|casual|friendly|technical (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "string",
    "description": "string",
    "features": ["string"],
    "specifications": {"key": "value"},
    "seoKeywords": ["string"],
    "metaDescription": "string"
  }
}
```

### POST `/api/ai/optimize-seo`
Optimize existing content for SEO.

### POST `/api/ai/suggest-layout`
Get layout suggestions based on product type.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Technologies

- **Next.js 15.4.6**: React framework with App Router
- **React 18.2.0**: UI library
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Utility-first CSS framework
- **Google Gemini AI**: AI content generation
- **Zod**: Runtime validation
- **Lucide React**: Icon library
- **Framer Motion**: Animation library

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |

## 🎨 UI Components

### StreamingContentGenerator
The main component for AI content generation with form validation and error handling.

### Button
Reusable button component with multiple variants (primary, secondary, outline, danger).

### Input
Form input component with label, validation, and error display.

### Modal
Modal dialog component for overlays and confirmations.

## 🔒 Security & Best Practices

- ✅ Environment variables for sensitive data
- ✅ Input validation with Zod
- ✅ Error handling and fallback content
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Responsive design principles

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `GEMINI_API_KEY` environment variable in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful AI capabilities
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Lucide](https://lucide.dev/) for clean icons

## 📞 Support

If you have any questions or need help:

1. Check the [Issues](https://github.com/yourusername/ai-marketplace-assistant/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your setup and the issue

---

**Made with ❤️ and AI** - Transform your product descriptions into professional e-commerce content in seconds!