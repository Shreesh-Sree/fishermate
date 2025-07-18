
# 🚢 FisherMate.AI

> **Your AI-Powered Fishing Companion** - Intelligent guidance for fisherfolk communities powered by cutting-edge AI and real-time data.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Maps](https://img.shields.io/badge/Google-Maps-4285F4?style=for-the-badge&logo=google-maps)](https://developers.google.com/maps)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

---

## 🌊 About FisherMate.AI

FisherMate.AI is a comprehensive web application designed specifically for fisherfolk communities in India. It combines artificial intelligence, real-time weather data, interactive mapping, and legal compliance tools to provide an all-in-one fishing companion that enhances safety, productivity, and regulatory compliance.

### 🎯 Mission
Empowering coastal fishing communities with intelligent technology to make informed decisions, stay safe, and operate within legal frameworks while maximizing their fishing success.

### 🎥 Demo Video
[![FisherMate.AI Demo](https://img.youtube.com/vi/n6QxwPZPMxM/maxresdefault.jpg)](https://youtu.be/n6QxwPZPMxM)

**[🎬 Watch Full Demo on YouTube](https://youtu.be/n6QxwPZPMxM)** - See FisherMate.AI in action with all features demonstrated!

---

## ✨ Key Features

### 🗺️ **Interactive Mapping System**
- **Real-time location tracking** with GPS integration
- **Fishing hotspots discovery** with community insights
- **Marine area visualization** with depth and current data
- **Weather overlay integration** for informed navigation

### 🌤️ **AI-Powered Weather Dashboard**
- **Live weather updates** with marine-specific forecasts
- **Fishing analytics** powered by Google Gemini AI
- **Storm warnings** and safety alerts
- **Optimal fishing time predictions**

### ⚖️ **Legal Compliance Assistant**
- **AI-powered legal guidance** for fishing regulations
- **Multi-language support** (English & Tamil)
- **Text-to-speech functionality** for accessibility
- **Quick reference** for common legal questions

### 🛡️ **Safety Management System**
- **Comprehensive safety guidelines** for marine activities
- **Emergency protocols** and contact information
- **Weather-based safety recommendations**
- **Best practices** for different fishing scenarios

### 🤖 **Intelligent AI Assistant**
- **24/7 chat support** powered by Google Gemini
- **Personalized fishing advice** based on conditions
- **Multi-language interaction** (English/Tamil)
- **Context-aware responses** for fishing-related queries

### 🌐 **Multi-Language Support**
- **Complete Tamil localization** with 120+ translated terms
- **Seamless language switching** throughout the application
- **Cultural adaptation** for local fishing communities
- **Audio support** for non-literate users

---

## 🛠️ Technology Stack

### **Frontend Framework**
- **Next.js 15.3.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom glass morphism effects

### **UI Components**
- **shadcn/ui** - Accessible component library
- **Lucide React** - Modern icon system
- **Radix UI** - Primitive components for accessibility

### **AI & Data Services**
- **Google Gemini AI** - Advanced language model integration
- **Google Maps Platform** - Interactive mapping and Places API
- **Genkit Framework** - AI flow orchestration

### **Backend & Authentication**
- **Firebase Authentication** - Secure user management
- **Firebase Hosting** - Scalable deployment platform
- **Next.js API Routes** - Serverless backend functions

### **Development Tools**
- **ESLint** - Code quality enforcement
- **TypeScript** - Static type checking
- **Turbopack** - Next-generation bundler for development

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Firebase** project with Authentication enabled
- **Google Cloud** project with Maps and Gemini API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shreesh-Sree/fishermate.git
   cd fishermate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   ```

4. **Development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:9002` to see the application.

5. **AI Development (Optional)**
   ```bash
   npm run genkit:dev
   ```
   Access Genkit developer UI for AI flow testing.

---

## 📱 Application Architecture

### **Page Structure**
```
🏠 Home Page          - Landing page with feature overview
📊 Dashboard          - Weather analytics and fishing insights
🗺️ Map               - Interactive fishing location mapping
⚖️ Laws              - Legal compliance and regulations
🛡️ Safety            - Safety guidelines and protocols
💬 Chat              - AI assistant conversation interface
🔐 Login             - Authentication and user management
```

### **Component Hierarchy**
- **Header** - Navigation with glass morphism design
- **Protected Routes** - Authentication-gated pages
- **Theme Provider** - Dark/light mode support
- **Language Context** - Multi-language state management
- **Auth Context** - User authentication state

---

## 🌟 Design Philosophy

### **Glass Morphism UI**
- **Gaussian blur effects** with `backdrop-filter: blur(20px)`
- **Translucent surfaces** with rgba transparency layers
- **Depth through shadows** and subtle borders
- **Smooth animations** and hover interactions

### **Responsive Design**
- **Mobile-first approach** with hamburger navigation
- **Adaptive layouts** for all screen sizes
- **Touch-friendly interactions** for mobile devices
- **Progressive enhancement** for desktop features

### **Accessibility**
- **Screen reader compatibility** with proper ARIA labels
- **Keyboard navigation** support throughout
- **High contrast ratios** for readability
- **Text-to-speech integration** for audio accessibility

---

## 🔧 Development Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint code analysis
npm run typecheck    # TypeScript type checking
npm run genkit:dev   # Start AI development environment
npm run genkit:watch # AI development with hot reload
```

---

## 🌍 Deployment

### **Vercel (Recommended)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Shreesh-Sree/fishermate)

### **Firebase Hosting**
```bash
npm run build
firebase deploy
```

### **Environment Variables**
Ensure all required environment variables are configured in your deployment platform:
- Firebase configuration
- Google Maps API key
- Google Gemini AI API key

---

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- **Code standards** and formatting
- **Pull request process** and review
- **Issue reporting** and feature requests
- **Development workflow** and best practices

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Maps Platform** - Mapping and location services
- **Google Gemini AI** - Advanced language model capabilities
- **Firebase** - Authentication and hosting infrastructure
- **Next.js Team** - React framework and development tools
- **shadcn/ui** - Beautiful and accessible UI components
- **Coastal Fishing Communities** - Inspiration and feedback

---

## 📞 Support & Contact

- **Documentation**: [Wiki Pages](https://github.com/Shreesh-Sree/fishermate/wiki)
- **Issues**: [GitHub Issues](https://github.com/Shreesh-Sree/fishermate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Shreesh-Sree/fishermate/discussions)
- **Email**: support@fishermate.ai

---

<div align="center">

**Made with ❤️ by Team QuarkVerse**

*Empowering fishing communities through intelligent technology*

</div>
