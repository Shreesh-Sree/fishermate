"use client";

import { SafetyTips } from "@/components/SafetyTips";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Shield } from "lucide-react";

export default function SafetyPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <main className="flex-1 container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-block bg-primary/10 p-4 rounded-2xl mb-4">
                        <Shield className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-4 tracking-tight">
                        Safety Tips & Guidelines
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Your guide to staying safe on the water. Essential information for every angler.
                    </p>
                </div>
                <div className="modern-card">
                    <SafetyTips />
                </div>
            </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
