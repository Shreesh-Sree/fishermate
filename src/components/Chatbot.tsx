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
    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    try {
      const response = await handleChat({
        message: values.message,
        history: messages,
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
    <Card className="shadow-lg h-[44rem] flex flex-col">
       <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          AI Assistant
        </CardTitle>
        <CardDescription>Ask me anything!</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
             {messages.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
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
                  <div className="p-2 bg-primary rounded-full text-primary-foreground">
                    <Bot size={18} />
                  </div>
                )}
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-xs",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === "user" && (
                  <div className="p-2 bg-muted rounded-full">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary rounded-full text-primary-foreground">
                    <Bot size={18} />
                  </div>
                <div className="p-3 rounded-lg bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Ask me anything..."
                        autoComplete="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
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