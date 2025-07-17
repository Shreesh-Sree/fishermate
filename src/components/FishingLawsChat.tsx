
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookText, Search, Loader2, Volume2, Pause, Lightbulb } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { indianStates } from "@/lib/data";
import { handleFishingLaws } from "@/app/actions";
import type { SummarizeFishingLawsOutput } from "@/ai/flows/summarize-fishing-laws";
import { useLanguage } from "@/context/LanguageContext";

const prebuiltQuestions = [
  "What are the seasonal fishing bans and restrictions?",
  "What are the regulations for using fishing nets?",
  "What licenses are required for commercial fishing?",
  "What are the minimum catch size requirements?",
  "What are the restricted fishing zones and marine protected areas?",
  "What penalties exist for illegal fishing practices?",
  "What are the deep-sea fishing regulations?",
  "What equipment restrictions apply to fishing boats?",
];

const fishingLawsSchema = z.object({
  query: z.string().min(3, { message: "Please enter a question (minimum 3 characters)." }),
  state: z.string().min(1, { message: "Please select a state." }),
});

export function FishingLawsChat() {
  const { t } = useLanguage();
  const [result, setResult] = useState<SummarizeFishingLawsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof fishingLawsSchema>>({
    resolver: zodResolver(fishingLawsSchema),
    defaultValues: {
      query: "",
      state: "",
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


  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    form.setValue("query", question);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
  
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        toast({
          variant: "destructive",
          title: "Audio Error",
          description: "Failed to play audio. Please try again.",
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  async function onSubmit(values: z.infer<typeof fishingLawsSchema>) {
    // Additional validation to prevent null values
    const state = values.state?.trim();
    const query = values.query?.trim();
    
    if (!state || !query) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a state and enter a question.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    stopAndResetAudio();

    try {
      console.log("Submitting fishing laws query:", { state, query });
      
      const response = await handleFishingLaws({
        state: state,
        query: query,
      });
      
      console.log("Received response:", response);
      
      if (response?.summary) {
        setResult(response);
        
        // Handle audio setup with better error handling
        if (response.audio) {
          try {
            const audio = new Audio(response.audio);
            audio.setAttribute('playsinline', 'true');
            audio.addEventListener('ended', () => setIsPlaying(false));
            audio.addEventListener('error', (e) => {
              console.warn("Audio failed to load:", e);
              // Don't show error toast for audio issues, just continue without audio
            });
            audioRef.current = audio;
          } catch (audioError) {
            console.warn("Audio setup failed:", audioError);
            // Continue without audio
          }
        }
        
        toast({
          title: "Success",
          description: "Fishing laws information retrieved successfully.",
        });
      } else {
        throw new Error("No summary received from the server");
      }
    } catch (error) {
      console.error("Error fetching fishing laws:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error 
          ? `Failed to fetch fishing laws: ${error.message}` 
          : "Failed to fetch fishing laws summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="modern-card animate-fade-in hover-lift">
      <CardContent className="p-0 h-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center gap-3">
            <BookText className="w-6 h-6 text-white animate-float" />
            <div>
              <h3 className="text-lg font-bold animate-shimmer">{t('fishing_laws_title')}</h3>
              <p className="text-blue-100 text-sm">{t('fishing_laws_description')}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('state_label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400">
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
                      <FormLabel className="text-sm font-medium text-gray-700">{t('question_label')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('fishing_laws_query_placeholder')} 
                          {...field}
                          value={selectedQuestion || field.value}
                          onChange={(e) => {
                            setSelectedQuestion("");
                            field.onChange(e);
                          }}
                          className="rounded-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Prebuilt Questions Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Quick Questions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prebuiltQuestions.map((question, index) => (
                    <Badge
                      key={index}
                      variant={selectedQuestion === question ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-blue-600 hover:text-white transition-colors text-xs px-2 py-1 bg-blue-100 text-blue-800"
                      onClick={() => handleQuestionSelect(question)}
                    >
                      {question}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !form.watch("state") || !form.watch("query")?.trim()} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-2 animate-glow"
              >
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
              <div className="mt-4 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-blue-100">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
                <p className="text-blue-700">{t('fetching_summary')}...</p>
              </div>
          )}
          
          {result && !isLoading && (
            <div className="mt-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 animate-slide-in-right">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-blue-800 flex items-center gap-2">
                  <BookText className="w-4 h-4" />
                  {t('ai_summary_title')}
                </h4>
                {result.audio && (
                  <Button variant="outline" size="icon" onClick={togglePlay} aria-label={isPlaying ? 'Pause audio' : 'Play audio'} className="border-blue-200 hover:bg-blue-50">
                    {isPlaying ? <Pause className="h-4 w-4 text-blue-600" /> : <Volume2 className="h-4 w-4 text-blue-600" />}
                  </Button>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{result.summary}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
