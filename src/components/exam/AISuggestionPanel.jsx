import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export function AISuggestionPanel({ examDetails, onApplySuggestions }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const getSuggestions = async () => {
        // Basic validation
        if (!examDetails.subject && !examDetails.topics) {
            toast.error('Please enter at least a subject or topics to get AI suggestions');
            return;
        }

        setLoading(true);

        try {
            // Call AI to get suggestions for exam structure
            const prompt = `Based on this exam information:
Subject: ${examDetails.subject || 'Not specified'}
Topics: ${examDetails.topics || 'Not specified'}
Board: ${examDetails.board || 'Not specified'}
Standard: ${examDetails.standard || 'Not specified'}

Suggest:
1. Appropriate board/university if not specified
2. Suitable class/semester if not specified
3. Relevant chapters/topics to include
4. Recommended difficulty distribution (Easy/Medium/Hard percentages)
5. Suggested question type mix (MCQ/Short/Long Answer)`;

            // Mock suggestions for now - in production, call AI API
            const mockSuggestions = {
                board: examDetails.board || 'CBSE',
                standard: examDetails.standard || 'Class 12',
                topics: examDetails.topics || `Suggested topics for ${examDetails.subject}:
- Introduction and fundamentals
- Core concepts and applications
- Advanced topics and problem solving`,
                distribution: [
                    { count: 15, marks: 1, difficulty: 'Easy', type: 'MCQ' },
                    { count: 8, marks: 3, difficulty: 'Medium', type: 'Short Answer' },
                    { count: 4, marks: 8, difficulty: 'Hard', type: 'Long Answer' },
                ]
            };

            // Show suggestions to user
            toast.success('AI suggestions generated!', {
                description: 'Review and edit the suggestions before applying.'
            });

            // Apply suggestions
            if (onApplySuggestions) {
                onApplySuggestions(mockSuggestions);
            }

            setOpen(false);

        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            toast.error('Failed to get AI suggestions', {
                description: 'Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                    <Sparkles className="h-4 w-4" />
                    Get AI Suggestions
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-purple-600" />
                        AI Exam Suggestions
                    </DialogTitle>
                    <DialogDescription>
                        Get AI-powered suggestions for your exam structure based on the information you've provided.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                        <p className="font-medium text-purple-900">Current Information:</p>
                        <div className="text-sm text-purple-700 space-y-1">
                            <p>• Subject: {examDetails.subject || 'Not specified'}</p>
                            <p>• Board: {examDetails.board || 'Not specified'}</p>
                            <p>• Standard: {examDetails.standard || 'Not specified'}</p>
                            <p>• Topics: {examDetails.topics ? 'Provided' : 'Not specified'}</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                        <p className="font-medium mb-1">ℹ️ What AI will suggest:</p>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                            <li>Appropriate board/university (if not selected)</li>
                            <li>Suitable class/semester (if not selected)</li>
                            <li>Relevant chapters and topics to include</li>
                            <li>Recommended difficulty distribution</li>
                            <li>Suggested question type mix</li>
                        </ul>
                        <p className="text-xs mt-2 font-medium">You can edit all suggestions before generating the exam.</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={getSuggestions} disabled={loading} className="gap-2 bg-purple-600 hover:bg-purple-700">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Getting suggestions...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Get Suggestions
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
