'use client';

import { Languages, Moon, Sun, Settings, HelpCircle, LogIn, LogOut, User, Menu, LayoutDashboard, Map, Scale, ShieldCheck, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
import { PWAInstallIcon } from '@/components/PWAInstallIcon';
import { EmergencySOSButton } from '@/components/EmergencySOSButton';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/utils';

export function Header() {
  const { setTheme, theme } = useTheme();
  const { setLocale, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/map", label: t("map"), icon: Map },
    { href: "/laws", label: t("laws"), icon: Scale },
    { href: "/safety", label: t("safety"), icon: ShieldCheck },
    { href: "/chat", label: t("chat"), icon: MessageSquare },
  ];

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 glass-effect shadow-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" aria-label={t("home")}>
          <div className="p-2 rounded-lg bg-primary/10">
            <Image src="/favicon.svg" alt="FisherMate Logo" width={28} height={28} />
          </div>
          <span className="text-xl font-bold text-gradient">
            FisherMate.AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} legacyBehavior passHref>
              <a className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                pathname === href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </a>
            </Link>
          ))}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center space-x-2">
          <PWAInstallIcon />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={t("themeToggle")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("languageToggle")}>
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-effect">
              <DropdownMenuItem onClick={() => setLocale('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('ta')}>தமிழ்</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("userMenu")}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect">
                <DropdownMenuItem disabled>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { /* Add profile navigation */ }}>
                  <Settings className="h-4 w-4 mr-2" />
                  {t("settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { /* Add help navigation */ }}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {t("help")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" legacyBehavior passHref>
                <Button>
                    <LogIn className="h-5 w-5 mr-2" />
                    {t("login")}
                </Button>
            </Link>
          )}
          
          {/* SOS Button - at the end */}
          <div className="ml-2 border-l border-border/20 pl-2">
            <EmergencySOSButton variant="compact" />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs glass-effect">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-3" onClick={handleMobileNavClick}>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Image src="/favicon.svg" alt="FisherMate Logo" width={24} height={24} />
                    </div>
                    <span className="text-xl font-bold text-gradient">FisherMate.AI</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col space-y-2">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} legacyBehavior passHref>
                    <a onClick={handleMobileNavClick} className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium",
                      pathname === href 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground hover:bg-muted"
                    )}>
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </a>
                  </Link>
                ))}
              </div>
              <div className="mt-8 border-t border-border/20 pt-6">
                {user ? (
                    <div className="space-y-2">
                        <div className="px-4 py-2 text-muted-foreground">{user.email}</div>
                        <Link href="#" onClick={handleMobileNavClick} className="flex items-center gap-4 px-4 py-3 rounded-lg text-foreground hover:bg-muted">
                            <Settings className="h-5 w-5" />
                            <span>{t('settings')}</span>
                        </Link>
                        <Link href="#" onClick={handleMobileNavClick} className="flex items-center gap-4 px-4 py-3 rounded-lg text-foreground hover:bg-muted">
                            <HelpCircle className="h-5 w-5" />
                            <span>{t('help')}</span>
                        </Link>
                        <a onClick={() => { logout(); handleMobileNavClick(); }} className="flex items-center gap-4 px-4 py-3 rounded-lg text-foreground hover:bg-muted cursor-pointer">
                            <LogOut className="h-5 w-5" />
                            <span>{t('logout')}</span>
                        </a>
                    </div>
                ) : (
                    <Link href="/login" legacyBehavior passHref>
                        <a onClick={handleMobileNavClick}>
                            <Button className="w-full">
                                <LogIn className="h-5 w-5 mr-2" />
                                {t("login")}
                            </Button>
                        </a>
                    </Link>
                )}
              </div>
              <div className="mt-8 flex justify-around">
                <EmergencySOSButton />
                <PWAInstallIcon />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
