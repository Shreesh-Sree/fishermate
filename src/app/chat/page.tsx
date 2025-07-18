"use client";

import { Header } from "@/components/Header";
import { Chatbot } from "@/components/Chatbot";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <Header />
        <main className="flex-1 container mx-auto p-2 sm:p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-2 sm:mb-4">
                FisherMate AI Assistant
              </h1>
              <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Get instant answers about fishing regulations, weather conditions, safety tips, and more from our intelligent AI assistant.
              </p>
            </div>
            <Chatbot />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
