"use client";

import { WeatherCard } from "@/components/WeatherCard";
import FishingAnalyticsCard from "@/components/FishingAnalyticsCard";
import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <ErrorBoundary>
              <WeatherCard />
            </ErrorBoundary>
            <ErrorBoundary>
              <FishingAnalyticsCard />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
