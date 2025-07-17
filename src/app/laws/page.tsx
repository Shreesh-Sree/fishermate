"use client";

import { FishingLawsChat } from "@/components/FishingLawsChat";
import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function LawsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <FishingLawsChat />
        </main>
      </div>
    </ProtectedRoute>
  );
}
