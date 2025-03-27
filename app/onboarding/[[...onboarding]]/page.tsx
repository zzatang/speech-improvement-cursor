import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col items-center justify-center px-4 py-8 md:px-8">
        {/* App Logo/Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-primary/10 p-3">
            <Image 
              src="/logo-icon.svg" 
              alt="Speech App Logo" 
              width={40} 
              height={40}
              className="animate-bounce-gentle"
            />
          </div>
          <h1 className="text-3xl font-bold text-primary logo-text">Speech Buddy</h1>
          <p className="mt-2 max-w-md text-center text-muted-foreground">
            Fun speech practice for young speakers!
          </p>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-card-foreground">
              Welcome!
            </h2>
            <p className="text-sm text-muted-foreground">
              Create your account to start your speech adventure
            </p>
          </div>

          {/* Clerk Sign Up Component */}
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
                card: "shadow-none",
                formFieldInput: 
                  "rounded-md border focus:ring-2 focus:ring-primary",
                footer: "hidden",
              },
            }}
            routing="hash"
            redirectUrl="/dashboard"
          />

          {/* Already have an account link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer with kid-friendly graphics */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD166] animate-bounce-gentle" style={{ animationDelay: "0.1s" }}>
            <span className="text-xl">🎤</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06D6A0] animate-bounce-gentle" style={{ animationDelay: "0.3s" }}>
            <span className="text-xl">🔊</span>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#118AB2] animate-bounce-gentle" style={{ animationDelay: "0.5s" }}>
            <span className="text-2xl">😄</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EF476F] animate-bounce-gentle" style={{ animationDelay: "0.7s" }}>
            <span className="text-xl">🌟</span>
          </div>
        </div>
      </div>
    </div>
  );
} 