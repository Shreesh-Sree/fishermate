'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { useLanguage } from '@/context/LanguageContext';

interface GoogleVoiceAssistantProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
}

export function GoogleVoiceAssistant({ onTranscript, isProcessing = false }: GoogleVoiceAssistantProps) {
  const { t, locale } = useLanguage();
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    confidence
  } = useVoiceRecognition();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const animationRef = useRef<number>();
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Enhanced language detection and support
  const getLanguageConfig = () => {
    switch (locale) {
      case 'ta':
        return { 
          recognitionLang: 'ta-IN', 
          speechLang: 'ta-IN',
          voice: 'Google Tamil' 
        };
      default:
        return { 
          recognitionLang: 'en-US', 
          speechLang: 'en-US',
          voice: 'Google US English' 
        };
    }
  };

  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
    
    // Animate audio levels when listening
    if (isListening) {
      const animate = () => {
        setAudioLevel(Math.random() * 100);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevel(0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening]);

  useEffect(() => {
    if (transcript && !isListening) {
      setIsThinking(true);
      setLastCommand(transcript);
      
      // Simulate processing time like Google Assistant
      setTimeout(() => {
        onTranscript(transcript);
        clearTranscript();
        setIsThinking(false);
      }, 500);
    }
  }, [transcript, isListening, onTranscript, clearTranscript]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const handleToggleListening = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, isSpeaking, startListening, stopListening, stopSpeaking]);

  const speakText = useCallback((text: string) => {
    if (!speechSupported || isSpeaking) return;

    // Cancel any existing speech
    speechSynthesis.cancel();

    const langConfig = getLanguageConfig();
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = langConfig.speechLang;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Try to select the best voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') && voice.lang.startsWith(locale)
    ) || voices.find(voice => voice.lang.startsWith(locale));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [speechSupported, isSpeaking, locale]);

  // Auto-enable Google Translate if available
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.translate) {
      console.log('Google Translate integration ready');
    }
  }, []);

  // Test voice assistant functionality
  const testVoiceAssistant = () => {
    if (speechSupported) {
      speakText("Voice assistant is working! You can now use voice commands.");
    } else {
      alert("Speech synthesis is not supported in this browser.");
    }
  };

  if (!isSupported) {
    return (
      <Card className="glass-effect border-amber-200/50 dark:border-amber-500/30">
        <CardContent className="p-4 text-center space-y-3">
          <div className="p-3 rounded-xl bg-amber-100/50 dark:bg-amber-900/20">
            <Mic className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto" />
          </div>
          <p className="text-sm text-enhanced text-amber-700 dark:text-amber-300">
            Voice features need Chrome, Edge, or Safari
          </p>
          <Badge variant="outline" className="text-xs">
            🌐 Try enabling Google Translate for instant translations
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Voice Control */}
      <div className="flex items-center justify-center">
        <div className="relative">
          {/* Animated Ring */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isListening ? 'animate-ping bg-blue-400/30' : 'bg-transparent'
            }`} 
            style={{ 
              animationDuration: '2s',
              transform: `scale(${1 + (audioLevel / 200)})` 
            }}
          />
          
          {/* Main Button */}
          <Button
            onClick={handleToggleListening}
            disabled={isProcessing || isThinking}
            size="icon"
            className={`relative w-16 h-16 rounded-full transition-all duration-300 touch-target ${
              isListening 
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25" 
                : isSpeaking
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
            }`}
          >
            {isThinking ? (
              <Brain className="h-6 w-6 text-white animate-pulse" />
            ) : isListening ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : isSpeaking ? (
              <Volume2 className="h-6 w-6 text-white animate-pulse" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Status Display */}
      <div className="text-center space-y-2">
        {isListening && (
          <div className="space-y-2">
            <Badge variant="default" className="bg-blue-500 text-white px-3 py-1">
              🎤 Listening...
            </Badge>
            <Progress value={audioLevel} className="h-1 w-32 mx-auto" />
          </div>
        )}
        
        {isThinking && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-3 py-1">
            <Brain className="w-3 h-3 mr-1" />
            Processing...
          </Badge>
        )}
        
        {isSpeaking && (
          <div className="space-y-1">
            <Badge variant="default" className="bg-green-500 text-white px-3 py-1">
              🔊 Speaking...
            </Badge>
            <Button
              onClick={stopSpeaking}
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
            >
              <VolumeX className="w-3 h-3 mr-1" />
              Stop
            </Button>
          </div>
        )}

        {lastCommand && !isListening && !isThinking && (
          <div className="text-xs text-muted-foreground max-w-xs mx-auto p-2 bg-muted/50 rounded-lg">
            "{lastCommand}"
            {confidence && confidence > 0.7 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {Math.round(confidence * 100)}% confident
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Voice Commands Help */}
      <Card className="glass-effect border-blue-200/50 dark:border-blue-500/30">
        <CardContent className="p-3">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-enhanced text-blue-600 dark:text-blue-400">
              <Zap className="w-3 h-3" />
              Quick Commands
            </div>
            <div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">Show weather</Badge>
              <Badge variant="outline" className="text-xs">Open journal</Badge>
              <Badge variant="outline" className="text-xs">Find spots</Badge>
            </div>
            {speechSupported && (
              <Button
                onClick={testVoiceAssistant}
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
              >
                🔊 Test Voice Assistant
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Translate Integration */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm('Enable Google Translate for instant translations?')) {
              // Add Google Translate script if not present
              if (!document.querySelector('script[src*="translate.google.com"]')) {
                const script = document.createElement('script');
                script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                document.head.appendChild(script);
                
                (window as any).googleTranslateElementInit = () => {
                  new (window as any).google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,ta,hi,es,fr,de,zh',
                    autoDisplay: false
                  }, 'google_translate_element');
                };
              }
            }
          }}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          🌐 Enable Google Translate
        </Button>
        <div id="google_translate_element" className="hidden" />
      </div>
    </div>
  );
}
