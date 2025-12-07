import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useQuestionBank } from '@/context/QuestionBankContext';

export function QuestionCard({ question, showDelete = true, index }) {
  const { deleteQuestion } = useQuestionBank();

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const typeLabels = {
    mcq: 'Multiple Choice',
    'true-false': 'True/False',
    'short-answer': 'Short Answer',
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium leading-relaxed text-card-foreground">
              {index !== undefined && (
                <span className="mr-2 text-muted-foreground">Q{index + 1}.</span>
              )}
              {question.text}
            </p>
          </div>
          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteQuestion(question.id)}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {question.options && question.options.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {question.options.map((option, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${option === question.correctAnswer
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-muted/50 text-muted-foreground'
                  }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + i)}.</span>
                {option}
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{question.category}</Badge>
          <Badge className={difficultyColors[question.difficulty]}>
            {question.difficulty}
          </Badge>
          <Badge variant="secondary">{typeLabels[question.type]}</Badge>
          <span className="ml-auto text-sm text-muted-foreground">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
