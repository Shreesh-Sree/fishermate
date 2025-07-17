import { Anchor } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 px-6 bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-primary transition-opacity hover:opacity-80">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Anchor className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">SeaGuide AI</h1>
        </Link>
        {/* Navigation can be added here if needed */}
      </div>
    </header>
  );
}
