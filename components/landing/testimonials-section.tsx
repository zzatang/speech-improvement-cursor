interface Testimonial {
  quote: string
  author: string
  bgColor: string
  borderColor: string
  rotation: string
}

const testimonials: Testimonial[] = [
  {
    quote: "My son used to struggle with his 'r' sounds. After just a few weeks with Speech Buddy, he's made incredible progress!",
    author: "Sarah W., Parent",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    rotation: "-rotate-1",
  },
  {
    quote: "The colorful interface and fun games keep my daughter engaged. She asks to practice every day!",
    author: "Michael T., Parent",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-400",
    rotation: "rotate-1",
  },
  {
    quote: "Speech Buddy has been a wonderful supplement to my child's speech therapy. The games reinforce what they learn in sessions.",
    author: "Lisa K., Parent",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    rotation: "-rotate-1",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-primary">
          What parents are saying
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`${testimonial.bgColor} rounded-3xl p-8 shadow-lg border-2 ${testimonial.borderColor} ${testimonial.rotation} hover:rotate-0 transition-transform duration-300`}
            >
              <p className="mb-6 text-muted-foreground text-base leading-relaxed">
                "{testimonial.quote}"
              </p>
              <p className="font-bold text-primary">
                {testimonial.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 