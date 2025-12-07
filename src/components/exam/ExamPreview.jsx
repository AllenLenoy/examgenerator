import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { ArrowLeft, RefreshCw, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';

export function ExamPreview({ exam, onBack, onRegenerate }) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const examContent = generateExamText(exam);
    const blob = new Blob([examContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateExamText = (exam) => {
    let text = `${exam.title}\n`;
    text += `${'='.repeat(exam.title.length)}\n\n`;
    text += `Date: ${format(exam.createdAt, 'MMMM d, yyyy')}\n`;
    text += `Total Questions: ${exam.questions.length}\n`;
    text += `Total Marks: ${exam.totalMarks}\n\n`;
    text += `${'─'.repeat(50)}\n\n`;

    exam.questions.forEach((q, index) => {
      text += `Q${index + 1}. ${q.text} (${q.marks} ${q.marks === 1 ? 'mark' : 'marks'})\n`;
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, i) => {
          text += `   ${String.fromCharCode(65 + i)}. ${opt}\n`;
        });
      }
      text += '\n';
    });

    text += `\n${'─'.repeat(50)}\n`;
    text += `\nANSWER KEY\n`;
    text += `${'─'.repeat(50)}\n\n`;

    exam.questions.forEach((q, index) => {
      if (q.correctAnswer) {
        text += `Q${index + 1}: ${q.correctAnswer}\n`;
      }
    });

    return text;
  };

  return (
    <div className="space-y-6">
      {(onBack || onRegenerate) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Generator
            </Button>
          )}
          <div className="flex gap-2">
            {onRegenerate && (
              <Button variant="outline" onClick={onRegenerate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            )}
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      )}

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="text-center border-b border-border">
          <CardTitle className="text-2xl">{exam.title}</CardTitle>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>Date: {format(exam.createdAt, 'MMMM d, yyyy')}</span>
            <span>Total Questions: {exam.questions.length}</span>
            <span>Total Marks: {exam.totalMarks}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {exam.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                showDelete={false}
                index={index}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-lg">Answer Key</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {exam.questions.map((q, index) => (
              <div
                key={q.id}
                className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
              >
                <span className="font-medium">Q{index + 1}:</span>
                <span className="text-muted-foreground">
                  {q.correctAnswer || 'Open answer'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
