import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  ClipboardList,
  LogOut,
  Menu,
  Home,
  BookOpen
} from 'lucide-react';
import { ExamGenerator } from '@/components/exam/ExamGenerator';
import { ExamPreview } from '@/components/exam/ExamPreview';
import { useQuestionBank } from '@/context/QuestionBankContext';

const navItems = [
  { label: 'Overview', icon: Home, path: '/dashboard' },
  { label: 'Create Exam', icon: ClipboardList, path: '/dashboard/create-exam' },
  { label: 'My Exams', icon: FileText, path: '/dashboard/exams' },
];

function DashboardOverview() {
  const { questions, exams, getCategories } = useQuestionBank();

  const stats = [
    { label: 'Total Questions', value: questions.length, icon: BookOpen },
    { label: 'Exams Created', value: exams.length, icon: FileText },
    { label: 'Categories', value: getCategories().length, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your exam management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/dashboard/create-exam">
                <ClipboardList className="mr-2 h-4 w-4" />
                Create New Exam
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <p className="text-muted-foreground text-sm">No exams created yet.</p>
            ) : (
              <ul className="space-y-2">
                {exams.slice(0, 5).map((exam) => (
                  <li key={exam.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="font-medium text-sm">{exam.title}</span>
                    <span className="text-xs text-muted-foreground">{exam.totalMarks} marks</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateExamPage() {
  return (
    <div className="space-y-6">
      {/* Header is inside ExamGenerator now, but keeping container is fine */}
      <ExamGenerator />
    </div>
  );
}

function MyExamsPage() {
  const { exams } = useQuestionBank();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Exams</h1>
        <p className="text-muted-foreground mt-1">View and manage your created exams</p>
      </div>
      {exams.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No exams created yet.</p>
            <Button asChild className="mt-4">
              <Link to="/dashboard/create-exam">Create Your First Exam</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle className="text-lg">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Questions: {exam.questions.length}</p>
                  <p>Total Marks: {exam.totalMarks}</p>
                  {exam.duration && <p>Duration: {exam.duration} min</p>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">ExamGen</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
            <Link to="/">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Link>
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur px-4 lg:px-6">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">T</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="create-exam" element={<CreateExamPage />} />
            <Route path="exams" element={<MyExamsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
