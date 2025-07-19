"use client";

import { FishingLawsChat } from "@/components/FishingLawsChat";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Scale } from "lucide-react";

export default function LawsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <main className="flex-1 container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-block bg-primary/10 p-4 rounded-2xl mb-4">
                        <Scale className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-4 tracking-tight">
                        Fishing Laws & Regulations
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Use our AI assistant to get clear, concise answers about fishing laws in your area.
                    </p>
                </div>
                <div className="modern-card p-0">
                    <FishingLawsChat />
                </div>
            </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
