"use client";

import GoogleMapCard from "@/components/GoogleMapCard";
import { Header } from "@/components/Header";

export default function MapPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="h-[80vh]">
          <GoogleMapCard />
        </div>
      </main>
    </div>
  );
}
