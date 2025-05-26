import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white border-t-4 border-b-4 border-dashed border-yellow-400">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Ready to start your speech adventure?
        </h2>
        
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed opacity-90">
          Join thousands of families who are helping their children improve their speech in a fun, engaging way.
        </p>
        
        <Link 
          href="/auth/signup"
          className="inline-block bg-white text-primary px-10 py-4 rounded-2xl font-bold text-lg md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-soft"
        >
          Create a Free Account
        </Link>
      </div>
    </section>
  )
} 