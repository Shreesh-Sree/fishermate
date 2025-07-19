
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookText, Search, Loader2, Volume2, Pause, Lightbulb, Languages, VolumeX, Speaker } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { indianStates } from "@/utils/data";
import { handleFishingLaws } from "@/app/actions";
import type { SummarizeFishingLawsOutput } from "@/ai/flows/summarize-fishing-laws";
import { useLanguage } from "@/context/LanguageContext";

const prebuiltQuestions = {
  en: [
    "What are the seasonal fishing bans and restrictions?",
    "What are the regulations for using fishing nets?",
    "What licenses are required for commercial fishing?",
    "What are the minimum catch size requirements?",
    "What are the restricted fishing zones and marine protected areas?",
    "What penalties exist for illegal fishing practices?",
    "What are the deep-sea fishing regulations?",
    "What equipment restrictions apply to fishing boats?",
  ],
  ta: [
    "பருவகால மீன்பிடி தடைகள் மற்றும் கட்டுப்பாடுகள் என்ன?",
    "மீன்பிடி வலைகளைப் பயன்படுத்துவதற்கான விதிமுறைகள் என்ன?",
    "வணிக மீன்பிடிக்கு என்ன உரிமங்கள் தேவை?",
    "குறைந்தபட்ச பிடி அளவு தேவைகள் என்ன?",
    "தடைசெய்யப்பட்ட மீன்பிடி மண்டலங்கள் மற்றும் கடல் பாதுகாக்கப்பட்ட பகுதிகள் என்ன?",
    "சட்டவிரோத மீன்பிடி நடைமுறைகளுக்கு என்ன தண்டனைகள் உள்ளன?",
    "ஆழ்கடல் மீன்பிடி விதிமுறைகள் என்ன?",
    "மீன்பிடி படகுகளுக்கு என்ன உபகரண கட்டுப்பாடுகள் பொருந்தும்?",
  ],
};

const fishingLawsSchema = z.object({
  query: z.string().min(3, { message: "Please enter a question (minimum 3 characters)." }),
  state: z.string().min(1, { message: "Please select a state." }),
});

export function FishingLawsChat() {
  const { t, locale } = useLanguage();
  const [result, setResult] = useState<SummarizeFishingLawsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [currentTab, setCurrentTab] = useState("questions");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof fishingLawsSchema>>({
    resolver: zodResolver(fishingLawsSchema),
    defaultValues: {
      query: "",
      state: "",
    },
  });

  // Check if speech synthesis is supported
  useEffect(() => {
    setIsSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);
  
  const stopAndResetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
      audioRef.current = null;
    }
    // Stop speech synthesis if playing
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
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

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    form.setValue("state", state);
  };

  const handleQuickSubmit = () => {
    if (!selectedState || !selectedQuestion) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a state and a question.",
      });
      return;
    }

    form.setValue("state", selectedState);
    form.setValue("query", selectedQuestion);
    
    onSubmit({
      state: selectedState,
      query: selectedQuestion
    });
  };

  const togglePlay = () => {
    if (audioRef.current) {
      // Use server-generated audio if available
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
    } else if (isSpeechSupported && result?.summary) {
      // Use browser speech synthesis as fallback
      toggleSpeech();
    }
  };

  const toggleSpeech = () => {
    if (!isSpeechSupported || !result?.summary) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(result.summary);
      utterance.lang = locale === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          variant: "destructive",
          title: "Speech Error",
          description: "Failed to play speech. Please try again.",
        });
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
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
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card className="glass-effect border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <BookText className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            {t('fishing_laws_title')}
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            {t('fishing_laws_description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-effect">
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">{t("quick_questions")}</span>
                <span className="sm:hidden">{t("questions")}</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">{t("custom_query")}</span>
                <span className="sm:hidden">{t("custom")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {t('state_label')}
                  </label>
                  <Select onValueChange={handleStateSelect} value={selectedState}>
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder={t('select_state_placeholder')} />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-white/20 max-h-[200px]">
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state} className="hover:bg-white/10">
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">
                      {t("select_question")}:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {prebuiltQuestions[locale as keyof typeof prebuiltQuestions].map((question, index) => (
                      <Badge
                        key={index}
                        variant={selectedQuestion === question ? "default" : "secondary"}
                        className="cursor-pointer glass-button-outline text-xs p-3 h-auto text-left justify-start hover:bg-blue-500/20 transition-colors"
                        onClick={() => handleQuestionSelect(question)}
                      >
                        {question}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleQuickSubmit}
                  disabled={isLoading || !selectedState || !selectedQuestion} 
                  className="glass-button-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('fetching_summary')}
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      {t('get_summary_button')}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{t('state_label')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-input">
                                <SelectValue placeholder={t('select_state_placeholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-effect border-white/20 max-h-[200px]">
                              {indianStates.map((state) => (
                                <SelectItem key={state} value={state} className="hover:bg-white/10">
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
                          <FormLabel className="text-sm font-medium">{t('question_label')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('fishing_laws_query_placeholder')} 
                              {...field}
                              value={selectedQuestion || field.value}
                              onChange={(e) => {
                                setSelectedQuestion("");
                                field.onChange(e);
                              }}
                              className="glass-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || !form.watch("state") || !form.watch("query")?.trim()} 
                    className="glass-button-primary w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('fetching_summary')}
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        {t('get_summary_button')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card className="glass-effect border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-gray-300">{t('fetching_summary')}...</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && !isLoading && (
        <Card className="glass-effect border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <BookText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-white text-lg">{t('ai_summary_title')}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {(result.audio || isSpeechSupported) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={togglePlay} 
                      aria-label={isPlaying ? t('pause_audio') : t('play_audio')} 
                      className="glass-button-outline flex items-center gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span className="hidden sm:inline">{t('pause_audio')}</span>
                        </>
                      ) : (
                        <>
                          {result.audio ? (
                            <Volume2 className="h-4 w-4" />
                          ) : (
                            <Speaker className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">{t('play_audio')}</span>
                        </>
                      )}
                    </Button>
                  )}
                  {!result.audio && !isSpeechSupported && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <VolumeX className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('audio_not_supported')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="glass-card-sm p-4 md:p-6">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {result.summary}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
