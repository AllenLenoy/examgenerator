import { useState } from 'react';
import { useQuestionBank } from '@/context/QuestionBankContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export function QuestionForm() {
  const { addQuestion, getCategories } = useQuestionBank();
  const existingCategories = getCategories();

  const [text, setText] = useState('');
  const [type, setType] = useState('mcq');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [marks, setMarks] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalCategory = newCategory || category;
    if (!text.trim() || !finalCategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (type === 'mcq' && options.filter((o) => o.trim()).length < 2) {
      toast.error('Please provide at least 2 options for MCQ');
      return;
    }

    addQuestion({
      text: text.trim(),
      type,
      category: finalCategory,
      difficulty,
      options: type !== 'short-answer' ? options.filter((o) => o.trim()) : undefined,
      correctAnswer: correctAnswer || undefined,
      marks,
    });

    // Reset form
    setText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setMarks(1);
    toast.success('Question added successfully!');
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Question
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text *</Label>
            <Textarea
              id="question-text"
              placeholder="Enter your question here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Question Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty *</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or create new" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-category">Or Create New Category</Label>
              <Input
                id="new-category"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setCategory('');
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="marks">Marks</Label>
            <Input
              id="marks"
              type="number"
              min={1}
              max={100}
              value={marks}
              onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
              className="w-24"
            />
          </div>

          {type === 'mcq' && (
            <div className="space-y-3">
              <Label>Options</Label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 text-sm text-muted-foreground">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  {option && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => updateOption(index, '')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {type === 'true-false' && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="True">True</SelectItem>
                  <SelectItem value="False">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'mcq' && (
            <div className="space-y-2">
              <Label htmlFor="correct-answer">Correct Answer</Label>
              <Input
                id="correct-answer"
                placeholder="Enter the correct option text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
