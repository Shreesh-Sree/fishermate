"use client";

import GoogleMapCard from "@/components/GoogleMapCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MapPin } from "lucide-react";

export default function MapPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <main className="flex-1 flex flex-col container mx-auto py-8 px-4">
            <div className="text-center mb-8 animate-fade-in">
                <div className="inline-block bg-primary/10 p-4 rounded-2xl mb-4">
                    <MapPin className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-4 tracking-tight">
                    Interactive Fishing Map
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Explore fishing spots, see real-time data, and track your location.
                </p>
            </div>
            <div className="flex-1 h-[65vh] md:h-[70vh] modern-card p-2 md:p-4">
                <GoogleMapCard />
            </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
