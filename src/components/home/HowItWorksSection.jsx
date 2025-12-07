import { Upload, Settings, Send, CheckCircle } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Questions',
    description: 'Import questions from PDFs or create them manually. Organize by subject, difficulty, and type.',
  },
  {
    step: '02',
    icon: Settings,
    title: 'Configure Exam',
    description: 'Set exam parameters like duration, total marks, question distribution, and difficulty balance.',
  },
  {
    step: '03',
    icon: Send,
    title: 'Assign to Students',
    description: 'Generate randomized papers and assign them to students or student groups.',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Review Results',
    description: 'Get instant grading, detailed analytics, and export results for your records.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started in four simple steps
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary to-primary/50 lg:block" />
          
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div 
                key={step.step}
                className={`relative flex flex-col lg:flex-row items-center gap-8 animate-fade-in ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className={`inline-block ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                    <span className="text-5xl font-bold text-primary/20">{step.step}</span>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground max-w-md">{step.description}</p>
                  </div>
                </div>
                
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <step.icon className="h-7 w-7" />
                </div>
                
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
