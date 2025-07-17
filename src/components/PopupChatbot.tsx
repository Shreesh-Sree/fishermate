'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function PopupChatbot() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('chatbot_welcome') || 'Hello! I\'m your FisherMate AI assistant. How can I help you with fishing today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced fishing-related responses
    if (lowerMessage.includes('weather') || lowerMessage.includes('temperature')) {
      return "Check the weather card above for current conditions! I'd recommend fishing when winds are below 15 km/h and visibility is good. Early morning and evening are typically the best times.";
    }
    
    if (lowerMessage.includes('best time') || lowerMessage.includes('when')) {
      return "The best fishing times are typically during dawn (1 hour before sunrise to 2 hours after) and dusk (2 hours before sunset to 1 hour after). Also check our Fishing Analytics for today's optimal times!";
    }
    
    if (lowerMessage.includes('bait') || lowerMessage.includes('lure')) {
      return "Bait selection depends on your target fish and location! For coastal fishing, try live shrimp, squid, or small fish. Our map shows nearby bait shops where you can get fresh supplies.";
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('spot')) {
      return "Check our interactive map above! It shows fishing spots, marinas, and bait shops near you. Look for areas with structure like reefs, piers, or drop-offs.";
    }
    
    if (lowerMessage.includes('safety') || lowerMessage.includes('danger')) {
      return "Safety first! Always check weather conditions, wear a life jacket, tell someone your plans, carry communication devices, and never fish alone in rough conditions. Check our safety tips section!";
    }
    
    if (lowerMessage.includes('tide') || lowerMessage.includes('current')) {
      return "Tides are crucial for fishing success! Generally, moving water (incoming or outgoing tides) is better than slack tide. Check our Fishing Analytics for today's tide times and predictions.";
    }
    
    if (lowerMessage.includes('law') || lowerMessage.includes('regulation') || lowerMessage.includes('legal')) {
      return "Always check local fishing regulations! Use our Fishing Laws Chat feature above to get specific information about regulations in your area. Remember to have proper licenses!";
    }
    
    if (lowerMessage.includes('moon') || lowerMessage.includes('lunar')) {
      return "Moon phases affect fish behavior! New moon and full moon periods are often the most productive. Check our Fishing Analytics to see today's moon phase and how it affects fishing conditions.";
    }
    
    if (lowerMessage.includes('equipment') || lowerMessage.includes('gear') || lowerMessage.includes('rod')) {
      return "Essential fishing gear includes: appropriate rod and reel, tackle box, hooks, sinkers, swivels, net, cooler, and safety equipment. Choose gear based on your target species and fishing method.";
    }
    
    if (lowerMessage.includes('species') || lowerMessage.includes('fish type') || lowerMessage.includes('what fish')) {
      return "Fish species depend on your location and season. Coastal areas often have bass, snapper, mackerel, and bream. Check local fishing reports and our map for species-specific spots!";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm your FisherMate AI assistant. I can help you with fishing advice, weather conditions, locations, safety tips, and regulations. What would you like to know?";
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! Happy fishing! 🎣 Remember to check all the information cards above for the most comprehensive fishing insights.";
    }
    
    // Default responses for general questions
    const defaultResponses = [
      "That's an interesting question! For specific fishing advice, I'd recommend checking our weather conditions, fishing analytics, and local regulations above.",
      "I'd love to help! Try asking about weather conditions, best fishing times, locations, safety tips, or fishing regulations.",
      "Great question! You can find detailed information in our various cards above - weather, map, analytics, and laws. What specific aspect interests you most?",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 seconds delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating chat button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <MessageCircle className="w-8 h-8 animate-float" />
        </Button>
        <div className="absolute -top-1 -right-1">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Chat window
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'} transition-all duration-300 animate-slide-in-right`}>
      <Card className="w-full h-full shadow-2xl border-2 border-gray-200 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg">
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Bot className="w-5 h-5" />
              FisherMate AI
              <Badge variant="secondary" className="text-xs bg-green-400 text-green-900 border-none">
                Online
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-[calc(100%-5rem)] p-4 bg-white">
            {/* Messages */}
            <ScrollArea className="flex-1 mb-4 pr-3">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className={`rounded-xl px-3 py-2 shadow-md ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 text-right ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-xl px-3 py-2 shadow-md">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2 border-t pt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about fishing..."
                className="flex-1 rounded-full px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping}
                className="rounded-full w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="icon"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
