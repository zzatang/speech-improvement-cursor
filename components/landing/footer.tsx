import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-blue-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="h-12 w-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md animate-float">
            S
          </div>
          
          <p className="text-muted-foreground">
            Built with ❤️ by the Speech Buddy Team.
            <Link 
              href="#" 
              className="text-primary ml-2 font-semibold hover:underline"
            >
              GitHub
            </Link>
          </p>
          
          <div className="flex gap-4 mt-2">
            <span className="text-2xl">🎈</span>
            <span className="text-2xl">🎯</span>
            <span className="text-2xl">🎪</span>
            <span className="text-2xl">🎨</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 