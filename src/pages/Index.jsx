import { Header } from '@/components/layout/Header';
import { QuestionForm } from '@/components/questions/QuestionForm';
import { QuestionList } from '@/components/questions/QuestionList';
import { useQuestionBank } from '@/context/QuestionBankContext';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, BookOpen, Layers } from 'lucide-react';

const Index = () => {
  const { questions, getCategories } = useQuestionBank();
  const categories = getCategories();

  const stats = [
    {
      label: 'Total Questions',
      value: questions.length,
      icon: FileText,
    },
    {
      label: 'Categories',
      value: categories.length,
      icon: Layers,
    },
    {
      label: 'Total Marks',
      value: questions.reduce((sum, q) => sum + q.marks, 0),
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your question repository for exam generation
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <div>
            <QuestionForm />
          </div>
          <div>
            <QuestionList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
