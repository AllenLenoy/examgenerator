import { Header } from '@/components/layout/Header';
import { ExamGenerator } from '@/components/exam/ExamGenerator';

const GenerateExam = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Generate Exam</h1>
          <p className="mt-1 text-muted-foreground">
            Create randomized exam papers from your question bank
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <ExamGenerator />
        </div>
      </main>
    </div>
  );
};

export default GenerateExam;
