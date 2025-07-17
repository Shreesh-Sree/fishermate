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
import { useLanguage } from "@/context/LanguageContext";

const safetyTipsSchema = z.object({
  query: z.string().min(10, { message: "Please enter a more detailed query." }),
  targetLanguage: z.string({ required_error: "Please select a language." }),
});

export function SafetyTips() {
  const { t } = useLanguage();
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
    <Card className="modern-card animate-fade-in hover-lift">
      <CardContent className="p-0 h-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-4 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white animate-float" />
            <div>
              <h3 className="text-lg font-bold animate-shimmer">{t('safety_practices_title')}</h3>
              <p className="text-orange-100 text-sm">{t('safety_practices_description')}</p>
            </div>
          </div>
        </div>
        {/* Content Section */}
        <div className="p-4 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">{t('safety_query_label')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('safety_query_placeholder')} 
                        {...field} 
                        rows={3}
                        className="resize-none rounded-lg border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      />
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
                    <FormLabel className="text-sm font-medium text-gray-700">{t('language_label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-gray-200 focus:border-orange-400 focus:ring-orange-400">
                          <SelectValue placeholder={t('select_language_placeholder')} />
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
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg py-2 animate-glow"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {t('get_guidelines_button')}
              </Button>
            </form>
          </Form>
          
          {result && (
            <div className="mt-4 p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100 animate-slide-in-left">
              <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                <Languages className="w-4 h-4" /> 
                {t('translated_query_title')}
              </h4>
              <p className="mb-3 text-sm italic text-orange-700">"{result.translation}"</p>
              <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" /> 
                {t('safety_guidelines_title')}
              </h4>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{result.safetyGuidelines}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
