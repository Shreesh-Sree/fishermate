import { Anchor, Languages, Moon, Sun, Info, HelpCircle, Settings, MapPin, CloudSun, Scale, Shield, BarChart3, MessageCircle, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { setTheme, theme } = useTheme();
  const { setLocale, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: BarChart3 },
    { href: "/map", label: t("map"), icon: MapPin },
    { href: "/laws", label: t("laws"), icon: Scale },
    { href: "/safety", label: t("safety"), icon: Shield },
    { href: "/chat", label: t("chat"), icon: MessageCircle },
  ];

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10 shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          aria-label={t("home")}
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/20 backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
            <Image src="/favicon.ico" alt="FisherMate" width={24} height={24} className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            FisherMate.AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              aria-label={`${t("goto")} ${label}`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="glass-button-outline"
            aria-label={t("themeToggle")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="glass-button-outline"
                aria-label={t("languageToggle")}
              >
                <Languages className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-effect border-white/20">
              <DropdownMenuItem onClick={() => setLocale("en")}>
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("ta")}>
                🇮🇳 தமிழ்
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass-button-outline"
                  aria-label={t("userMenu")}
                >
                  <User className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-effect border-white/20">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="glass-button-primary" size="sm">
                {t("login")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden glass-button-outline"
              aria-label={t("mobileMenu")}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass-effect border-white/20 w-80">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/20 backdrop-blur-sm">
                    <Image src="/favicon.ico" alt="FisherMate" width={20} height={20} className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    FisherMate.AI
                  </span>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-6">
                <div className="space-y-4">
                  {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={handleMobileNavClick}
                      className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors p-3 rounded-lg hover:bg-white/10"
                      aria-label={`${t("goto")} ${label}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Mobile Controls */}
              <div className="border-t border-white/20 p-4 space-y-4">
                {/* Theme Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t("theme")}</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={theme === "light" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex-1"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      {t("light")}
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex-1"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      {t("dark")}
                    </Button>
                  </div>
                </div>

                {/* Language Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t("language")}</label>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocale("en")}
                      className="flex-1"
                    >
                      🇺🇸 English
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocale("ta")}
                      className="flex-1"
                    >
                      🇮🇳 தமிழ்
                    </Button>
                  </div>
                </div>

                {/* User Section */}
                {user ? (
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full justify-start text-red-400 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("logout")}
                  </Button>
                ) : (
                  <Link href="/login" onClick={handleMobileNavClick}>
                    <Button className="glass-button-primary w-full">
                      {t("login")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
