import { Anchor, Languages, Moon, Sun, Info, HelpCircle, Settings, MapPin, CloudSun, Scale, Shield, BarChart3, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/context/LanguageContext';

export function Header() {
  const { setTheme, theme } = useTheme();
  const { setLocale, t } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/map", label: "Map", icon: MapPin },
    { href: "/laws", label: "Laws", icon: Scale },
    { href: "/safety", label: "Safety", icon: Shield },
    { href: "/chat", label: "AI Chat", icon: MessageCircle },
  ];

  return (
    <header className="py-4 px-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 border-b shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-white transition-all hover:scale-105 animate-fade-in">
          <div className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl border border-white/30 animate-float">
            <Anchor className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold tracking-tight animate-shimmer">{t('app_title')}</h1>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Mobile Navigation Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Navigation Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                <Languages className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocale('en')}>
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('ta')}>
                🇮🇳 Tamil (தமிழ்)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                <Info className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Settings and Help</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="mr-2 h-4 w-4" />
                About FisherMate.AI
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-sm text-muted-foreground">Version 1.0.0</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
