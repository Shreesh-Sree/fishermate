"use client";

import { Header } from "@/components/Header";
import { WeatherCard } from "@/components/WeatherCard";
import { SafetyTips } from "@/components/SafetyTips";
import { FishingLawsChat } from "@/components/FishingLawsChat";
import { Chatbot } from "@/components/Chatbot";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-3 tracking-tight">
            {t('home_title')}
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            {t('home_subtitle')}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <WeatherCard />
            <FishingLawsChat />
            <SafetyTips />
          </div>
          <div className="flex h-full">
             <Chatbot />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-muted-foreground text-sm border-t">
        <p>&copy; {new Date().getFullYear()} FisherMate.AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
