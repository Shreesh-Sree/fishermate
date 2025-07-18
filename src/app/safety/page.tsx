"use client";

import { SafetyTips } from "@/components/SafetyTips";
import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SafetyPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <Header />
        <main className="flex-1 container mx-auto p-2 sm:p-4 md:p-8 pt-28 sm:pt-32">
          <SafetyTips />
        </main>
      </div>
    </ProtectedRoute>
  );
}
