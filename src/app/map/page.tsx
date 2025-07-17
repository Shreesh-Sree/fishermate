"use client";

import { MapCard } from "@/components/MapCard";
import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MapPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="h-[80vh]">
            <MapCard />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
