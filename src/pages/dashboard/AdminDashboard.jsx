import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Users,
  BarChart3,
  LogOut,
  Menu,
  Home,
  Settings,
  Shield,
  GraduationCap,
  UserPlus,
  Search,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminAPI } from '@/lib/apiService';

const navItems = [
  { label: 'Overview', icon: Home, path: '/dashboard/admin' },
  { label: 'Users', icon: Users, path: '/dashboard/admin/users' },
  { label: 'System', icon: Settings, path: '/dashboard/admin/system' },
];

function AdminOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      toast({
        title: 'Error loading dashboard',
        description: error.response?.data?.error || 'Could not fetch dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData ? [
    { label: 'Total Teachers', value: dashboardData.users.teachers, icon: GraduationCap },
    { label: 'Total Students', value: dashboardData.users.students, icon: Users },
    { label: 'Total Exams', value: dashboardData.system.exams, icon: FileText },
    { label: 'Total Questions', value: dashboardData.system.questions, icon: Shield },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your institution's exam system</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentUsers?.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.recentUsers.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded">{user.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent registrations
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm text-green-500">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Authentication</span>
                <span className="text-sm text-green-500">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="text-sm font-medium">{dashboardData?.users?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Inactive Users</span>
                <span className="text-sm text-yellow-600">{dashboardData?.users?.inactive || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const { toast } = useToast();

  // New user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  useEffect(() => {
    fetchUsers();
    fetchTeachers();
  }, [filter, search]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.role = filter;
      if (search) params.search = search;

      const response = await adminAPI.getUsers(params);
      // Filter out deleted users (isActive: false)
      const activeUsers = response.data.users.filter(user => user.isActive !== false);
      setUsers(activeUsers);
    } catch (error) {
      toast({
        title: 'Error loading users',
        description: error.response?.data?.error || 'Could not fetch users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getUsers({ role: 'teacher' });
      setTeachers(response.data.users.filter(t => t.isActive));
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(newUser);
      toast({
        title: 'User created',
        description: `${newUser.name} has been added successfully`
      });
      setCreateDialogOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error creating user',
        description: error.response?.data?.error || 'Could not create user',
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      toast({
        title: 'User status updated',
        description: 'User status has been changed'
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Could not update user status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? They will be permanently removed from the list.')) return;

    try {
      await adminAPI.deleteUser(userId);
      toast({
        title: 'User deleted',
        description: 'User has been deleted and removed from the system'
      });
      // Immediately filter out the deleted user
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Could not delete user',
        variant: 'destructive'
      });
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedTeacher) {
      toast({
        title: 'Missing selection',
        description: 'Please select both a student and a teacher',
        variant: 'destructive'
      });
      return;
    }

    try {
      await adminAPI.assignStudents({
        teacherId: selectedTeacher,
        studentIds: [selectedStudent._id]
      });

      toast({
        title: 'Student assigned!',
        description: `${selectedStudent.name} assigned to teacher successfully`
      });

      setAssignDialogOpen(false);
      setSelectedStudent(null);
      setSelectedTeacher('');
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Assignment failed',
        description: error.response?.data?.error || 'Could not assign student',
        variant: 'destructive'
      });
    }
  };

  const openAssignDialog = (student) => {
    setSelectedStudent(student);
    setAssignDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all users in the system</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Student Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Student to Teacher</DialogTitle>
            <DialogDescription>
              Assign {selectedStudent?.name} to a teacher
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Input value={selectedStudent?.name || ''} disabled />
            </div>
            <div>
              <Label>Select Teacher</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignStudent}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="student">Students</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs bg-primary/10">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user._id)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        {user.role === 'student' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignDialog(user)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
}

function SystemPage() {
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [questionStats, examStats] = await Promise.all([
        adminAPI.getQuestionStats(),
        adminAPI.getExamStats()
      ]);
      setStats({
        questions: questionStats.data,
        exams: examStats.data
      });
    } catch (error) {
      toast({
        title: 'Error loading stats',
        description: error.response?.data?.error || 'Could not fetch system stats',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
        <p className="text-muted-foreground mt-1">View system-wide statistics</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Question Bank</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Questions</span>
                  <span className="text-2xl font-bold">{stats.questions.total}</span>
                </div>
                {stats.questions.bySubject?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">By Subject</h4>
                    <div className="space-y-2">
                      {stats.questions.bySubject.map((item) => (
                        <div key={item._id} className="flex items-center justify-between text-sm">
                          <span>{item._id}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Exams</span>
                  <span className="text-2xl font-bold">{stats.exams.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Exams</span>
                  <span className="text-2xl font-bold">{stats.exams.active}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold">ExamGenie Admin</h2>
            <nav className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="system" element={<SystemPage />} />
        </Routes>
      </div>
    </div>
  );
}
