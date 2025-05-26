import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b-2 border-yellow-400 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md animate-pulse-soft">
            S
          </div>
          <span className="logo-text text-2xl">
            Speech Buddy
          </span>
        </div>
        
        <nav className="flex gap-4">
          <Link 
            href="/auth/login"
            className="text-primary font-semibold px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/signup"
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
} 