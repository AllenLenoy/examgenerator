import { useState } from 'react';
import { useQuestionBank } from '@/context/QuestionBankContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ExamPreview } from './ExamPreview';

export function ExamGenerator() {
  const { questions, getCategories, addExam } = useQuestionBank();
  const categories = getCategories();

  const [title, setTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState(null);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDifficulty = (diff) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateExam = () => {
    if (!title.trim()) {
      toast.error('Please enter an exam title');
      return;
    }

    // Filter questions based on criteria
    let eligible = questions.filter((q) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(q.category);
      const matchesDifficulty =
        selectedDifficulties.length === 0 || selectedDifficulties.includes(q.difficulty);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(q.type);
      return matchesCategory && matchesDifficulty && matchesType;
    });

    if (eligible.length === 0) {
      toast.error('No questions match your criteria');
      return;
    }

    if (eligible.length < totalQuestions) {
      toast.warning(
        `Only ${eligible.length} questions available. Generating exam with all matching questions.`
      );
    }

    // Shuffle and select questions
    const shuffled = shuffleArray(eligible);
    const selected = shuffled.slice(0, Math.min(totalQuestions, eligible.length));

    const exam = {
      id: crypto.randomUUID(),
      title: title.trim(),
      questions: selected,
      totalMarks: selected.reduce((sum, q) => sum + q.marks, 0),
      createdAt: new Date(),
    };

    setGeneratedExam(exam);
    addExam(exam);
    toast.success('Exam generated successfully!');
  };

  const regenerateExam = () => {
    generateExam();
  };

  const availableCount = questions.filter((q) => {
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(q.category);
    const matchesDifficulty =
      selectedDifficulties.length === 0 || selectedDifficulties.includes(q.difficulty);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(q.type);
    return matchesCategory && matchesDifficulty && matchesType;
  }).length;

  if (generatedExam) {
    return (
      <ExamPreview
        exam={generatedExam}
        onBack={() => setGeneratedExam(null)}
        onRegenerate={regenerateExam}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Configure Exam
          </CardTitle>
          <CardDescription>
            Set your criteria and generate a randomized exam paper
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Exam Title *</Label>
            <Input
              id="exam-title"
              placeholder="e.g., Midterm Examination - Science"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total-questions">Number of Questions</Label>
            <Input
              id="total-questions"
              type="number"
              min={1}
              max={100}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 1)}
              className="w-32"
            />
          </div>

          <div className="space-y-3">
            <Label>Categories (leave empty for all)</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Difficulty Levels (leave empty for all)</Label>
            <div className="flex flex-wrap gap-2">
              {['easy', 'medium', 'hard'].map((diff) => (
                <label
                  key={diff}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedDifficulties.includes(diff)}
                    onCheckedChange={() => toggleDifficulty(diff)}
                  />
                  <span className="text-sm capitalize">{diff}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Question Types (leave empty for all)</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'mcq', label: 'Multiple Choice' },
                { value: 'true-false', label: 'True/False' },
                { value: 'short-answer', label: 'Short Answer' },
              ].map((type) => (
                <label
                  key={type.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedTypes.includes(type.value)}
                    onCheckedChange={() => toggleType(type.value)}
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {availableCount} questions match your criteria
            </span>
          </div>

          <Button onClick={generateExam} size="lg" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Exam Paper
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
