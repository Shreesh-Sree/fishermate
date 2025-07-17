"use client";

import { Header } from "@/components/Header";
import { Chatbot } from "@/components/Chatbot";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
                FisherMate AI Assistant
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
