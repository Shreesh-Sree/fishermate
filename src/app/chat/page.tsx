"use client";

import { Chatbot } from "@/components/Chatbot";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Bot } from "lucide-react";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-background gradient-bg">
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-block bg-primary/10 p-4 rounded-2xl mb-4">
                  <Bot className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-4 tracking-tight">
                AI Assistant
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Ask me anything about fishing regulations, weather, safety, or best practices.
              </p>
            </div>
            <div className="modern-card p-0">
              <Chatbot />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
