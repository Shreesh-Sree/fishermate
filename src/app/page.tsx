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
    <div className="min-h-screen bg-background gradient-bg">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 px-4 md:px-8 text-center">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-gradient mb-8 tracking-tight leading-tight animate-fade-in">
              FisherMate.AI
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
              Your intelligent fishing companion powered by AI and real-time data
            </p>
            
            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <div className="glass-card-sm px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="status-online"></div>
                  <span className="font-medium text-foreground">Live Weather Data</span>
                </div>
              </div>
              <div className="glass-card-sm px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="status-online"></div>
                  <span className="font-medium text-foreground">Real-time Maps</span>
                </div>
              </div>
              <div className="glass-card-sm px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="status-online"></div>
                  <span className="font-medium text-foreground">AI Assistant</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg rounded-xl shadow-soft hover:scale-[1.02] transition-all duration-200 focus-ring"
            >
              <BarChart3 className="w-6 h-6" />
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-16">
              Explore Our Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group modern-card hover:scale-[1.02] transition-all duration-300 focus-ring"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all duration-300">
                    Explore Feature
                    <span className="ml-2 group-hover:ml-0 transition-all duration-300">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-4 md:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
              Why Choose FisherMate.AI?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="glass-card-sm p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Smart Location</h3>
                <p className="text-muted-foreground">AI-powered location intelligence for the best fishing experiences</p>
              </div>
              <div className="glass-card-sm p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CloudSun className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Real-time Data</h3>
                <p className="text-muted-foreground">Live weather, water conditions, and environmental data</p>
              </div>
              <div className="glass-card-sm p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Safety First</h3>
                <p className="text-muted-foreground">Comprehensive safety guidelines and legal compliance</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="text-center p-8 bg-muted/20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} FisherMate.AI - Made with ❤️ by QuarkVerse. All rights reserved.</p>
          <p className="text-muted-foreground text-xs mt-2">Powered by Google Maps Platform & Google Gemini</p>
        </div>
      </footer>
    </div>
  );
}
