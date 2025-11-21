import Link from 'next/link';
import { ArrowRight, MessageSquare, Sparkles, Shield, LogOut } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Experience the Future of AI Conversation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cortheos brings you powerful AI chat capabilities with an intuitive interface.
            {isLoggedIn ? ' Start chatting now!' : ' Join our alpha program and be among the first to experience it.'}
          </p>
          <div className="flex items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
              >
                Go to Chat
                <MessageSquare className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-accent font-medium"
                >
                  Sign In
                  <MessageSquare className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Cortheos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Powerful AI
              </h3>
              <p className="text-muted-foreground">
                Leveraging cutting-edge models for intelligent, context-aware conversations.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Intuitive Interface
              </h3>
              <p className="text-muted-foreground">
                Clean, modern design that makes chatting with AI feel natural and effortless.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Secure & Private
              </h3>
              <p className="text-muted-foreground">
                Your conversations are protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-20 border-t">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Join the Alpha Program
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're currently in alpha/beta. Sign up with an invite code to get early access.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
            >
              Request Access
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
