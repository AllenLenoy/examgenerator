import { NavLink } from '@/components/NavLink';
import { FileText, BookOpen, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">ExamGen</span>
        </div>
        
        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeClassName="bg-accent text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            Question Bank
          </NavLink>
          <NavLink
            to="/generate"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeClassName="bg-accent text-foreground"
          >
            <Sparkles className="h-4 w-4" />
            Generate Exam
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
