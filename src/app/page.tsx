"use client";

import { Header } from "@/components/Header";
import { WeatherCard } from "@/components/WeatherCard";
import { SafetyTips } from "@/components/SafetyTips";
import { FishingLawsChat } from "@/components/FishingLawsChat";
import { Chatbot } from "@/components/Chatbot";
import { MapCard } from "@/components/MapCard";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-3 tracking-tight">
            Your AI Guide on the High Seas
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            Instant, multilingual information on fishing laws, safety practices, and real-time weather alerts, designed for fisherfolk communities.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <WeatherCard />
            <FishingLawsChat />
            <SafetyTips />
          </div>
          <div className="space-y-8">
             <MapCard />
             <Chatbot />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-muted-foreground text-sm border-t">
        <p>&copy; {new Date().getFullYear()} SeaGuide AI. All rights reserved.</p>
      </footer>
    </div>
  );
}