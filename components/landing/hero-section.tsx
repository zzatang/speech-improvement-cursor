import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto mb-8 flex h-32 w-32 md:h-40 md:w-40 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-4xl md:text-5xl font-bold text-white shadow-lg animate-float">
          S
        </div>
        
        <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
          Speech Buddy
        </h1>
        
        <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          Fun speech practice for young speakers! Improve pronunciation through interactive games.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Link 
            href="/auth/signup"
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-soft"
          >
            Get Started
          </Link>
          
          <Link 
            href="/auth/login"
            className="w-full sm:w-auto border-2 border-primary text-primary px-6 py-3 rounded-2xl font-semibold text-lg hover:bg-primary hover:text-white transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  )
} 