// server/src/data/defaultTracks.ts
//
// Starting content for the four SHS strands. The tracks collection is seeded
// with this the first time it is read; after that, admins edit the stored copy.
import type { TrackKey } from "./aptitudeQuestions.js";

export interface TrackSeed {
  code: TrackKey;
  name: string;
  fullName: string;
  description: string;
  subjects: string[];
  careers: string[];
  requirements: string;
}

export const defaultTracks: TrackSeed[] = [
  {
    code: "stem",
    name: "STEM",
    fullName: "Science, Technology, Engineering, and Mathematics",
    description:
      "Perfect for students interested in scientific inquiry, technological innovation, and mathematical problem-solving.",
    subjects: [
      "Pre-Calculus",
      "Basic Calculus",
      "General Physics",
      "General Chemistry",
      "General Biology"
    ],
    careers: [
      "Engineer",
      "Computer Scientist",
      "Medical Doctor",
      "Research Scientist",
      "Architect",
      "Data Analyst"
    ],
    requirements:
      "Average of 85 and above, especially in Science and Mathematics"
  },
  {
    code: "abm",
    name: "ABM",
    fullName: "Accountancy, Business, and Management",
    description:
      "Ideal for students with entrepreneurial spirit and interest in business operations, finance, and management.",
    subjects: [
      "Fundamentals of Accountancy",
      "Business Mathematics",
      "Applied Economics",
      "Business Finance",
      "Organization and Management"
    ],
    careers: [
      "Accountant",
      "Business Manager",
      "Marketing Professional",
      "Financial Analyst",
      "HR Manager",
      "Business Consultant"
    ],
    requirements:
      "Average of 83 and above, strong analytical and communication skills"
  },
  {
    code: "humss",
    name: "HUMSS",
    fullName: "Humanities and Social Sciences",
    description:
      "Best suited for students passionate about understanding human behavior, society, culture, and communication.",
    subjects: [
      "Creative Writing",
      "Introduction to World Religions",
      "Philippine Politics and Governance",
      "Disciplines and Ideas in Social Sciences",
      "Creative Nonfiction"
    ],
    careers: [
      "Lawyer",
      "Psychologist",
      "Teacher",
      "Social Worker",
      "Journalist",
      "Diplomat"
    ],
    requirements:
      "Average of 83 and above, strong reading comprehension and writing skills"
  },
  {
    code: "gas",
    name: "GAS",
    fullName: "General Academic Strand",
    description:
      "A flexible track that allows exploration of various fields before choosing a specific career path in college.",
    subjects: [
      "Humanities Subjects",
      "Social Sciences Subjects",
      "Applied Subjects",
      "Specialized Subjects (Electives)",
      "General Education Subjects"
    ],
    careers: [
      "Various College Courses",
      "Interdisciplinary Fields",
      "Liberal Arts Programs",
      "Communication Specialist",
      "Public Relations Officer"
    ],
    requirements: "Average of 80 and above"
  }
];
