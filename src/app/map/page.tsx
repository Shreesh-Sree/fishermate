"use client";

import GoogleMapCard from "@/components/GoogleMapCard";
import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MapPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <Header />
        <main className="flex-1 container mx-auto p-2 sm:p-4 md:p-8 pt-28 sm:pt-32">
          <div className="h-[calc(100vh-180px)] sm:h-[calc(80vh-120px)]">
            <GoogleMapCard />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
