import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, RefreshCw, Printer, Download, Edit2, Save, X } from 'lucide-react';
import { format } from 'date-fns';

export function ExamPreview({ exam, onBack, onRegenerate, editable = false, onUpdate }) {
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // Call backend to generate PDF
      const response = await fetch('http://localhost:5000/api/exams/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exam)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get PDF blob
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exam.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
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
      if (q.correctOption !== undefined) {
        text += `Q${index + 1}: Option ${String.fromCharCode(65 + q.correctOption)}\n`;
      } else if (q.correctAnswer) {
        text += `Q${index + 1}: ${q.correctAnswer}\n`;
      }
    });

    return text;
  };

  const handleEditClick = (question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({ ...question });
  };

  const handleSaveEdit = () => {
    if (onUpdate && editedQuestion) {
      const updatedQuestions = exam.questions.map(q =>
        q.id === editedQuestion.id ? editedQuestion : q
      );
      onUpdate({ ...exam, questions: updatedQuestions });
    }
    setEditingQuestionId(null);
    setEditedQuestion(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditedQuestion(null);
  };

  const handleQuestionChange = (field, value) => {
    setEditedQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion(prev => ({ ...prev, options: newOptions }));
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
          <div className="space-y-6">
            {exam.questions.map((question, index) => (
              <Card key={question.id} className="relative">
                <CardContent className="pt-6">
                  {editingQuestionId === question.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <Label className="text-sm font-medium">Question {index + 1}</Label>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        value={editedQuestion.text}
                        onChange={(e) => handleQuestionChange('text', e.target.value)}
                        className="min-h-[80px]"
                      />

                      {editedQuestion.options && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Options</Label>
                          {editedQuestion.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <span className="font-medium w-8">{String.fromCharCode(65 + optIndex)}.</span>
                              <Input
                                value={opt}
                                onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                              />
                              {editedQuestion.correctOption === optIndex && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {editedQuestion.options && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Correct Answer</Label>
                          <div className="flex gap-2">
                            {editedQuestion.options.map((_, optIndex) => (
                              <Button
                                key={optIndex}
                                size="sm"
                                variant={editedQuestion.correctOption === optIndex ? "default" : "outline"}
                                onClick={() => handleQuestionChange('correctOption', optIndex)}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-lg">
                          <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
                          {question.text}
                        </h3>
                        {editable && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(question)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border ${question.correctOption === optIndex
                                ? 'bg-green-50 border-green-200'
                                : 'bg-muted/30 border-border'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>
                                  <span className="font-medium mr-2">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  {option}
                                </span>
                                {question.correctOption === optIndex && (
                                  <span className="text-xs font-semibold bg-green-600 text-white px-2 py-1 rounded">
                                    Correct
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 text-sm text-muted-foreground">
                        {question.marks} {question.marks === 1 ? 'mark' : 'marks'} • {question.difficulty}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
