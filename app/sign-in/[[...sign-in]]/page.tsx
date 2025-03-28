"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      fontFamily: "'Comic Neue', 'Comic Sans MS', 'Arial', sans-serif",
      color: '#333',
      background: 'linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%)'
    }}>
      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div style={{
        width: '100%', 
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        {/* App Logo/Branding */}
        <div style={{
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            marginBottom: '1rem',
            height: '5rem',
            width: '5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
          }}>
            <Image 
              src="/logo-icon.svg" 
              alt="Speech App Logo" 
              width={50} 
              height={50}
              style={{
                animation: 'bounce 2s infinite ease-in-out'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            fontFamily: "'Comic Neue', 'Comic Sans MS', sans-serif",
            background: 'linear-gradient(45deg, #4F46E5, #2563EB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem'
          }}>Speech Buddy</h1>
          <p style={{
            marginTop: '0.5rem',
            maxWidth: '28rem',
            textAlign: 'center',
            color: '#4B5563',
            fontSize: '1.25rem'
          }}>
            Welcome back to your speech practice app!
          </p>
        </div>

        {/* Main Content Area */}
        <div style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: '1.25rem',
          border: '2px solid #E5E7EB',
          backgroundColor: 'white',
          padding: '2rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: '#2563EB',
              marginBottom: '0.75rem'
            }}>
              Sign In
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#6B7280'
            }}>
              Continue your speech practice journey
            </p>
          </div>

          {/* Clerk Sign In Component */}
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6",
                card: "shadow-none",
                formFieldInput: 
                  "rounded-xl border-2 focus:ring-2 focus:ring-primary text-center",
                footer: "hidden",
                form: "flex flex-col items-center",
                formFieldLabel: "text-center",
                formFieldLabelRow: "justify-center",
                formHeader: "text-center",
                formHeaderTitle: "text-center",
                formHeaderSubtitle: "text-center",
                otpCodeFieldInput: "text-center",
                identityPreview: "justify-center",
                identityPreviewText: "text-center",
                identityPreviewEditButton: "mx-auto",
                alert: "text-center",
                alertText: "text-center",
                formResendCodeLink: "mx-auto",
                formFieldAction: "mx-auto",
                formFieldRow: "justify-center",
                main: "w-full",
                rootBox: "w-full flex justify-center",
                socialButtonsBlockButton: "justify-center",
                socialButtonsBlockButtonText: "text-center",
                socialButtonsIconButton: "mx-auto",
                dividerLine: "w-full",
                dividerText: "text-center",
                formFieldInputShowPasswordButton: "right-4",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "iconButton",
              },
            }}
            routing="hash"
            redirectUrl="/dashboard"
          />

          {/* Create account link */}
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '1rem'
          }}>
            <p style={{color: '#6B7280'}}>
              Don't have an account yet?{" "}
              <a 
                href="/onboarding" 
                style={{
                  color: '#3B82F6',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Create one here
              </a>
            </p>
          </div>
        </div>

        {/* Footer with kid-friendly graphics */}
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <div style={{
            height: '3rem',
            width: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: '#FFD166',
            animation: 'bounce 2s infinite ease-in-out',
            animationDelay: '0.1s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <span style={{fontSize: '1.25rem'}}>🎵</span>
          </div>
          <div style={{
            height: '2.5rem',
            width: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: '#06D6A0',
            animation: 'bounce 2s infinite ease-in-out',
            animationDelay: '0.3s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <span style={{fontSize: '1.25rem'}}>👋</span>
          </div>
          <div style={{
            height: '3.5rem',
            width: '3.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: '#118AB2',
            animation: 'bounce 2s infinite ease-in-out',
            animationDelay: '0.5s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <span style={{fontSize: '1.5rem'}}>🎯</span>
          </div>
          <div style={{
            height: '2.5rem',
            width: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: '#EF476F',
            animation: 'bounce 2s infinite ease-in-out',
            animationDelay: '0.7s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <span style={{fontSize: '1.25rem'}}>🎪</span>
          </div>
        </div>
      </div>
    </div>
  );
} 