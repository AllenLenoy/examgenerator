# Exam Genie

Exam Genie is a modern, full-stack capable exam generation and management platform designed to streamline the assessment process for educational institutions. Built with React and a robust modern tech stack, it provides tailored experiences for Teachers, Students, and Administrators.

## 🚀 Features

### 👥 Role-Based Dashboards
- **Teacher Dashboard**: 
  - Create and manage a comprehensive question bank.
  - Generate exams with customizable parameters (difficulty, subject, question types).
  - Monitor student progress and manage assessments.
- **Student Dashboard**: 
  - Access assigned exams.
  - Take tests in a user-friendly interface.
  - View results and performance history.
- **Admin Dashboard**: 
  - Oversee system usage.
  - Manage user accounts and permissions.

### 📚 Question Bank Management
- **Diverse Question Types**: Support for Multiple Choice Questions (MCQ), True/False, and Short Answer questions.
- **Categorization**: Organize questions by Subject (e.g., Geography, Science, Math) and Difficulty (Easy, Medium, Hard).
- **Dynamic Management**: Easily add, edit, and delete questions.

### 🎨 Modern User Interface
- **Responsive Design**: Fully responsive layout that works seamlessly on desktop and mobile devices.
- **Accessible Components**: Built using `shadcn/ui` for high accessibility standards.
- **Theming**: Clean and professional aesthetic powered by Tailwind CSS.

## 🛠️ Technology Stack

- **Frontend Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) for fast development and optimized builds.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling and [shadcn/ui](https://ui.shadcn.com/) for pre-built accessible components.
- **Routing**: [React Router DOM](https://reactrouter.com/) for client-side routing.
- **State Management**: 
  - React Context API for global state (e.g., Question Bank).
  - [TanStack Query (React Query)](https://tanstack.com/query/latest) for efficient server state management.
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) paired with [Zod](https://zod.dev/) for robust schema validation.
- **Icons**: [Lucide React](https://lucide.dev/) for consistent iconography.
- **Charts**: [Recharts](https://recharts.org/) for data visualization.

## 📂 Project Structure

```
exam-genie-main/
├── src/
│   ├── components/      # Reusable UI components (buttons, inputs, etc.)
│   ├── context/         # Global state providers (QuestionBankContext)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Application pages
│   │   ├── dashboard/   # Role-specific dashboard pages
│   │   ├── Auth.jsx     # Authentication page
│   │   └── Home.jsx     # Landing page
│   ├── App.jsx          # Main application component with routing
│   └── main.jsx         # Entry point
├── public/              # Static assets
└── package.json         # Project dependencies and scripts
```

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exam-genie-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:8080` (or the port shown in your terminal).

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Previews the production build locally.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
