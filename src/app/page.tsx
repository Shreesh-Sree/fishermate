"use client";

import { Header } from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { MapPin, CloudSun, Shield, Scale, BarChart3, MessageCircle } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      title: "Interactive Map",
      description: "Explore fishing spots and marine areas with real-time location tracking and points of interest.",
      icon: MapPin,
      href: "/map",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Weather Dashboard",
      description: "Get comprehensive weather data, forecasts, and fishing analytics powered by AI.",
      icon: CloudSun,
      href: "/dashboard",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Fishing Laws & Regulations",
      description: "AI-powered legal assistant for fishing regulations and compliance information.",
      icon: Scale,
      href: "/laws",
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Safety Tips & Guidelines",
      description: "Essential safety information and best practices for marine activities.",
      icon: Shield,
      href: "/safety",
      color: "from-red-500 to-orange-500"
    },
    {
      title: "AI Assistant",
      description: "Chat with our intelligent AI assistant for personalized fishing advice and support.",
      icon: MessageCircle,
      href: "/chat",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 px-4 md:px-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-teal-500/10"></div>
          <div className="relative max-w-6xl mx-auto">
            <h1 className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-8 tracking-tight leading-tight animate-fade-in">
              FisherMate.AI
            </h1>
            <p className="text-2xl lg:text-3xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-12 animate-slide-in">
              Your intelligent fishing companion powered by AI and real-time data
            </p>
            
            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur rounded-full shadow-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-700">Live Weather Data</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur rounded-full shadow-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-700">Real-time Maps</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur rounded-full shadow-lg">
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-700">AI Assistant</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <BarChart3 className="w-6 h-6" />
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 md:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-16">
              Explore Our Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group modern-card p-8 hover:shadow-2xl transition-all duration-300"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:gap-3 transition-all duration-300">
                    Explore Feature
                    <span className="ml-2 group-hover:ml-0 transition-all duration-300">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
              Why Choose FisherMate.AI?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="modern-card p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Location</h3>
                <p className="text-gray-600">AI-powered location intelligence for the best fishing experiences</p>
              </div>
              <div className="modern-card p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CloudSun className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Real-time Data</h3>
                <p className="text-gray-600">Live weather, water conditions, and environmental data</p>
              </div>
              <div className="modern-card p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Safety First</h3>
                <p className="text-gray-600">Comprehensive safety guidelines and legal compliance</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="text-center p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} FisherMate.AI. All rights reserved.</p>
          <p className="text-gray-500 text-xs mt-2">Powered by Google Maps Platform & Advanced AI</p>
        </div>
      </footer>
    </div>
  );
}
