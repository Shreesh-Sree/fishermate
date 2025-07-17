"use client";

import GoogleMapCard from "@/components/GoogleMapCard";
import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MapPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="h-[80vh]">
            <GoogleMapCard />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
