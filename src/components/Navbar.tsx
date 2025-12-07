'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-7 bg-primary rounded-md" />
            <span className="text-xl font-semibold text-white">PrepWise</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/interview-session"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Practice Interview
            </Link>
            <Link
              href="/resume-analysis"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Resume Analysis
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Avatar className="w-9 h-9 border border-border hover:border-primary transition-colors cursor-pointer">
                <AvatarImage src={user?.photoURL} alt={user?.displayName || 'User'} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {user?.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
