
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookText, Search, Loader2, Volume2, Pause } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { indianStates } from "@/lib/data";
import { handleFishingLaws } from "@/app/actions";
import type { SummarizeFishingLawsOutput } from "@/ai/flows/summarize-fishing-laws";
import { useLanguage } from "@/context/LanguageContext";

const fishingLawsSchema = z.object({
  query: z.string().min(10, { message: "Please enter a specific question." }),
  state: z.string({ required_error: "Please select a state." }),
});

export function FishingLawsChat() {
  const { t } = useLanguage();
  const [result, setResult] = useState<SummarizeFishingLawsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof fishingLawsSchema>>({
    resolver: zodResolver(fishingLawsSchema),
    defaultValues: {
      query: "What are the regulations for using fishing nets?",
    },
  });
  
  const stopAndResetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    // Cleanup audio on component unmount
    return () => {
      stopAndResetAudio();
    };
  }, []);


  const togglePlay = () => {
    if (!audioRef.current) return;
  
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  async function onSubmit(values: z.infer<typeof fishingLawsSchema>) {
    setIsLoading(true);
    setResult(null);
    stopAndResetAudio();

    try {
      const response = await handleFishingLaws(values);
      setResult(response);
      if (response.audio) {
        const audio = new Audio(response.audio);
        audio.setAttribute('playsinline', 'true');
        audio.addEventListener('ended', () => setIsPlaying(false));
        audioRef.current = audio;
      }
    } catch (error) {
      console.error("Error fetching fishing laws:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch fishing laws summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BookText className="w-6 h-6 text-primary" />
          {t('fishing_laws_title')}
        </CardTitle>
        <CardDescription>{t('fishing_laws_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('state_label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_state_placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('question_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fishing_laws_query_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {t('get_summary_button')}
            </Button>
          </form>
        </Form>
        {isLoading && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-center justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p>{t('ai_summary_title')}...</p>
            </div>
        )}
        {result && !isLoading && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold font-headline text-primary">{t('ai_summary_title')}</h4>
              {result.audio && (
                <Button variant="outline" size="icon" onClick={togglePlay} aria-label={isPlaying ? 'Pause audio' : 'Play audio'}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm">{result.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
