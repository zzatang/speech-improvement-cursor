import Section from '@/components/ui/section'

interface Feature {
  icon: string
  title: string
  description: string
  bgColor: string
  borderColor: string
  rotation: string
  animationDelay?: string
}

const features: Feature[] = [
  {
    icon: '🎮',
    title: 'Fun Games',
    description: 'Interactive speech games make practice feel like play!',
    bgColor: 'bg-yellow-400',
    borderColor: 'border-yellow-400',
    rotation: '-rotate-1',
  },
  {
    icon: '🏆',
    title: 'Progress Tracking',
    description: 'Watch your child\'s pronunciation improve over time.',
    bgColor: 'bg-emerald-400',
    borderColor: 'border-emerald-400',
    rotation: 'rotate-1',
    animationDelay: 'animation-delay-200',
  },
  {
    icon: '👂',
    title: 'Instant Feedback',
    description: 'Real-time guidance helps improve pronunciation skills.',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    rotation: '-rotate-1',
    animationDelay: 'animation-delay-400',
  },
]

export default function FeaturesSection() {
  return (
    <Section 
      background="gradient" 
      padding="xl"
      className="border-t-2 border-b-2 border-dashed border-blue-600"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-primary">
        Features that make learning fun
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`bg-white rounded-3xl p-8 text-center shadow-lg border-2 ${feature.borderColor} ${feature.rotation} hover:rotate-0 transition-transform duration-300`}
          >
            <div className={`w-20 h-20 ${feature.bgColor} rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-md animate-wiggle ${feature.animationDelay || ''}`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
} 