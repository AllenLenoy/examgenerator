import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Calculator,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { ExamPreview } from './ExamPreview';

const BOARDS = [
  "CBSE",
  "ICSE",
  "State Board",
  "Autonomous College",
  "University Examination"
];

const STANDARDS = [
  "Class 10",
  "Class 12",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8"
];

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "Biology",
  "English",
  "History",
  "Geography",
  "Economics",
  "Commerce"
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export function ExamGenerator() {
  const { addExam } = useQuestionBank();

  const [examDetails, setExamDetails] = useState({
    board: '',
    standard: '',
    subject: '',
    topics: '',
    duration: 180,
    totalMarks: 100
  });

  const [distribution, setDistribution] = useState([
    { id: 1, count: 10, marks: 1, difficulty: 'Easy', type: 'MCQ' },
    { id: 2, count: 5, marks: 4, difficulty: 'Medium', type: 'MCQ' },
    { id: 3, count: 3, marks: 10, difficulty: 'Hard', type: 'MCQ' },
  ]);

  const [generatedExam, setGeneratedExam] = useState(null);
  const [allocatedMarks, setAllocatedMarks] = useState(0);
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const total = distribution.reduce((sum, row) => sum + (row.count * row.marks), 0);
    setAllocatedMarks(total);
  }, [distribution]);

  const handleDetailChange = (field, value) => {
    setExamDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleDistributionChange = (id, field, value) => {
    setDistribution(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addDistributionRow = () => {
    const newId = Math.max(...distribution.map(d => d.id), 0) + 1;
    setDistribution([...distribution, {
      id: newId,
      count: 1,
      marks: 1,
      difficulty: 'Medium',
      type: 'MCQ' // Always MCQ
    }]);
  };

  const removeDistributionRow = (id) => {
    if (distribution.length === 1) {
      toast.warning("You must have at least one question group.");
      return;
    }
    setDistribution(distribution.filter(row => row.id !== id));
  };

  const getSuggestedTopics = async () => {
    if (!examDetails.subject) {
      toast.error('Please select a subject first');
      return;
    }

    setLoadingSuggestions(true);

    // Subject-specific topic suggestions
    const subjectTopics = {
      'Mathematics': ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 'Probability', 'Number Theory', 'Linear Equations'],
      'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Modern Physics', 'Waves', 'Kinematics', 'Dynamics'],
      'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Chemical Bonding', 'Thermochemistry', 'Electrochemistry', 'Acids and Bases', 'Periodic Table'],
      'Computer Science': ['Data Structures', 'Algorithms', 'OOP Concepts', 'Database Management', 'Operating Systems', 'Networks', 'Web Development', 'Software Engineering'],
      'Biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Anatomy', 'Plant Physiology', 'Microbiology', 'Biotechnology'],
      'English': ['Grammar', 'Literature', 'Composition', 'Poetry', 'Drama', 'Prose', 'Vocabulary', 'Comprehension'],
      'History': ['Ancient History', 'Medieval History', 'Modern History', 'World Wars', 'Independence Movement', 'Cultural History', 'Political History', 'Economic History'],
      'Geography': ['Physical Geography', 'Human Geography', 'Climate', 'Natural Resources', 'Population', 'Agriculture', 'Industries', 'Map Reading'],
      'Economics': ['Microeconomics', 'Macroeconomics', 'Money and Banking', 'Public Finance', 'International Trade', 'Development Economics', 'Indian Economy', 'Economic Policies'],
      'Commerce': ['Accounting', 'Business Studies', 'Economics', 'Marketing', 'Finance', 'Business Law', 'Entrepreneurship', 'Cost Accounting']
    };

    // Small delay to show loading state
    setTimeout(() => {
      const suggestions = subjectTopics[examDetails.subject] || ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5'];
      setTopicSuggestions(suggestions);
      setLoadingSuggestions(false);
      toast.success('Topic suggestions ready!');
    }, 300);
  };

  const addTopicSuggestion = (topic) => {
    const currentTopics = examDetails.topics.trim();
    const newTopics = currentTopics
      ? `${currentTopics}, ${topic}`
      : topic;
    handleDetailChange('topics', newTopics);
  };

  const generateExam = async () => {
    // Basic Validation
    if (!examDetails.subject || !examDetails.board) {
      toast.error("Please fill in basic exam details (Board, Subject).");
      return;
    }

    // No marks validation - user can set any total
    toast.loading("Generating question paper with AI...", { id: 'generate' });

    try {
      // Call AI for each section to generate questions
      const allQuestions = [];

      for (const section of distribution) {
        // Try to call AI first
        let sectionQuestions = [];

        try {
          const response = await fetch('http://localhost:5000/api/ai/generate-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: examDetails.subject,
              topic: examDetails.topics || `${examDetails.subject} general topics`,
              difficulty: section.difficulty,
              count: parseInt(section.count)
            })
          });

          if (response.ok) {
            const data = await response.json();
            // Add section metadata to AI-generated questions
            sectionQuestions = data.questions.map(q => ({
              ...q,
              id: crypto.randomUUID(),
              marks: parseInt(section.marks),
              type: 'mcq',
              difficulty: section.difficulty.toLowerCase()
            }));
          } else {
            throw new Error('AI generation failed');
          }
        } catch (aiError) {
          // Fallback: Create better mock questions
          console.log('Using fallback question generation');
          sectionQuestions = createMockQuestions(
            examDetails.subject,
            examDetails.topics,
            section.difficulty,
            parseInt(section.count),
            parseInt(section.marks)
          );
        }

        allQuestions.push(...sectionQuestions);
      }

      const newExam = {
        id: crypto.randomUUID(),
        title: `${examDetails.subject} - ${examDetails.standard} (${examDetails.board})`,
        questions: allQuestions,
        totalMarks: allocatedMarks,
        duration: examDetails.duration,
        subject: examDetails.subject,
        metadata: { ...examDetails, distribution },
        createdAt: new Date(),
        status: 'draft' // Not finalized yet
      };

      setGeneratedExam(newExam);
      toast.success("Questions generated! Review and edit before finalizing.", { id: 'generate' });

    } catch (error) {
      console.error('Error generating exam:', error);
      toast.error("Failed to generate questions. Please try again.", { id: 'generate' });
    }
  };

  // Helper function to create better mock questions with realistic content
  const createMockQuestions = (subject, topics, difficulty, count, marks) => {
    const questions = [];

    // Subject-specific question templates
    const questionBank = {
      'Mathematics': {
        'Easy': [
          { q: 'What is 25 × 4?', opts: ['100', '90', '110', '95'], ans: 0 },
          { q: 'What is the value of π (pi) approximately?', opts: ['3.14', '2.71', '1.41', '3.33'], ans: 0 },
          { q: 'What is 15% of 200?', opts: ['30', '25', '35', '40'], ans: 0 },
          { q: 'What is the square root of 144?', opts: ['12', '14', '10', '16'], ans: 0 },
          { q: 'What is 7³ (7 cubed)?', opts: ['343', '49', '147', '294'], ans: 0 }
        ],
        'Medium': [
          { q: 'Solve: 3x + 5 = 20', opts: ['x = 5', 'x = 7', 'x = 3', 'x = 6'], ans: 0 },
          { q: 'What is the area of a triangle with base 10cm and height 6cm?', opts: ['30 cm²', '60 cm²', '15 cm²', '20 cm²'], ans: 0 }
        ],
        'Hard': [
          { q: 'Find the derivative of f(x) = x³ - 3x²', opts: ['3x² - 6x', '3x² + 6x', 'x² - 6x', '3x² - 3x'], ans: 0 }
        ]
      },
      'Physics': {
        'Easy': [
          { q: 'What is the SI unit of force?', opts: ['Newton', 'Joule', 'Watt', 'Pascal'], ans: 0 },
          { q: 'What is the speed of light in vacuum?', opts: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10⁷ m/s', '3 × 10⁹ m/s'], ans: 0 }
        ],
        'Medium': [
          { q: 'What is Newton\'s second law of motion?', opts: ['F = ma', 'F = m/a', 'F = a/m', 'F = m + a'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the escape velocity from Earth\'s surface?', opts: ['11.2 km/s', '9.8 km/s', '7.9 km/s', '15.6 km/s'], ans: 0 }
        ]
      },
      'History': {
        'Easy': [
          { q: 'When did India gain independence?', opts: ['1947', '1950', '1942', '1945'], ans: 0 },
          { q: 'Who was the first Prime Minister of India?', opts: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Sardar Patel', 'Subhas Chandra Bose'], ans: 0 },
          { q: 'In which year did World War II end?', opts: ['1945', '1944', '1946', '1943'], ans: 0 }
        ],
        'Medium': [
          { q: 'Who led the Salt March (Dandi March)?', opts: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Bal Gangadhar Tilak', 'Lala Lajpat Rai'], ans: 0 },
          { q: 'What year did the Quit India Movement begin?', opts: ['1942', '1940', '1945', '1930'], ans: 0 }
        ],
        'Hard': [
          { q: 'Who was the Viceroy of India during the Partition?', opts: ['Lord Mountbatten', 'Lord Wavell', 'Lord Linlithgow', 'Lord Irwin'], ans: 0 }
        ]
      },
      'Geography': {
        'Easy': [
          { q: 'What is the largest continent?', opts: ['Asia', 'Africa', 'North America', 'Europe'], ans: 0 },
          { q: 'Which is the longest river in the world?', opts: ['Nile', 'Amazon', 'Yangtze', 'Mississippi'], ans: 0 },
          { q: 'What is the capital of India?', opts: ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai'], ans: 0 }
        ],
        'Medium': [
          { q: 'Which mountain range separates Europe from Asia?', opts: ['Ural Mountains', 'Himalayas', 'Alps', 'Andes'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the approximate percentage of Earth\'s surface covered by oceans?', opts: ['71%', '60%', '80%', '50%'], ans: 0 }
        ]
      }
    };

    // Get appropriate difficulty questions
    const subjectBank = questionBank[subject] || {};
    const diffBank = subjectBank[difficulty] || [];

    for (let i = 0; i < count; i++) {
      if (diffBank.length > 0) {
        // Use real question from bank (cycle through if needed)
        const template = diffBank[i % diffBank.length];
        questions.push({
          id: crypto.randomUUID(),
          text: template.q,
          type: 'mcq',
          difficulty: difficulty.toLowerCase(),
          marks: marks,
          options: template.opts,
          correctOption: template.ans,
          subject: subject,
          topic: topics || subject
        });
      } else {
        // Fallback for subjects without question bank
        questions.push({
          id: crypto.randomUUID(),
          text: `Sample ${difficulty} question ${i + 1} for ${subject}${topics ? ' - ' + topics.split(',')[0].trim() : ''}`,
          type: 'mcq',
          difficulty: difficulty.toLowerCase(),
          marks: marks,
          options: [
            `Option A`,
            `Option B`,
            `Option C`,
            `Option D`
          ],
          correctOption: 0,
          subject: subject,
          topic: topics || subject
        });
      }
    }

    return questions;
  };

  const getSectionLabel = (index) => String.fromCharCode(65 + index);

  if (generatedExam) {
    return (
      <ExamPreview
        exam={generatedExam}
        onBack={() => setGeneratedExam(null)}
        onRegenerate={generateExam}
      />
    );
  }

  // If exam is generated, show preview instead
  if (generatedExam) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Preview & Edit Exam</h1>
            <p className="text-muted-foreground">Review AI-generated questions and make any changes before finalizing.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setGeneratedExam(null)}>
              Go Back
            </Button>
            <Button onClick={() => {
              addExam(generatedExam);
              toast.success("Exam finalized and saved!");
              setGeneratedExam(null);
              // Reset form
              setExamDetails({ board: '', standard: '', subject: '', topics: '', duration: 180, totalMarks: 100 });
              setDistribution([{ id: 1, count: 10, marks: 1, difficulty: 'Easy', type: 'MCQ' }]);
            }} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Confirm Changes
            </Button>
          </div>
        </div>

        {/* Exam Preview with Edit Capability - using ExamPreview component */}
        <ExamPreview
          exam={generatedExam}
          onBack={() => setGeneratedExam(null)}
          onRegenerate={generateExam}
          editable={true}
          onUpdate={(updatedExam) => setGeneratedExam(updatedExam)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl">

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Create Exam Paper</h1>
        <p className="text-muted-foreground">Define academic context and question structure. AI will generate questions automatically.</p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

        {/* LEFT COLUMN: EXAM DETAILS */}
        <Card className="shadow-sm border-slate-200 h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <FileText className="h-5 w-5 text-primary" />
              Exam Details
            </CardTitle>
            <CardDescription>Academic parameters for the exam</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">

            {/* Board & Standard Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Board / University</Label>
                <Select value={examDetails.board} onValueChange={(val) => handleDetailChange('board', val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Class / Semester</Label>
                <Select value={examDetails.standard} onValueChange={(val) => handleDetailChange('standard', val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {STANDARDS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject & Duration Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Subject</Label>
                <Select value={examDetails.subject} onValueChange={(val) => handleDetailChange('subject', val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Duration (mins)</Label>
                <Input
                  type="number"
                  className="bg-white"
                  value={examDetails.duration}
                  onChange={(e) => handleDetailChange('duration', e.target.value)}
                />
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Topics / Chapters</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={getSuggestedTopics}
                  disabled={!examDetails.subject || loadingSuggestions}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  {loadingSuggestions ? 'Suggesting...' : 'Suggest Topics'}
                </Button>
              </div>
              <Textarea
                placeholder="e.g. Calculus, Optics, Organic Chemistry..."
                className="bg-white min-h-[100px] resize-none"
                value={examDetails.topics}
                onChange={(e) => handleDetailChange('topics', e.target.value)}
              />
              {topicSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-xs font-medium text-purple-700 w-full mb-1">Click to add:</span>
                  {topicSuggestions.map((topic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addTopicSuggestion(topic)}
                      className="px-3 py-1 text-sm bg-white border border-purple-300 rounded-full hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTopicSuggestions([])}
                    className="px-3 py-1 text-xs text-purple-600 hover:text-purple-800"
                  >
                    Clear suggestions
                  </button>
                </div>
              )}
            </div>

            {/* Total Marks Highlight */}
            <div className="pt-2">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
                <Label className="text-base font-semibold text-slate-700">Total Exam Marks</Label>
                <Input
                  type="number"
                  className="w-32 bg-white text-right font-bold text-lg"
                  value={examDetails.totalMarks}
                  onChange={(e) => handleDetailChange('totalMarks', e.target.value)}
                />
              </div>
            </div>

          </CardContent>
        </Card>


        {/* RIGHT COLUMN: QUESTION DISTRIBUTION */}
        <Card className="shadow-sm border-slate-200 h-fit flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Calculator className="h-5 w-5 text-primary" />
                  Question Distribution
                </CardTitle>
                <CardDescription>Configure sections (A, B, C...)</CardDescription>
              </div>
              {/* Visual Counter badge */}
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wide">
                {distribution.length} Sections
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6 flex-1">

            <div className="space-y-5">
              {distribution.map((row, index) => (
                <div key={row.id} className="relative group">
                  {/* Section Connector Line (visual polish) */}
                  {index !== distribution.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-slate-100 -z-10" />
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors">

                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200 text-sm">
                          {getSectionLabel(index)}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700">Section {getSectionLabel(index)}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => removeDistributionRow(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Inputs Grid - Only QTY, MARKS, DIFF */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">QTY</Label>
                        <Input
                          type="number" min="1"
                          className="h-9 text-center"
                          value={row.count}
                          onChange={(e) => handleDistributionChange(row.id, 'count', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MARKS/Q</Label>
                        <Input
                          type="number" min="1"
                          className="h-9 text-center"
                          value={row.marks}
                          onChange={(e) => handleDistributionChange(row.id, 'marks', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DIFF</Label>
                        <Select value={row.difficulty} onValueChange={(val) => handleDistributionChange(row.id, 'difficulty', val)}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={addDistributionRow}
              className="w-full border-dashed border-2 bg-slate-50/50 text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-primary/5 h-12"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Section
            </Button>

          </CardContent>

          {/* Action Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-xl mt-auto">
            <div className="flex flex-col gap-4">

              {/* Summary Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    <span>{distribution.length} Sections</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>{distribution.reduce((acc, r) => acc + r.count, 0)} Questions</span>
                  </div>
                </div>

                <div className={`font-medium ${allocatedMarks === parseInt(examDetails.totalMarks) ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {allocatedMarks} / {examDetails.totalMarks} Marks
                </div>
              </div>

              {/* Generate Button */}
              <Button
                size="lg"
                className="w-full shadow-md font-semibold text-base"
                onClick={generateExam}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Question Paper
              </Button>
            </div>
          </div>

        </Card>

      </div>
    </div>
  );
}
