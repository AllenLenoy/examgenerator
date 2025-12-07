import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, Brain, Shield, Zap, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Question Bank',
    description: 'Build comprehensive question banks organized by subject, difficulty, and type.',
  },
  {
    icon: Brain,
    title: 'Smart Randomization',
    description: 'Generate unique exams with intelligent question selection algorithms.',
  },
  {
    icon: Users,
    title: 'Student Management',
    description: 'Assign tests to students and track their progress in real-time.',
  },
  {
    icon: Shield,
    title: 'Secure Testing',
    description: 'Anti-cheating measures and secure exam delivery for fair assessments.',
  },
  {
    icon: Zap,
    title: 'Instant Grading',
    description: 'Automatic grading for objective questions with detailed analytics.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Comprehensive reports on student performance and question effectiveness.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Everything You Need for Exam Management
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete solution for creating, distributing, and analyzing exams.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
