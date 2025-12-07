import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  ClipboardList, 
  BarChart3,
  LogOut,
  Menu,
  Home,
  Clock,
  CheckCircle,
  Play
} from 'lucide-react';

const navItems = [
  { label: 'Overview', icon: Home, path: '/dashboard/student' },
  { label: 'My Tests', icon: ClipboardList, path: '/dashboard/student/tests' },
  { label: 'Results', icon: CheckCircle, path: '/dashboard/student/results' },
  { label: 'Analytics', icon: BarChart3, path: '/dashboard/student/analytics' },
];

function StudentOverview() {
  const stats = [
    { label: 'Pending Tests', value: 0, icon: Clock },
    { label: 'Completed', value: 0, icon: CheckCircle },
    { label: 'Average Score', value: '-', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Student!</h1>
        <p className="text-muted-foreground mt-1">Here's your test overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending tests.</p>
            <p className="text-sm text-muted-foreground mt-2">Your assigned tests will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MyTestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Tests</h1>
        <p className="text-muted-foreground mt-1">View and attempt your assigned tests</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tests assigned yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Results</h1>
        <p className="text-muted-foreground mt-1">View your test results</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No results yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Complete tests to see your results here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your performance over time</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Analytics will be available after completing tests.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentDashboard() {
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
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard/student' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
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
              <span className="text-sm font-medium text-primary">S</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route index element={<StudentOverview />} />
            <Route path="tests" element={<MyTestsPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="analytics" element={<StudentAnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
