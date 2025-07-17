"use client";

import { SafetyTips } from "@/components/SafetyTips";
import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SafetyPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <SafetyTips />
        </main>
      </div>
    </ProtectedRoute>
  );
}
