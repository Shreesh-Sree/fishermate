"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Send, Loader2, User, Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleChat } from "@/app/actions";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "model";
  content: string;
};

const chatSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  async function onSubmit(values: z.infer<typeof chatSchema>) {
    setIsLoading(true);
    const userMessage: Message = { role: "user", content: values.message };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    form.reset();

    try {
      const response = await handleChat({
        message: values.message,
        history: newMessages, // Send all messages
      });

      const modelMessage: Message = { role: "model", content: response.content };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "model",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="modern-card-tall flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          AI Assistant
        </CardTitle>
        <CardDescription>Ask me anything about fishing!</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Start a conversation by typing a message below.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "model" && (
                  <div className="p-2 glass-button-outline rounded-full">
                    <Bot size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-xs",
                    message.role === "user"
                      ? "glass-button-primary text-white"
                      : "glass-card-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="p-2 glass-button-outline rounded-full">
                    <User size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="p-2 glass-button-outline rounded-full">
                  <Bot size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="p-3 rounded-lg glass-card-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border/50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Ask me anything about fishing..."
                        autoComplete="off"
                        disabled={isLoading}
                        className="glass-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isLoading} className="glass-button-primary">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
