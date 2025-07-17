"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Languages, Loader2, Wand2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { indianLanguages } from "@/lib/data";
import { handleSafetyTips } from "@/app/actions";
import type { TranslateSafetyPracticesOutput } from "@/ai/flows/translate-safety-practices";

const safetyTipsSchema = z.object({
  query: z.string().min(10, { message: "Please enter a more detailed query." }),
  targetLanguage: z.string({ required_error: "Please select a language." }),
});

export function SafetyTips() {
  const [result, setResult] = useState<TranslateSafetyPracticesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof safetyTipsSchema>>({
    resolver: zodResolver(safetyTipsSchema),
    defaultValues: {
      query: "Safety measures for deep sea fishing during monsoon.",
    },
  });

  async function onSubmit(values: z.infer<typeof safetyTipsSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await handleSafetyTips(values);
      setResult(response);
    } catch (error) {
      console.error("Error fetching safety tips:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch safety guidelines. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Safety Practices
        </CardTitle>
        <CardDescription>Get safety guidelines in your local language.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Safety Query</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., What to do if the boat engine fails?" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {indianLanguages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Get Guidelines
            </Button>
          </form>
        </Form>
        {result && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-bold font-headline text-primary flex items-center gap-2 mb-2"><Languages size={18}/> Translated Query</h4>
            <p className="mb-4 text-sm italic">"{result.translation}"</p>
            <h4 className="font-bold font-headline text-primary flex items-center gap-2 mb-2"><Shield size={18} /> Safety Guidelines</h4>
            <p className="whitespace-pre-wrap text-sm">{result.safetyGuidelines}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
