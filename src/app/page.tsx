"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { MapPin, CloudSun, Shield, Scale, BarChart3, MessageCircle, LifeBuoy, Download, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      title: "Interactive Map",
      description: "Explore fishing spots, track your location, and discover points of interest in real-time.",
      icon: MapPin,
      href: "/map",
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Weather Dashboard",
      description: "Access AI-powered forecasts, and fishing analytics to plan your perfect trip.",
      icon: CloudSun,
      href: "/dashboard",
      color: "from-green-500 to-emerald-400"
    },
    {
      title: "Fishing Laws",
      description: "Navigate complex fishing regulations with our AI-powered legal assistant.",
      icon: Scale,
      href: "/laws",
      color: "from-purple-500 to-violet-400"
    },
    {
      title: "Safety Guidelines",
      description: "Stay safe on the water with essential safety information and best practices.",
      icon: Shield,
      href: "/safety",
      color: "from-red-500 to-orange-400"
    },
    {
      title: "AI Assistant",
      description: "Chat with our intelligent AI for personalized fishing advice and real-time support.",
      icon: MessageCircle,
      href: "/chat",
      color: "from-indigo-500 to-purple-400"
    },
    {
        title: "Emergency SOS",
        description: "Instantly alert emergency contacts and authorities with your location.",
        icon: LifeBuoy,
        href: "/dashboard", // SOS is on the dashboard
        color: "from-pink-500 to-rose-400"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-background gradient-bg text-foreground overflow-x-hidden">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 px-4 md:px-8 text-center animate-fade-in">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-background dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]"></div>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-gradient mb-6 tracking-tighter leading-tight">
              FisherMate.AI
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
              Your intelligent fishing companion for safer, smarter, and more successful trips on the water.
            </p>
            
            <div className="flex justify-center items-center gap-4">
                <Link href={user ? "/dashboard" : "/login"}>
                    <Button size="lg" className="gap-2 px-8 py-6 text-lg font-semibold shadow-soft hover:scale-[1.03] transition-transform duration-300">
                        {user ? "Go to Dashboard" : "Get Started"}
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </Link>
                <Link href="/about">
                    <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold bg-background/50 backdrop-blur-sm hover:scale-[1.03] transition-transform duration-300">
                        Learn More
                    </Button>
                </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-blue-500 font-semibold">Our Features</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-2">
                Everything You Need for a Great Day on the Water
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                    From real-time data to AI-powered assistance, we've got you covered.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group modern-card hover:border-primary/50 hover:-translate-y-2 focus-ring"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About/Why Section */}
        <section className="py-20 px-4 md:px-8 bg-muted/40 dark:bg-muted/10">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Why Choose FisherMate.AI?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
                We combine cutting-edge technology with a passion for fishing to create an indispensable tool for anglers of all levels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="glass-card-sm p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered Intelligence</h3>
                <p className="text-muted-foreground text-sm">Get predictive insights on the best times and locations to fish, all powered by advanced AI models.</p>
              </div>
              <div className="glass-card-sm p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
                  <CloudSun className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">All-in-One Data Hub</h3>
                <p className="text-muted-foreground text-sm">Access live weather, water conditions, maps, and legal information in a single, easy-to-use interface.</p>
              </div>
              <div className="glass-card-sm p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Uncompromised Safety</h3>
                <p className="text-muted-foreground text-sm">With SOS features and up-to-date safety guidelines, we prioritize your well-being on every trip.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="text-center p-8 border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} FisherMate.AI. All rights reserved.</p>
          <p className="text-sm text-muted-foreground/80 mt-2">
            Made with ❤️ by QuarkVerse, powered by Google Cloud and Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
