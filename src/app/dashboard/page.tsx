"use client";

import { WeatherCard } from "@/components/WeatherCard";
import FishingAnalyticsCard from "@/components/FishingAnalyticsCard";
import { Header } from "@/components/Header";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <WeatherCard />
          <FishingAnalyticsCard />
        </div>
      </main>
    </div>
  );
}
