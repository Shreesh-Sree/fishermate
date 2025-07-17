"use client";

import { Header } from "@/components/Header";
import { WeatherCard } from "@/components/WeatherCard";
import { SafetyTips } from "@/components/SafetyTips";
import { FishingLawsChat } from "@/components/FishingLawsChat";
import { PopupChatbot } from "@/components/PopupChatbot";
import GoogleMapCard from "@/components/GoogleMapCard";
import FishingAnalyticsCard from "@/components/FishingAnalyticsCard";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-headline font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-6 tracking-tight leading-tight">
              {t('home_title')}
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('home_subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live Weather Data</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Real-time Maps</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">AI Assistant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Weather & Analytics */}
          <div className="lg:col-span-1 space-y-8">
            <div className="transform hover:scale-105 transition-all duration-300 ease-out">
              <WeatherCard />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300 ease-out">
              <FishingAnalyticsCard />
            </div>
          </div>
          
          {/* Center Column - Map (Larger) */}
          <div className="lg:col-span-2">
            <div className="transform hover:scale-[1.02] transition-all duration-300 ease-out">
              <GoogleMapCard />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 max-w-7xl mx-auto">
          <div className="transform hover:scale-105 transition-all duration-300 ease-out">
            <FishingLawsChat />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300 ease-out">
            <SafetyTips />
          </div>
        </div>
        
        {/* Popup Chatbot */}
        <PopupChatbot />
      </main>
      
      <footer className="text-center p-6 mt-16 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} FisherMate.AI. All rights reserved.</p>
          <p className="text-gray-500 text-xs mt-2">Powered by Google Maps Platform & Advanced AI</p>
        </div>
      </footer>
    </div>
  );
}
