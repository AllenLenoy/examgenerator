import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'High School Teacher',
    content: 'ExamGen has transformed how I create assessments. What used to take hours now takes minutes, and my students get unique papers every time.',
    rating: 5,
  },
  {
    name: 'Dr. Michael Chen',
    role: 'University Professor',
    content: 'The randomization feature ensures academic integrity. I can confidently assign online exams knowing each student gets a different set of questions.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'School Principal',
    content: 'We deployed ExamGen across our entire school. The admin dashboard gives us complete visibility into assessment quality and student performance.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Math Teacher',
    content: 'The question bank feature is a game-changer. I\'ve built up years of questions that I can reuse and remix for different classes.',
    rating: 5,
  },
  {
    name: 'Lisa Thompson',
    role: 'Online Tutor',
    content: 'Perfect for my online tutoring business. I can quickly generate practice tests for students based on their weak areas.',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'Department Head',
    content: 'The analytics help us identify which topics students struggle with most. It\'s become essential for our curriculum planning.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Loved by Educators Worldwide
          </h2>
          <p className="text-muted-foreground text-lg">
            See what teachers and institutions are saying about ExamGen
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
