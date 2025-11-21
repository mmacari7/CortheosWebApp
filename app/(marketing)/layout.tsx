import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Cortheos
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm hover:underline"
            >
              About
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/chat"
                  className="text-sm hover:underline"
                >
                  Chat
                </Link>
                <Link
                  href="/logout"
                  className="text-sm px-4 py-2 border rounded-md hover:bg-accent"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm hover:underline"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cortheos. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
