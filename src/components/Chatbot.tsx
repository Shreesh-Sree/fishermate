"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, User, Bot, CornerDownLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleChat } from "@/app/actions";
import { cn } from "@/utils/utils";
import { useLanguage } from "@/context/LanguageContext";

type Message = {
  role: "user" | "model";
  content: string;
};

const chatSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

export function Chatbot() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function onSubmit(values: z.infer<typeof chatSchema>) {
    setIsLoading(true);
    const userMessage: Message = { role: "user", content: values.message };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    try {
      const response = await handleChat({
        message: values.message,
        history: [...messages, userMessage],
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
    <div className="flex flex-col h-[80vh] bg-background/50 rounded-2xl">
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">How can I help you today?</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 max-w-[85%]",
                message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn("p-2 rounded-full bg-primary/10", message.role === 'user' ? 'bg-blue-500/10' : 'bg-primary/10')}>
                {message.role === "model" ? <Bot size={18} className="text-primary" /> : <User size={18} className="text-blue-500" />}
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl",
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot size={18} className="text-primary" />
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border/20 bg-background/80 rounded-b-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Ask about fishing spots, regulations, or weather..."
                      autoComplete="off"
                      disabled={isLoading}
                      className="h-12 pr-12 rounded-full bg-muted"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading} 
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full w-9 h-9"
              aria-label={isLoading ? "Loading" : "Send message"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
