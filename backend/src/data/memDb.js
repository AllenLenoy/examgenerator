// In-memory storage for mutable data
// This replaces a real database for this stage of development

export const TEMPLATES = [
    {
        id: "template-1",
        title: "Mathematics Mid-Term",
        duration: 60,
        totalMarks: 50,
        rules: [
            { topic: "Algebra", difficulty: "Easy", count: 3 },
            { topic: "Geometry", difficulty: "Hard", count: 2 }
        ]
    }
];
export const ATTEMPTS = [];

export const questions = [
    // Algebra - Easy
    {
        id: "q1",
        text: "Solve for x: 2x + 5 = 15",
        options: ["5", "10", "2", "7"],
        correctOption: 0,
        difficulty: "Easy",
        topic: "Algebra"
    },
    {
        id: "q2",
        text: "Simplify: 3(x + 2) - x",
        options: ["2x + 6", "2x + 2", "3x + 6", "4x"],
        correctOption: 0,
        difficulty: "Easy",
        topic: "Algebra"
    },
    {
        id: "q3",
        text: "What is the slope of y = 3x + 2?",
        options: ["2", "3", "5", "1"],
        correctOption: 1,
        difficulty: "Easy",
        topic: "Algebra"
    },
    {
        id: "q4",
        text: "If x = 2, what is x^2?",
        options: ["2", "4", "8", "6"],
        correctOption: 1,
        difficulty: "Easy",
        topic: "Algebra"
    },
    {
        id: "q5",
        text: "Solve: x - 3 = 7",
        options: ["4", "5", "10", "11"],
        correctOption: 2,
        difficulty: "Easy",
        topic: "Algebra"
    },

    // Geometry - Hard
    {
        id: "q6",
        text: "Calculate the volume of a sphere with radius 3 (use pi=3.14)",
        options: ["113.04", "100.5", "50.24", "150.8"],
        correctOption: 0,
        difficulty: "Hard",
        topic: "Geometry"
    },
    {
        id: "q7",
        text: "Find the area of a regular hexagon with side length 4",
        options: ["24√3", "16√3", "48", "36"],
        correctOption: 0,
        difficulty: "Hard",
        topic: "Geometry"
    },
    {
        id: "q8",
        text: "In a right triangle, if legs are 5 and 12, what is the hypotenuse?",
        options: ["10", "13", "15", "17"],
        correctOption: 1,
        difficulty: "Hard",
        topic: "Geometry"
    },
    {
        id: "q9",
        text: "Total internal sum of angles in a convex pentagon?",
        options: ["360", "540", "720", "180"],
        correctOption: 1,
        difficulty: "Hard",
        topic: "Geometry"
    },
    {
        id: "q10",
        text: "Surface area of a cube with side 5?",
        options: ["125", "150", "100", "75"],
        correctOption: 1,
        difficulty: "Hard",
        topic: "Geometry"
    }
];
