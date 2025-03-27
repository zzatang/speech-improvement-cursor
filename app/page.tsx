"use client"

import Image from 'next/image'
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <div className="flex flex-col items-center">
          <div className="relative h-24 w-24 md:h-32 md:w-32">
            <Image 
              src="/logo.svg" 
              alt="Speech Buddy Logo" 
              fill
              className="animate-wave"
              priority
            />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-primary logo-text md:text-6xl">
            Speech Buddy
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground">
            Fun speech practice for young speakers! Improve pronunciation through interactive games.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link 
              href="/onboarding" 
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get Started
            </Link>
            <Link 
              href="/sign-in" 
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-6 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-16">
        <div className="container px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold logo-text text-primary">
            Features that make learning fun
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">Fun Games</h3>
              <p className="text-muted-foreground">
                Interactive speech games make practice feel like play!
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Watch your child's pronunciation improve over time.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">👂</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">Instant Feedback</h3>
              <p className="text-muted-foreground">
                Real-time guidance helps improve pronunciation skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold logo-text text-primary">
            What parents are saying
          </h2>
          <div className="mx-auto grid max-w-sm gap-8 md:max-w-none md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <p className="mb-4 text-card-foreground">
                "My son used to struggle with his 'r' sounds. After just a few weeks with Speech Buddy, he's made incredible progress!"
              </p>
              <p className="font-semibold">- Sarah W., Parent</p>
            </div>
            {/* Testimonial 2 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <p className="mb-4 text-card-foreground">
                "The colorful interface and fun games keep my daughter engaged. She asks to practice every day!"
              </p>
              <p className="font-semibold">- Michael T., Parent</p>
            </div>
            {/* Testimonial 3 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <p className="mb-4 text-card-foreground">
                "Speech Buddy has been a wonderful supplement to my child's speech therapy. The games reinforce what they learn in sessions."
              </p>
              <p className="font-semibold">- Lisa K., Parent</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container flex flex-col items-center px-4 text-center md:px-6">
          <h2 className="text-3xl font-bold logo-text md:text-4xl">
            Ready to start your speech adventure?
          </h2>
          <p className="mt-4 max-w-2xl text-lg">
            Join thousands of families who are helping their children improve their speech in a fun, engaging way.
          </p>
          <Link 
            href="/onboarding" 
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-primary-foreground px-6 text-base font-medium text-primary transition-colors hover:bg-primary-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create a Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container flex flex-col items-center gap-4 px-4 text-center md:px-6">
          <div className="flex h-16 w-16 items-center justify-center">
            <Image 
              src="/logo-icon.svg" 
              alt="Speech Buddy Logo" 
              width={40} 
              height={40}
              className="animate-bounce-gentle"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            © 2023 Speech Buddy. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
