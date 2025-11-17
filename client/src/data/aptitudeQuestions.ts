// client/src/data/aptitudeQuestions.ts

export type TrackKey = "stem" | "abm" | "humss" | "gas";

export type AptitudeDomain =
  | "verbal"
  | "numerical"
  | "scientific"
  | "abstract"
  | "clerical"
  | "entrepreneurial";

export interface AssessmentOption {
  id: string;
  label: string;
}

export interface AptitudeQuestion {
  id: number;
  domain: AptitudeDomain;
  stem: string;
  options: AssessmentOption[];
  correctOptionId: string;
}

/**
 * CONFIG
 *  - TOTAL_IN_BANK_PER_DOMAIN = 30
 *  - QUESTIONS_PER_DOMAIN_IN_ASSESSMENT = 15
 */
export const QUESTIONS_PER_DOMAIN_IN_ASSESSMENT = 15;

// ---------- QUESTION BANK (180 items total: 30 per domain) ----------
// ID RANGES (for server-side reference if needed):
// 1–30   = verbal
// 31–60  = numerical
// 61–90  = scientific
// 91–120 = abstract
// 121–150 = clerical
// 151–180 = entrepreneurial

export const aptitudeQuestionBank: AptitudeQuestion[] = [
  // ===================== VERBAL (1–30) =====================
  {
    id: 1,
    domain: "verbal",
    stem: "Which word is MOST similar in meaning to CALM?",
    options: [
      { id: "a", label: "Angry" },
      { id: "b", label: "Peaceful" },
      { id: "c", label: "Loud" },
      { id: "d", label: "Fast" }
    ],
    correctOptionId: "b"
  },
  {
    id: 2,
    domain: "verbal",
    stem: "Which is the BEST title for a story about a student who helps his community during a flood?",
    options: [
      { id: "a", label: "The Sleepy Boy" },
      { id: "b", label: "The Lost Bag" },
      { id: "c", label: "The Helpful Hero" },
      { id: "d", label: "The Broken Chair" }
    ],
    correctOptionId: "c"
  },
  {
    id: 3,
    domain: "verbal",
    stem: "Which word is the OPPOSITE of BRAVE?",
    options: [
      { id: "a", label: "Afraid" },
      { id: "b", label: "Strong" },
      { id: "c", label: "Happy" },
      { id: "d", label: "Calm" }
    ],
    correctOptionId: "a"
  },
  {
    id: 4,
    domain: "verbal",
    stem: "Choose the sentence with correct grammar.",
    options: [
      { id: "a", label: "She don’t like fruits." },
      { id: "b", label: "She doesn’t likes fruits." },
      { id: "c", label: "She doesn’t like fruits." },
      { id: "d", label: "She not like fruits." }
    ],
    correctOptionId: "c"
  },
  {
    id: 5,
    domain: "verbal",
    stem: "Which word BEST completes the sentence: The teacher was very ____ with the noisy class.",
    options: [
      { id: "a", label: "patient" },
      { id: "b", label: "patiently" },
      { id: "c", label: "patience" },
      { id: "d", label: "patientness" }
    ],
    correctOptionId: "a"
  },
  {
    id: 6,
    domain: "verbal",
    stem: "Which pair of words are SYNONYMS?",
    options: [
      { id: "a", label: "Hot – Cold" },
      { id: "b", label: "Quick – Fast" },
      { id: "c", label: "Loud – Quiet" },
      { id: "d", label: "Big – Small" }
    ],
    correctOptionId: "b"
  },
  {
    id: 7,
    domain: "verbal",
    stem: "Which sentence is PUNCTUATED correctly?",
    options: [
      { id: "a", label: "Where are you going, Ana?" },
      { id: "b", label: "Where are you going Ana." },
      { id: "c", label: "Where are you going Ana?" },
      { id: "d", label: "Where are you going? Ana" }
    ],
    correctOptionId: "a"
  },
  {
    id: 8,
    domain: "verbal",
    stem: "Which word BEST completes the sentence: He is the ____ student in the class.",
    options: [
      { id: "a", label: "more tall" },
      { id: "b", label: "most tall" },
      { id: "c", label: "tallest" },
      { id: "d", label: "taller" }
    ],
    correctOptionId: "c"
  },
  {
    id: 9,
    domain: "verbal",
    stem: "Which of these is a PROVERB?",
    options: [
      { id: "a", label: "I am hungry." },
      { id: "b", label: "Practice makes perfect." },
      { id: "c", label: "The sun is bright." },
      { id: "d", label: "She likes music." }
    ],
    correctOptionId: "b"
  },
  {
    id: 10,
    domain: "verbal",
    stem: "Which sentence shows a CAUSE and EFFECT relationship?",
    options: [
      { id: "a", label: "He read a book." },
      { id: "b", label: "She sings beautifully." },
      { id: "c", label: "It rained, so the streets were wet." },
      { id: "d", label: "They play basketball." }
    ],
    correctOptionId: "c"
  },
  {
    id: 11,
    domain: "verbal",
    stem: "The idiom “raining cats and dogs” means:",
    options: [
      { id: "a", label: "There are many animals outside." },
      { id: "b", label: "It is raining very hard." },
      { id: "c", label: "There are no clouds." },
      { id: "d", label: "It is hot and sunny." }
    ],
    correctOptionId: "b"
  },
  {
    id: 12,
    domain: "verbal",
    stem: "Which word BEST completes the sentence: Please ____ your name on the line.",
    options: [
      { id: "a", label: "write" },
      { id: "b", label: "right" },
      { id: "c", label: "wrote" },
      { id: "d", label: "written" }
    ],
    correctOptionId: "a"
  },
  {
    id: 13,
    domain: "verbal",
    stem: "Which sentence is written in the FUTURE tense?",
    options: [
      { id: "a", label: "She cooks dinner." },
      { id: "b", label: "She cooked dinner." },
      { id: "c", label: "She will cook dinner." },
      { id: "d", label: "She is cooking dinner." }
    ],
    correctOptionId: "c"
  },
  {
    id: 14,
    domain: "verbal",
    stem: "Choose the CORRECT plural form.",
    options: [
      { id: "a", label: "childs" },
      { id: "b", label: "childes" },
      { id: "c", label: "children" },
      { id: "d", label: "childrens" }
    ],
    correctOptionId: "c"
  },
  {
    id: 15,
    domain: "verbal",
    stem: "Which word BEST completes the sentence: Liza felt ____ after passing the entrance exam.",
    options: [
      { id: "a", label: "joy" },
      { id: "b", label: "joyful" },
      { id: "c", label: "joyfully" },
      { id: "d", label: "joyfulness" }
    ],
    correctOptionId: "b"
  },
  {
    id: 16,
    domain: "verbal",
    stem: "Which sentence uses the correct form of the verb?",
    options: [
      { id: "a", label: "They was playing outside." },
      { id: "b", label: "They were play outside." },
      { id: "c", label: "They were playing outside." },
      { id: "d", label: "They playing outside." }
    ],
    correctOptionId: "c"
  },
  {
    id: 17,
    domain: "verbal",
    stem: "Which word is a SYNONYM of “difficult”?",
    options: [
      { id: "a", label: "Easy" },
      { id: "b", label: "Hard" },
      { id: "c", label: "Simple" },
      { id: "d", label: "Light" }
    ],
    correctOptionId: "b"
  },
  {
    id: 18,
    domain: "verbal",
    stem: "Which word is the OPPOSITE of “polite”?",
    options: [
      { id: "a", label: "Kind" },
      { id: "b", label: "Rude" },
      { id: "c", label: "Friendly" },
      { id: "d", label: "Gentle" }
    ],
    correctOptionId: "b"
  },
  {
    id: 19,
    domain: "verbal",
    stem: "Choose the sentence with the correct subject–verb agreement.",
    options: [
      { id: "a", label: "The group of students are noisy." },
      { id: "b", label: "The group of students is noisy." },
      { id: "c", label: "The groups of student is noisy." },
      { id: "d", label: "The groups of student are noisy." }
    ],
    correctOptionId: "b"
  },
  {
    id: 20,
    domain: "verbal",
    stem: "Which word BEST completes the sentence: She is known for her ____ in solving complex problems.",
    options: [
      { id: "a", label: "creative" },
      { id: "b", label: "creativity" },
      { id: "c", label: "creatively" },
      { id: "d", label: "creation" }
    ],
    correctOptionId: "b"
  },
  {
    id: 21,
    domain: "verbal",
    stem: "Which of the following is an IDIOM?",
    options: [
      { id: "a", label: "The room is very dark." },
      { id: "b", label: "He has a heart of gold." },
      { id: "c", label: "She studies every night." },
      { id: "d", label: "They live in Manila." }
    ],
    correctOptionId: "b"
  },
  {
    id: 22,
    domain: "verbal",
    stem: "What does the idiom “break the ice” mean?",
    options: [
      { id: "a", label: "Start a conversation" },
      { id: "b", label: "Break something cold" },
      { id: "c", label: "End a friendship" },
      { id: "d", label: "Leave the room" }
    ],
    correctOptionId: "a"
  },
  {
    id: 23,
    domain: "verbal",
    stem: "Which sentence is written in the PAST tense?",
    options: [
      { id: "a", label: "He will join the team." },
      { id: "b", label: "He joins the team." },
      { id: "c", label: "He joined the team." },
      { id: "d", label: "He is joining the team." }
    ],
    correctOptionId: "c"
  },
  {
    id: 24,
    domain: "verbal",
    stem: "Which word BEST completes the sentence: The instructions were very ____ and easy to follow.",
    options: [
      { id: "a", label: "clarity" },
      { id: "b", label: "clearly" },
      { id: "c", label: "clear" },
      { id: "d", label: "clearness" }
    ],
    correctOptionId: "c"
  },
  {
    id: 25,
    domain: "verbal",
    stem: "Which sentence contains a SIMILE?",
    options: [
      { id: "a", label: "The classroom was a jungle." },
      { id: "b", label: "Her smile is like the sun." },
      { id: "c", label: "The wind whispered softly." },
      { id: "d", label: "Time is a thief." }
    ],
    correctOptionId: "b"
  },
  {
    id: 26,
    domain: "verbal",
    stem: "Which pair of words are ANTONYMS?",
    options: [
      { id: "a", label: "Big – Large" },
      { id: "b", label: "Happy – Joyful" },
      { id: "c", label: "Begin – Start" },
      { id: "d", label: "Fast – Slow" }
    ],
    correctOptionId: "d"
  },
  {
    id: 27,
    domain: "verbal",
    stem: "Which word BEST completes the sentence: The film was so ____ that I recommended it to my classmates.",
    options: [
      { id: "a", label: "interest" },
      { id: "b", label: "interesting" },
      { id: "c", label: "interested" },
      { id: "d", label: "interests" }
    ],
    correctOptionId: "b"
  },
  {
    id: 28,
    domain: "verbal",
    stem: "Choose the correctly punctuated sentence.",
    options: [
      { id: "a", label: "Maria Jose and Leo went to the mall." },
      { id: "b", label: "Maria, Jose and Leo went to the mall." },
      { id: "c", label: "Maria Jose, and Leo went to the mall." },
      { id: "d", label: "Maria, Jose, and, Leo went to the mall." }
    ],
    correctOptionId: "b"
  },
  {
    id: 29,
    domain: "verbal",
    stem: "Which of the following is a FACT?",
    options: [
      { id: "a", label: "Chocolate ice cream is the best flavor." },
      { id: "b", label: "The Philippines is in Southeast Asia." },
      { id: "c", label: "Singing is more fun than dancing." },
      { id: "d", label: "Math is the hardest subject." }
    ],
    correctOptionId: "b"
  },
  {
    id: 30,
    domain: "verbal",
    stem: "Which of the following is an OPINION?",
    options: [
      { id: "a", label: "Water boils at 100°C at sea level." },
      { id: "b", label: "Cebu is an island in the Philippines." },
      { id: "c", label: "Science is more exciting than History." },
      { id: "d", label: "The human heart has four chambers." }
    ],
    correctOptionId: "c"
  },

  // ===================== NUMERICAL (31–60) =====================
  {
    id: 31,
    domain: "numerical",
    stem: "What is 3/4 of 32?",
    options: [
      { id: "a", label: "16" },
      { id: "b", label: "20" },
      { id: "c", label: "24" },
      { id: "d", label: "28" }
    ],
    correctOptionId: "c"
  },
  {
    id: 32,
    domain: "numerical",
    stem: "If a shirt costs ₱350 and is discounted by 20%, what is the new price?",
    options: [
      { id: "a", label: "₱70" },
      { id: "b", label: "₱280" },
      { id: "c", label: "₱300" },
      { id: "d", label: "₱320" }
    ],
    correctOptionId: "b"
  },
  {
    id: 33,
    domain: "numerical",
    stem: "What is 15 × 12?",
    options: [
      { id: "a", label: "160" },
      { id: "b", label: "170" },
      { id: "c", label: "180" },
      { id: "d", label: "190" }
    ],
    correctOptionId: "c"
  },
  {
    id: 34,
    domain: "numerical",
    stem: "Solve: 120 ÷ 8 = ?",
    options: [
      { id: "a", label: "12" },
      { id: "b", label: "14" },
      { id: "c", label: "15" },
      { id: "d", label: "16" }
    ],
    correctOptionId: "c"
  },
  {
    id: 35,
    domain: "numerical",
    stem: "Which is the SMALLEST number?",
    options: [
      { id: "a", label: "0.9" },
      { id: "b", label: "0.45" },
      { id: "c", label: "0.5" },
      { id: "d", label: "0.75" }
    ],
    correctOptionId: "b"
  },
  {
    id: 36,
    domain: "numerical",
    stem: "What is 25% of 200?",
    options: [
      { id: "a", label: "25" },
      { id: "b", label: "40" },
      { id: "c", label: "50" },
      { id: "d", label: "75" }
    ],
    correctOptionId: "c"
  },
  {
    id: 37,
    domain: "numerical",
    stem: "Solve: 7² = ?",
    options: [
      { id: "a", label: "14" },
      { id: "b", label: "42" },
      { id: "c", label: "49" },
      { id: "d", label: "77" }
    ],
    correctOptionId: "c"
  },
  {
    id: 38,
    domain: "numerical",
    stem: "Which fraction is equivalent to 0.5?",
    options: [
      { id: "a", label: "1/3" },
      { id: "b", label: "1/4" },
      { id: "c", label: "1/2" },
      { id: "d", label: "2/3" }
    ],
    correctOptionId: "c"
  },
  {
    id: 39,
    domain: "numerical",
    stem: "A rectangle is 8 cm long and 5 cm wide. What is its area?",
    options: [
      { id: "a", label: "13 cm²" },
      { id: "b", label: "20 cm²" },
      { id: "c", label: "30 cm²" },
      { id: "d", label: "40 cm²" }
    ],
    correctOptionId: "d"
  },
  {
    id: 40,
    domain: "numerical",
    stem: "If you have ₱500 and you spend ₱275, how much is left?",
    options: [
      { id: "a", label: "₱125" },
      { id: "b", label: "₱200" },
      { id: "c", label: "₱225" },
      { id: "d", label: "₱250" }
    ],
    correctOptionId: "c"
  },
  {
    id: 41,
    domain: "numerical",
    stem: "Solve: (18 + 12) ÷ 5 = ?",
    options: [
      { id: "a", label: "5" },
      { id: "b", label: "6" },
      { id: "c", label: "7" },
      { id: "d", label: "8" }
    ],
    correctOptionId: "b"
  },
  {
    id: 42,
    domain: "numerical",
    stem: "What is the next term: 4, 7, 10, 13, ___?",
    options: [
      { id: "a", label: "14" },
      { id: "b", label: "16" },
      { id: "c", label: "17" },
      { id: "d", label: "20" }
    ],
    correctOptionId: "b"
  },
  {
    id: 43,
    domain: "numerical",
    stem: "If 3x = 21, what is x?",
    options: [
      { id: "a", label: "5" },
      { id: "b", label: "6" },
      { id: "c", label: "7" },
      { id: "d", label: "9" }
    ],
    correctOptionId: "c"
  },
  {
    id: 44,
    domain: "numerical",
    stem: "The average of 10 and 14 is:",
    options: [
      { id: "a", label: "11" },
      { id: "b", label: "12" },
      { id: "c", label: "13" },
      { id: "d", label: "24" }
    ],
    correctOptionId: "b"
  },
  {
    id: 45,
    domain: "numerical",
    stem: "Solve: 2x + 5 = 17. What is x?",
    options: [
      { id: "a", label: "5" },
      { id: "b", label: "6" },
      { id: "c", label: "7" },
      { id: "d", label: "8" }
    ],
    correctOptionId: "b"
  },
  {
    id: 46,
    domain: "numerical",
    stem: "A student scored 18, 20, 22, and 20 in four quizzes. What is the MEAN score?",
    options: [
      { id: "a", label: "19" },
      { id: "b", label: "20" },
      { id: "c", label: "21" },
      { id: "d", label: "22" }
    ],
    correctOptionId: "b"
  },
  {
    id: 47,
    domain: "numerical",
    stem: "Which is equal to 3/5?",
    options: [
      { id: "a", label: "6/10" },
      { id: "b", label: "9/20" },
      { id: "c", label: "12/25" },
      { id: "d", label: "15/30" }
    ],
    correctOptionId: "a"
  },
  {
    id: 48,
    domain: "numerical",
    stem: "If a jeepney fare is ₱13 for the first 4 km and ₱2 for every additional km, how much is the fare for 7 km?",
    options: [
      { id: "a", label: "₱17" },
      { id: "b", label: "₱19" },
      { id: "c", label: "₱21" },
      { id: "d", label: "₱23" }
    ],
    correctOptionId: "b"
  },
  {
    id: 49,
    domain: "numerical",
    stem: "What is 15% of 600?",
    options: [
      { id: "a", label: "60" },
      { id: "b", label: "75" },
      { id: "c", label: "80" },
      { id: "d", label: "90" }
    ],
    correctOptionId: "d"
  },
  {
    id: 50,
    domain: "numerical",
    stem: "Which of the following is a RATIO equivalent to 2:3?",
    options: [
      { id: "a", label: "4:5" },
      { id: "b", label: "6:9" },
      { id: "c", label: "8:10" },
      { id: "d", label: "10:14" }
    ],
    correctOptionId: "b"
  },
  {
    id: 51,
    domain: "numerical",
    stem: "A phone originally costs ₱10,000 and is now on sale for ₱8,500. How much is the discount?",
    options: [
      { id: "a", label: "₱500" },
      { id: "b", label: "₱1,000" },
      { id: "c", label: "₱1,500" },
      { id: "d", label: "₱2,000" }
    ],
    correctOptionId: "c"
  },
  {
    id: 52,
    domain: "numerical",
    stem: "What is 0.25 written as a fraction in simplest form?",
    options: [
      { id: "a", label: "1/2" },
      { id: "b", label: "1/3" },
      { id: "c", label: "1/4" },
      { id: "d", label: "2/5" }
    ],
    correctOptionId: "c"
  },
  {
    id: 53,
    domain: "numerical",
    stem: "A triangle has sides 6 cm, 8 cm, and 10 cm. What is its perimeter?",
    options: [
      { id: "a", label: "20 cm" },
      { id: "b", label: "22 cm" },
      { id: "c", label: "24 cm" },
      { id: "d", label: "26 cm" }
    ],
    correctOptionId: "c"
  },
  {
    id: 54,
    domain: "numerical",
    stem: "If 4 notebooks cost ₱120 in total, what is the price of one notebook?",
    options: [
      { id: "a", label: "₱20" },
      { id: "b", label: "₱25" },
      { id: "c", label: "₱30" },
      { id: "d", label: "₱40" }
    ],
    correctOptionId: "c"
  },
  {
    id: 55,
    domain: "numerical",
    stem: "Which of the following is the SIMPLE INTEREST on ₱5,000 at 4% per year for 2 years?",
    options: [
      { id: "a", label: "₱200" },
      { id: "b", label: "₱300" },
      { id: "c", label: "₱400" },
      { id: "d", label: "₱500" }
    ],
    correctOptionId: "a"
  },
  {
    id: 56,
    domain: "numerical",
    stem: "Which is the median of 5, 8, 3, 10, 2?",
    options: [
      { id: "a", label: "3" },
      { id: "b", label: "5" },
      { id: "c", label: "8" },
      { id: "d", label: "10" }
    ],
    correctOptionId: "b"
  },
  {
    id: 57,
    domain: "numerical",
    stem: "Solve: 9(2x − 1) = 45. What is x?",
    options: [
      { id: "a", label: "2" },
      { id: "b", label: "2.5" },
      { id: "c", label: "3" },
      { id: "d", label: "3.5" }
    ],
    correctOptionId: "c"
  },
  {
    id: 58,
    domain: "numerical",
    stem: "A student got 45 points out of 60 in a test. What is his score in percent?",
    options: [
      { id: "a", label: "60%" },
      { id: "b", label: "70%" },
      { id: "c", label: "75%" },
      { id: "d", label: "80%" }
    ],
    correctOptionId: "c"
  },
  {
    id: 59,
    domain: "numerical",
    stem: "Which of the following is 3/8 written as a decimal?",
    options: [
      { id: "a", label: "0.25" },
      { id: "b", label: "0.3" },
      { id: "c", label: "0.375" },
      { id: "d", label: "0.4" }
    ],
    correctOptionId: "c"
  },
  {
    id: 60,
    domain: "numerical",
    stem: "The sides of a square are 9 cm long. What is its area?",
    options: [
      { id: "a", label: "18 cm²" },
      { id: "b", label: "36 cm²" },
      { id: "c", label: "81 cm²" },
      { id: "d", label: "90 cm²" }
    ],
    correctOptionId: "c"
  },

  // ===================== SCIENTIFIC (61–90) =====================
  {
    id: 61,
    domain: "scientific",
    stem: "Which energy transformation happens when you turn on an electric fan?",
    options: [
      { id: "a", label: "Chemical to light" },
      { id: "b", label: "Electrical to mechanical" },
      { id: "c", label: "Heat to sound" },
      { id: "d", label: "Light to chemical" }
    ],
    correctOptionId: "b"
  },
  {
    id: 62,
    domain: "scientific",
    stem: "Which of the following is a renewable source of energy?",
    options: [
      { id: "a", label: "Coal" },
      { id: "b", label: "Oil" },
      { id: "c", label: "Solar" },
      { id: "d", label: "Natural gas" }
    ],
    correctOptionId: "c"
  },
  {
    id: 63,
    domain: "scientific",
    stem: "Water changes from liquid to gas in which process?",
    options: [
      { id: "a", label: "Condensation" },
      { id: "b", label: "Evaporation" },
      { id: "c", label: "Freezing" },
      { id: "d", label: "Melting" }
    ],
    correctOptionId: "b"
  },
  {
    id: 64,
    domain: "scientific",
    stem: "Which organ is responsible for pumping blood in the human body?",
    options: [
      { id: "a", label: "Lungs" },
      { id: "b", label: "Heart" },
      { id: "c", label: "Brain" },
      { id: "d", label: "Stomach" }
    ],
    correctOptionId: "b"
  },
  {
    id: 65,
    domain: "scientific",
    stem: "Which of the following is NOT a state of matter?",
    options: [
      { id: "a", label: "Solid" },
      { id: "b", label: "Liquid" },
      { id: "c", label: "Gas" },
      { id: "d", label: "Energy" }
    ],
    correctOptionId: "d"
  },
  {
    id: 66,
    domain: "scientific",
    stem: "Plants make their own food through a process called:",
    options: [
      { id: "a", label: "Digestion" },
      { id: "b", label: "Photosynthesis" },
      { id: "c", label: "Respiration" },
      { id: "d", label: "Evaporation" }
    ],
    correctOptionId: "b"
  },
  {
    id: 67,
    domain: "scientific",
    stem: "Which gas do humans need to breathe in to survive?",
    options: [
      { id: "a", label: "Carbon dioxide" },
      { id: "b", label: "Oxygen" },
      { id: "c", label: "Nitrogen" },
      { id: "d", label: "Helium" }
    ],
    correctOptionId: "b"
  },
  {
    id: 68,
    domain: "scientific",
    stem: "Which part of the plant absorbs water and minerals from the soil?",
    options: [
      { id: "a", label: "Leaves" },
      { id: "b", label: "Roots" },
      { id: "c", label: "Stem" },
      { id: "d", label: "Flower" }
    ],
    correctOptionId: "b"
  },
  {
    id: 69,
    domain: "scientific",
    stem: "What force pulls objects towards the center of the Earth?",
    options: [
      { id: "a", label: "Friction" },
      { id: "b", label: "Electricity" },
      { id: "c", label: "Gravity" },
      { id: "d", label: "Magnetism" }
    ],
    correctOptionId: "c"
  },
  {
    id: 70,
    domain: "scientific",
    stem: "Which one is an example of a physical change?",
    options: [
      { id: "a", label: "Burning paper" },
      { id: "b", label: "Rusting iron" },
      { id: "c", label: "Melting ice" },
      { id: "d", label: "Baking a cake" }
    ],
    correctOptionId: "c"
  },
  {
    id: 71,
    domain: "scientific",
    stem: "Which is the closest planet to the Sun?",
    options: [
      { id: "a", label: "Earth" },
      { id: "b", label: "Venus" },
      { id: "c", label: "Mercury" },
      { id: "d", label: "Mars" }
    ],
    correctOptionId: "c"
  },
  {
    id: 72,
    domain: "scientific",
    stem: "What do we call the path of a planet around the Sun?",
    options: [
      { id: "a", label: "Rotation" },
      { id: "b", label: "Orbit" },
      { id: "c", label: "Axis" },
      { id: "d", label: "Cycle" }
    ],
    correctOptionId: "b"
  },
  {
    id: 73,
    domain: "scientific",
    stem: "Which of these is an example of a mixture?",
    options: [
      { id: "a", label: "Pure water" },
      { id: "b", label: "Oxygen gas" },
      { id: "c", label: "Salt and water" },
      { id: "d", label: "Gold bar" }
    ],
    correctOptionId: "c"
  },
  {
    id: 74,
    domain: "scientific",
    stem: "Which part of the cell contains genetic material (DNA)?",
    options: [
      { id: "a", label: "Cell membrane" },
      { id: "b", label: "Cytoplasm" },
      { id: "c", label: "Nucleus" },
      { id: "d", label: "Cell wall" }
    ],
    correctOptionId: "c"
  },
  {
    id: 75,
    domain: "scientific",
    stem: "Which blood vessels carry blood AWAY from the heart?",
    options: [
      { id: "a", label: "Veins" },
      { id: "b", label: "Capillaries" },
      { id: "c", label: "Arteries" },
      { id: "d", label: "Venules" }
    ],
    correctOptionId: "c"
  },
  {
    id: 76,
    domain: "scientific",
    stem: "What is the main gas found in the Earth's atmosphere?",
    options: [
      { id: "a", label: "Oxygen" },
      { id: "b", label: "Nitrogen" },
      { id: "c", label: "Carbon dioxide" },
      { id: "d", label: "Hydrogen" }
    ],
    correctOptionId: "b"
  },
  {
    id: 77,
    domain: "scientific",
    stem: "Which organ system is responsible for exchanging gases with the environment?",
    options: [
      { id: "a", label: "Digestive system" },
      { id: "b", label: "Circulatory system" },
      { id: "c", label: "Respiratory system" },
      { id: "d", label: "Skeletal system" }
    ],
    correctOptionId: "c"
  },
  {
    id: 78,
    domain: "scientific",
    stem: "Which of the following is an example of a chemical change?",
    options: [
      { id: "a", label: "Boiling water" },
      { id: "b", label: "Freezing water" },
      { id: "c", label: "Tearing paper" },
      { id: "d", label: "Burning wood" }
    ],
    correctOptionId: "d"
  },
  {
    id: 79,
    domain: "scientific",
    stem: "What is the main function of the red blood cells?",
    options: [
      { id: "a", label: "Fight infections" },
      { id: "b", label: "Carry oxygen" },
      { id: "c", label: "Control body temperature" },
      { id: "d", label: "Form blood clots" }
    ],
    correctOptionId: "b"
  },
  {
    id: 80,
    domain: "scientific",
    stem: "Which unit is commonly used to measure electrical current?",
    options: [
      { id: "a", label: "Volt" },
      { id: "b", label: "Ohm" },
      { id: "c", label: "Ampere" },
      { id: "d", label: "Watt" }
    ],
    correctOptionId: "c"
  },
  {
    id: 81,
    domain: "scientific",
    stem: "Which layer of the Earth is composed mostly of solid rock and forms the continents?",
    options: [
      { id: "a", label: "Inner core" },
      { id: "b", label: "Outer core" },
      { id: "c", label: "Mantle" },
      { id: "d", label: "Crust" }
    ],
    correctOptionId: "d"
  },
  {
    id: 82,
    domain: "scientific",
    stem: "Which of the following best describes an ECOSYSTEM?",
    options: [
      { id: "a", label: "Only plants in a forest" },
      { id: "b", label: "Only animals in a forest" },
      { id: "c", label: "A community of organisms and their environment" },
      { id: "d", label: "Only soil and water in an area" }
    ],
    correctOptionId: "c"
  },
  {
    id: 83,
    domain: "scientific",
    stem: "Which is an example of a non-metal that is essential for life?",
    options: [
      { id: "a", label: "Iron" },
      { id: "b", label: "Copper" },
      { id: "c", label: "Oxygen" },
      { id: "d", label: "Sodium" }
    ],
    correctOptionId: "c"
  },
  {
    id: 84,
    domain: "scientific",
    stem: "Which of the following BEST explains why we see lightning before we hear thunder?",
    options: [
      { id: "a", label: "Sound travels faster than light." },
      { id: "b", label: "Light travels faster than sound." },
      { id: "c", label: "Lightning is closer than thunder." },
      { id: "d", label: "Thunder is brighter than lightning." }
    ],
    correctOptionId: "b"
  },
  {
    id: 85,
    domain: "scientific",
    stem: "Which organ is primarily responsible for filtering waste from the blood?",
    options: [
      { id: "a", label: "Liver" },
      { id: "b", label: "Kidneys" },
      { id: "c", label: "Lungs" },
      { id: "d", label: "Pancreas" }
    ],
    correctOptionId: "b"
  },
  {
    id: 86,
    domain: "scientific",
    stem: "Which of the following shows the CORRECT sequence of the water cycle?",
    options: [
      { id: "a", label: "Evaporation → Condensation → Precipitation" },
      { id: "b", label: "Condensation → Evaporation → Precipitation" },
      { id: "c", label: "Precipitation → Condensation → Evaporation" },
      { id: "d", label: "Evaporation → Precipitation → Condensation" }
    ],
    correctOptionId: "a"
  },
  {
    id: 87,
    domain: "scientific",
    stem: "Which type of simple machine is a seesaw?",
    options: [
      { id: "a", label: "Lever" },
      { id: "b", label: "Pulley" },
      { id: "c", label: "Inclined plane" },
      { id: "d", label: "Wheel and axle" }
    ],
    correctOptionId: "a"
  },
  {
    id: 88,
    domain: "scientific",
    stem: "Which of the following BEST describes friction?",
    options: [
      { id: "a", label: "A force that pushes objects upward" },
      { id: "b", label: "A force that resists motion between surfaces" },
      { id: "c", label: "A force that pulls objects to the Earth" },
      { id: "d", label: "A force that speeds up moving objects" }
    ],
    correctOptionId: "b"
  },
  {
    id: 89,
    domain: "scientific",
    stem: "Which environmental problem is caused mainly by cutting too many trees?",
    options: [
      { id: "a", label: "Overfishing" },
      { id: "b", label: "Deforestation" },
      { id: "c", label: "Air pollution" },
      { id: "d", label: "Coral bleaching" }
    ],
    correctOptionId: "b"
  },
  {
    id: 90,
    domain: "scientific",
    stem: "Which is the PRIMARY source of energy for almost all ecosystems?",
    options: [
      { id: "a", label: "Wind" },
      { id: "b", label: "Sun" },
      { id: "c", label: "Water" },
      { id: "d", label: "Soil" }
    ],
    correctOptionId: "b"
  },

  // ===================== ABSTRACT (91–120) =====================
  {
    id: 91,
    domain: "abstract",
    stem: "Which number completes the pattern? 2, 4, 8, 16, __",
    options: [
      { id: "a", label: "18" },
      { id: "b", label: "24" },
      { id: "c", label: "30" },
      { id: "d", label: "32" }
    ],
    correctOptionId: "d"
  },
  {
    id: 92,
    domain: "abstract",
    stem: "Which number completes the pattern? 5, 10, 20, 40, __",
    options: [
      { id: "a", label: "60" },
      { id: "b", label: "70" },
      { id: "c", label: "80" },
      { id: "d", label: "90" }
    ],
    correctOptionId: "c"
  },
  {
    id: 93,
    domain: "abstract",
    stem: "Which number completes the pattern? 9, 7, 5, 3, __",
    options: [
      { id: "a", label: "0" },
      { id: "b", label: "1" },
      { id: "c", label: "2" },
      { id: "d", label: "4" }
    ],
    correctOptionId: "b"
  },
  {
    id: 94,
    domain: "abstract",
    stem: "Which pair continues the pattern? (A, C), (B, D), (C, E), ( __ )",
    options: [
      { id: "a", label: "(D, F)" },
      { id: "b", label: "(D, G)" },
      { id: "c", label: "(E, G)" },
      { id: "d", label: "(E, F)" }
    ],
    correctOptionId: "a"
  },
  {
    id: 95,
    domain: "abstract",
    stem: "Which number does NOT belong in the group? 3, 6, 9, 12, 15, 22",
    options: [
      { id: "a", label: "3" },
      { id: "b", label: "9" },
      { id: "c", label: "15" },
      { id: "d", label: "22" }
    ],
    correctOptionId: "d"
  },
  {
    id: 96,
    domain: "abstract",
    stem: "Which figure would complete a sequence of shapes increasing in sides: triangle, square, pentagon, __?",
    options: [
      { id: "a", label: "Circle" },
      { id: "b", label: "Hexagon" },
      { id: "c", label: "Octagon" },
      { id: "d", label: "Rectangle" }
    ],
    correctOptionId: "b"
  },
  {
    id: 97,
    domain: "abstract",
    stem: "If all Bloops are Lazzies and some Lazzies are Migs, which is TRUE?",
    options: [
      { id: "a", label: "All Migs are Bloops." },
      { id: "b", label: "Some Migs may be Bloops." },
      { id: "c", label: "No Migs are Bloops." },
      { id: "d", label: "All Bloops are Migs." }
    ],
    correctOptionId: "b"
  },
  {
    id: 98,
    domain: "abstract",
    stem: "Find the odd one out: ▲, ■, ●, 7",
    options: [
      { id: "a", label: "▲" },
      { id: "b", label: "■" },
      { id: "c", label: "●" },
      { id: "d", label: "7" }
    ],
    correctOptionId: "d"
  },
  {
    id: 99,
    domain: "abstract",
    stem: "Which number comes next? 1, 4, 9, 16, 25, __",
    options: [
      { id: "a", label: "30" },
      { id: "b", label: "32" },
      { id: "c", label: "36" },
      { id: "d", label: "49" }
    ],
    correctOptionId: "c"
  },
  {
    id: 100,
    domain: "abstract",
    stem: "Which pair is related in the SAME way as HOT : COLD?",
    options: [
      { id: "a", label: "Up : Down" },
      { id: "b", label: "Chair : Table" },
      { id: "c", label: "Sun : Light" },
      { id: "d", label: "Food : Eat" }
    ],
    correctOptionId: "a"
  },
  {
    id: 101,
    domain: "abstract",
    stem: "If A = 1, B = 2, C = 3, what is the value of F?",
    options: [
      { id: "a", label: "4" },
      { id: "b", label: "5" },
      { id: "c", label: "6" },
      { id: "d", label: "7" }
    ],
    correctOptionId: "c"
  },
  {
    id: 102,
    domain: "abstract",
    stem: "Which number comes next in the pattern? 2, 5, 10, 17, __",
    options: [
      { id: "a", label: "24" },
      { id: "b", label: "26" },
      { id: "c", label: "28" },
      { id: "d", label: "30" }
    ],
    correctOptionId: "a"
  },
  {
    id: 103,
    domain: "abstract",
    stem: "Which of the following sets follows the same rule as (2, 4, 8)?",
    options: [
      { id: "a", label: "(3, 6, 9)" },
      { id: "b", label: "(5, 10, 15)" },
      { id: "c", label: "(4, 8, 16)" },
      { id: "d", label: "(6, 12, 18)" }
    ],
    correctOptionId: "c"
  },
  {
    id: 104,
    domain: "abstract",
    stem: "Which number completes the pattern? 11, 14, 17, 20, __",
    options: [
      { id: "a", label: "21" },
      { id: "b", label: "22" },
      { id: "c", label: "23" },
      { id: "d", label: "24" }
    ],
    correctOptionId: "b"
  },
  {
    id: 105,
    domain: "abstract",
    stem: "Which number completes the pattern? 3, 9, 27, __",
    options: [
      { id: "a", label: "54" },
      { id: "b", label: "72" },
      { id: "c", label: "81" },
      { id: "d", label: "90" }
    ],
    correctOptionId: "c"
  },
  {
    id: 106,
    domain: "abstract",
    stem: "Which letter completes the pattern? D, E, F, H, I, J, __",
    options: [
      { id: "a", label: "K" },
      { id: "b", label: "L" },
      { id: "c", label: "M" },
      { id: "d", label: "N" }
    ],
    correctOptionId: "a"
  },
  {
    id: 107,
    domain: "abstract",
    stem: "Which number does NOT belong? 16, 25, 36, 48, 49",
    options: [
      { id: "a", label: "16" },
      { id: "b", label: "36" },
      { id: "c", label: "48" },
      { id: "d", label: "49" }
    ],
    correctOptionId: "c"
  },
  {
    id: 108,
    domain: "abstract",
    stem: "Which pair completes the analogy? STUDENT : SCHOOL = WORKER : __",
    options: [
      { id: "a", label: "House" },
      { id: "b", label: "Office" },
      { id: "c", label: "Mall" },
      { id: "d", label: "Park" }
    ],
    correctOptionId: "b"
  },
  {
    id: 109,
    domain: "abstract",
    stem: "Which pair completes the analogy? HAND : GLOVE = FOOT : __",
    options: [
      { id: "a", label: "Sock" },
      { id: "b", label: "Shirt" },
      { id: "c", label: "Hat" },
      { id: "d", label: "Scarf" }
    ],
    correctOptionId: "a"
  },
  {
    id: 110,
    domain: "abstract",
    stem: "Which of the following has a different relationship? CAT : KITTEN, DOG : PUPPY, COW : CALF, BIRD : NEST",
    options: [
      { id: "a", label: "CAT : KITTEN" },
      { id: "b", label: "DOG : PUPPY" },
      { id: "c", label: "COW : CALF" },
      { id: "d", label: "BIRD : NEST" }
    ],
    correctOptionId: "d"
  },
  {
    id: 111,
    domain: "abstract",
    stem: "Which number completes the pattern? 100, 90, 81, 73, __",
    options: [
      { id: "a", label: "65" },
      { id: "b", label: "66" },
      { id: "c", label: "67" },
      { id: "d", label: "68" }
    ],
    correctOptionId: "c"
  },
  {
    id: 112,
    domain: "abstract",
    stem: "Which of the following is the odd one out? 24, 28, 30, 32, 36",
    options: [
      { id: "a", label: "24" },
      { id: "b", label: "28" },
      { id: "c", label: "30" },
      { id: "d", label: "36" }
    ],
    correctOptionId: "c"
  },
  {
    id: 113,
    domain: "abstract",
    stem: "Which pair completes the analogy? BAKER : BREAD = CARPENTER : __",
    options: [
      { id: "a", label: "Meat" },
      { id: "b", label: "Clothes" },
      { id: "c", label: "Furniture" },
      { id: "d", label: "Books" }
    ],
    correctOptionId: "c"
  },
  {
    id: 114,
    domain: "abstract",
    stem: "Which figure is the odd one out if the others are polygons?",
    options: [
      { id: "a", label: "Triangle" },
      { id: "b", label: "Circle" },
      { id: "c", label: "Square" },
      { id: "d", label: "Pentagon" }
    ],
    correctOptionId: "b"
  },
  {
    id: 115,
    domain: "abstract",
    stem: "Which number completes the pattern? 6, 11, 16, 21, __",
    options: [
      { id: "a", label: "25" },
      { id: "b", label: "26" },
      { id: "c", label: "27" },
      { id: "d", label: "28" }
    ],
    correctOptionId: "b"
  },
  {
    id: 116,
    domain: "abstract",
    stem: "Which pair completes the analogy? TEACHER : CLASSROOM = PILOT : __",
    options: [
      { id: "a", label: "Hospital" },
      { id: "b", label: "Kitchen" },
      { id: "c", label: "Airplane" },
      { id: "d", label: "Farm" }
    ],
    correctOptionId: "c"
  },
  {
    id: 117,
    domain: "abstract",
    stem: "Which of the following words is NOT related to the others? Red, Blue, Green, Circle",
    options: [
      { id: "a", label: "Red" },
      { id: "b", label: "Blue" },
      { id: "c", label: "Green" },
      { id: "d", label: "Circle" }
    ],
    correctOptionId: "d"
  },
  {
    id: 118,
    domain: "abstract",
    stem: "Which number completes the pattern? 2, 3, 5, 8, 12, __",
    options: [
      { id: "a", label: "15" },
      { id: "b", label: "17" },
      { id: "c", label: "18" },
      { id: "d", label: "20" }
    ],
    correctOptionId: "b"
  },
  {
    id: 119,
    domain: "abstract",
    stem: "Which pair completes the analogy? EYE : SEE = EAR : __",
    options: [
      { id: "a", label: "Talk" },
      { id: "b", label: "Hear" },
      { id: "c", label: "Smell" },
      { id: "d", label: "Taste" }
    ],
    correctOptionId: "b"
  },
  {
    id: 120,
    domain: "abstract",
    stem: "Which number does NOT belong in the group? 5, 10, 15, 22, 25",
    options: [
      { id: "a", label: "10" },
      { id: "b", label: "15" },
      { id: "c", label: "22" },
      { id: "d", label: "25" }
    ],
    correctOptionId: "c"
  },

  // ===================== CLERICAL (121–150) =====================
  {
    id: 121,
    domain: "clerical",
    stem: "Which of the following is correctly alphabetized?",
    options: [
      { id: "a", label: "Apple, Ant, Airplane" },
      { id: "b", label: "Ant, Airplane, Apple" },
      { id: "c", label: "Airplane, Apple, Ant" },
      { id: "d", label: "Apple, Airplane, Ant" }
    ],
    correctOptionId: "b"
  },
  {
    id: 122,
    domain: "clerical",
    stem: "Which date comes EARLIEST in the year?",
    options: [
      { id: "a", label: "March 15" },
      { id: "b", label: "February 10" },
      { id: "c", label: "April 1" },
      { id: "d", label: "January 20" }
    ],
    correctOptionId: "d"
  },
  {
    id: 123,
    domain: "clerical",
    stem: "Arrange the words alphabetically: Mango, Apple, Grape, Banana",
    options: [
      { id: "a", label: "Apple, Banana, Grape, Mango" },
      { id: "b", label: "Apple, Grape, Banana, Mango" },
      { id: "c", label: "Banana, Apple, Grape, Mango" },
      { id: "d", label: "Grape, Banana, Apple, Mango" }
    ],
    correctOptionId: "a"
  },
  {
    id: 124,
    domain: "clerical",
    stem: "Which time is LATEST in the day?",
    options: [
      { id: "a", label: "8:45 AM" },
      { id: "b", label: "11:30 AM" },
      { id: "c", label: "2:15 PM" },
      { id: "d", label: "10:05 PM" }
    ],
    correctOptionId: "d"
  },
  {
    id: 125,
    domain: "clerical",
    stem: "Which of the following is a correct filing order for numbers?",
    options: [
      { id: "a", label: "101, 11, 99, 120" },
      { id: "b", label: "11, 99, 101, 120" },
      { id: "c", label: "99, 11, 101, 120" },
      { id: "d", label: "120, 101, 99, 11" }
    ],
    correctOptionId: "b"
  },
  {
    id: 126,
    domain: "clerical",
    stem: "Which is the correct way to write the date April 5, 2025 in numeric form? (Month/Day/Year)",
    options: [
      { id: "a", label: "05/04/25" },
      { id: "b", label: "04/05/25" },
      { id: "c", label: "25/04/05" },
      { id: "d", label: "25/05/04" }
    ],
    correctOptionId: "b"
  },
  {
    id: 127,
    domain: "clerical",
    stem: "Which is correctly alphabetized by last name?",
    options: [
      { id: "a", label: "Ana Cruz, Ben Abad, Carla Dela Cruz" },
      { id: "b", label: "Ben Abad, Ana Cruz, Carla Dela Cruz" },
      { id: "c", label: "Carla Dela Cruz, Ben Abad, Ana Cruz" },
      { id: "d", label: "Ana Cruz, Carla Dela Cruz, Ben Abad" }
    ],
    correctOptionId: "b"
  },
  {
    id: 128,
    domain: "clerical",
    stem: "Which of the following is in CORRECT ascending order?",
    options: [
      { id: "a", label: "0.75, 0.5, 1.0" },
      { id: "b", label: "0.5, 0.75, 1.0" },
      { id: "c", label: "1.0, 0.75, 0.5" },
      { id: "d", label: "0.75, 1.0, 0.5" }
    ],
    correctOptionId: "b"
  },
  {
    id: 129,
    domain: "clerical",
    stem: "Which list of times is in chronological order?",
    options: [
      { id: "a", label: "7:30 AM, 9:00 AM, 8:45 AM" },
      { id: "b", label: "9:00 AM, 8:45 AM, 7:30 AM" },
      { id: "c", label: "7:30 AM, 8:45 AM, 9:00 AM" },
      { id: "d", label: "8:45 AM, 7:30 AM, 9:00 AM" }
    ],
    correctOptionId: "c"
  },
  {
    id: 130,
    domain: "clerical",
    stem: "Choose the correctly spelled word.",
    options: [
      { id: "a", label: "Reciept" },
      { id: "b", label: "Receipt" },
      { id: "c", label: "Receit" },
      { id: "d", label: "Recipt" }
    ],
    correctOptionId: "b"
  },
  {
    id: 131,
    domain: "clerical",
    stem: "Which is the correct order of days?",
    options: [
      { id: "a", label: "Monday, Wednesday, Tuesday" },
      { id: "b", label: "Wednesday, Monday, Tuesday" },
      { id: "c", label: "Tuesday, Monday, Wednesday" },
      { id: "d", label: "Monday, Tuesday, Wednesday" }
    ],
    correctOptionId: "d"
  },
  {
    id: 132,
    domain: "clerical",
    stem: "Which time is EARLIEST?",
    options: [
      { id: "a", label: "3:15 PM" },
      { id: "b", label: "11:45 AM" },
      { id: "c", label: "1:00 PM" },
      { id: "d", label: "6:30 PM" }
    ],
    correctOptionId: "b"
  },
  {
    id: 133,
    domain: "clerical",
    stem: "Which set of names is correctly alphabetized?",
    options: [
      { id: "a", label: "Carlos, Anna, Brian" },
      { id: "b", label: "Anna, Brian, Carlos" },
      { id: "c", label: "Brian, Anna, Carlos" },
      { id: "d", label: "Carlos, Brian, Anna" }
    ],
    correctOptionId: "b"
  },
  {
    id: 134,
    domain: "clerical",
    stem: "Which number list is arranged from GREATEST to LEAST?",
    options: [
      { id: "a", label: "120, 98, 75, 60" },
      { id: "b", label: "120, 75, 98, 60" },
      { id: "c", label: "60, 75, 98, 120" },
      { id: "d", label: "98, 120, 75, 60" }
    ],
    correctOptionId: "a"
  },
  {
    id: 135,
    domain: "clerical",
    stem: "Which file label should come FIRST in an alphabetical filing system?",
    options: [
      { id: "a", label: "Garcia, Ana" },
      { id: "b", label: "Garcia, Carlo" },
      { id: "c", label: "Garcia, Allan" },
      { id: "d", label: "Garcia, Arman" }
    ],
    correctOptionId: "c"
  },
  {
    id: 136,
    domain: "clerical",
    stem: "If you arrange these months alphabetically, which comes last? March, May, January, June",
    options: [
      { id: "a", label: "March" },
      { id: "b", label: "May" },
      { id: "c", label: "January" },
      { id: "d", label: "June" }
    ],
    correctOptionId: "b"
  },
  {
    id: 137,
    domain: "clerical",
    stem: "Which format CORRECTLY shows a time of ten thirty in the evening?",
    options: [
      { id: "a", label: "10:30 AM" },
      { id: "b", label: "10:30 PM" },
      { id: "c", label: "22:30 AM" },
      { id: "d", label: "22:30 PM" }
    ],
    correctOptionId: "b"
  },
  {
    id: 138,
    domain: "clerical",
    stem: "Which of the following words is spelled correctly?",
    options: [
      { id: "a", label: "Occassion" },
      { id: "b", label: "Occasion" },
      { id: "c", label: "Occation" },
      { id: "d", label: "Ocation" }
    ],
    correctOptionId: "b"
  },
  {
    id: 139,
    domain: "clerical",
    stem: "Arrange the numbers in descending order: 0.6, 0.45, 0.9, 0.75",
    options: [
      { id: "a", label: "0.9, 0.75, 0.6, 0.45" },
      { id: "b", label: "0.9, 0.6, 0.75, 0.45" },
      { id: "c", label: "0.75, 0.9, 0.6, 0.45" },
      { id: "d", label: "0.6, 0.75, 0.9, 0.45" }
    ],
    correctOptionId: "a"
  },
  {
    id: 140,
    domain: "clerical",
    stem: "Which of the following dates is in the middle when arranged chronologically?",
    options: [
      { id: "a", label: "June 1, 2024" },
      { id: "b", label: "May 20, 2024" },
      { id: "c", label: "July 5, 2024" },
      { id: "d", label: "April 30, 2024" }
    ],
    correctOptionId: "a"
  },
  {
    id: 141,
    domain: "clerical",
    stem: "Which abbreviation is used for 'department' in office documents?",
    options: [
      { id: "a", label: "dept." },
      { id: "b", label: "dpmt." },
      { id: "c", label: "deptm." },
      { id: "d", label: "dpmnt." }
    ],
    correctOptionId: "a"
  },
  {
    id: 142,
    domain: "clerical",
    stem: "In a list of names, which should appear LAST alphabetically?",
    options: [
      { id: "a", label: "Dela Cruz, Ana" },
      { id: "b", label: "Dela Cruz, Arvin" },
      { id: "c", label: "Dela Cruz, Carlo" },
      { id: "d", label: "Dela Cruz, Angelo" }
    ],
    correctOptionId: "c"
  },
  {
    id: 143,
    domain: "clerical",
    stem: "Which of the following is the correct ascending order of these times? 3:45 PM, 11:15 AM, 1:00 PM",
    options: [
      { id: "a", label: "11:15 AM, 1:00 PM, 3:45 PM" },
      { id: "b", label: "1:00 PM, 11:15 AM, 3:45 PM" },
      { id: "c", label: "3:45 PM, 1:00 PM, 11:15 AM" },
      { id: "d", label: "1:00 PM, 3:45 PM, 11:15 AM" }
    ],
    correctOptionId: "a"
  },
  {
    id: 144,
    domain: "clerical",
    stem: "Which number is in the correct position if the sequence is arranged from SMALLEST to LARGEST? 150, 120, 90, 60",
    options: [
      { id: "a", label: "150" },
      { id: "b", label: "120" },
      { id: "c", label: "90" },
      { id: "d", label: "60" }
    ],
    correctOptionId: "d"
  },
  {
    id: 145,
    domain: "clerical",
    stem: "Which of these IS NOT written in correct capital-letter form?",
    options: [
      { id: "a", label: "Quezon City" },
      { id: "b", label: "manila City" },
      { id: "c", label: "Cebu Province" },
      { id: "d", label: "Davao City" }
    ],
    correctOptionId: "b"
  },
  {
    id: 146,
    domain: "clerical",
    stem: "Which of these is the correct alphabetical order? Report, Reply, Repeat, Replace",
    options: [
      { id: "a", label: "Repeat, Replace, Reply, Report" },
      { id: "b", label: "Replace, Repeat, Reply, Report" },
      { id: "c", label: "Repeat, Reply, Replace, Report" },
      { id: "d", label: "Reply, Repeat, Replace, Report" }
    ],
    correctOptionId: "d"
  },
  {
    id: 147,
    domain: "clerical",
    stem: "Which is the correct way to write eight thirty in the morning using 24-hour time?",
    options: [
      { id: "a", label: "8:30" },
      { id: "b", label: "08:30" },
      { id: "c", label: "20:30" },
      { id: "d", label: "18:30" }
    ],
    correctOptionId: "b"
  },
  {
    id: 148,
    domain: "clerical",
    stem: "Which of the following is the correct form of the word meaning a list of items or topics?",
    options: [
      { id: "a", label: "Shedule" },
      { id: "b", label: "Schedulle" },
      { id: "c", label: "Schedule" },
      { id: "d", label: "Schedul" }
    ],
    correctOptionId: "c"
  },
  {
    id: 149,
    domain: "clerical",
    stem: "When sorting by last name, which of the following should come FIRST?",
    options: [
      { id: "a", label: "De Leon, Maria" },
      { id: "b", label: "Dela Cruz, Mario" },
      { id: "c", label: "Delos Santos, Mark" },
      { id: "d", label: "De la Paz, Mico" }
    ],
    correctOptionId: "d"
  },
  {
    id: 150,
    domain: "clerical",
    stem: "Which of the following is the correct chronological order of these school events? Recognition Day, Enrollment, Graduation",
    options: [
      { id: "a", label: "Enrollment, Recognition Day, Graduation" },
      { id: "b", label: "Recognition Day, Enrollment, Graduation" },
      { id: "c", label: "Graduation, Recognition Day, Enrollment" },
      { id: "d", label: "Enrollment, Graduation, Recognition Day" }
    ],
    correctOptionId: "a"
  },

  // ===================== ENTREPRENEURIAL (151–180) =====================
  {
    id: 151,
    domain: "entrepreneurial",
    stem: "A student wants to earn money after class. Which plan shows entrepreneurial thinking?",
    options: [
      { id: "a", label: "Playing online games every night" },
      { id: "b", label: "Selling homemade snacks to classmates" },
      { id: "c", label: "Skipping homework to rest" },
      { id: "d", label: "Watching TV series" }
    ],
    correctOptionId: "b"
  },
  {
    id: 152,
    domain: "entrepreneurial",
    stem: "Which is the BEST way to know if a small business idea is profitable?",
    options: [
      { id: "a", label: "Copy any popular business" },
      { id: "b", label: "Ask only close friends" },
      { id: "c", label: "Check costs and possible income" },
      { id: "d", label: "Start without planning" }
    ],
    correctOptionId: "c"
  },
  {
    id: 153,
    domain: "entrepreneurial",
    stem: "A student wants to sell school supplies. What should be done FIRST?",
    options: [
      { id: "a", label: "Buy many items immediately" },
      { id: "b", label: "Check what classmates need most" },
      { id: "c", label: "Rent a big store" },
      { id: "d", label: "Hire many workers" }
    ],
    correctOptionId: "b"
  },
  {
    id: 154,
    domain: "entrepreneurial",
    stem: "Which of the following shows GOOD customer service?",
    options: [
      { id: "a", label: "Ignoring customers" },
      { id: "b", label: "Being rude when tired" },
      { id: "c", label: "Listening carefully to customer needs" },
      { id: "d", label: "Closing early without notice" }
    ],
    correctOptionId: "c"
  },
  {
    id: 155,
    domain: "entrepreneurial",
    stem: "Profit is BEST described as:",
    options: [
      { id: "a", label: "The total money received from sales" },
      { id: "b", label: "The money left after expenses are paid" },
      { id: "c", label: "The amount borrowed from friends" },
      { id: "d", label: "The price of all products" }
    ],
    correctOptionId: "b"
  },
  {
    id: 156,
    domain: "entrepreneurial",
    stem: "Which situation shows RISK-TAKING in business?",
    options: [
      { id: "a", label: "Trying a new product after research" },
      { id: "b", label: "Never changing anything" },
      { id: "c", label: "Closing the business immediately" },
      { id: "d", label: "Ignoring customer feedback" }
    ],
    correctOptionId: "a"
  },
  {
    id: 157,
    domain: "entrepreneurial",
    stem: "What is a simple way to promote a small online business?",
    options: [
      { id: "a", label: "Avoid using social media" },
      { id: "b", label: "Share products on social media platforms" },
      { id: "c", label: "Hide the prices" },
      { id: "d", label: "Sell only to one person" }
    ],
    correctOptionId: "b"
  },
  {
    id: 158,
    domain: "entrepreneurial",
    stem: "Which statement about budgeting is TRUE?",
    options: [
      { id: "a", label: "Expenses should always be higher than income." },
      { id: "b", label: "Budgeting helps control spending." },
      { id: "c", label: "Budgeting is not important for small businesses." },
      { id: "d", label: "Income is not part of a budget." }
    ],
    correctOptionId: "b"
  },
  {
    id: 159,
    domain: "entrepreneurial",
    stem: "A sari-sari store owner notices that chips sell more than candies. What should she do?",
    options: [
      { id: "a", label: "Stop selling chips" },
      { id: "b", label: "Buy more chips to sell" },
      { id: "c", label: "Increase candy prices only" },
      { id: "d", label: "Close the store" }
    ],
    correctOptionId: "b"
  },
  {
    id: 160,
    domain: "entrepreneurial",
    stem: "Which quality is important for an entrepreneur?",
    options: [
      { id: "a", label: "Being easily discouraged" },
      { id: "b", label: "Being lazy" },
      { id: "c", label: "Being creative and persistent" },
      { id: "d", label: "Ignoring problems" }
    ],
    correctOptionId: "c"
  },
  {
    id: 161,
    domain: "entrepreneurial",
    stem: "A business plan is used to:",
    options: [
      { id: "a", label: "Avoid all risks" },
      { id: "b", label: "Guide how the business will be run" },
      { id: "c", label: "Decide school subjects" },
      { id: "d", label: "Stop competition forever" }
    ],
    correctOptionId: "b"
  },
  {
    id: 162,
    domain: "entrepreneurial",
    stem: "Which example shows ethical behavior in business?",
    options: [
      { id: "a", label: "Lying about product quality" },
      { id: "b", label: "Selling expired goods" },
      { id: "c", label: "Being honest about product limitations" },
      { id: "d", label: "Hiding important information" }
    ],
    correctOptionId: "c"
  },
  {
    id: 163,
    domain: "entrepreneurial",
    stem: "Why is keeping records of sales and expenses important?",
    options: [
      { id: "a", label: "To confuse customers" },
      { id: "b", label: "To know if the business earns or loses money" },
      { id: "c", label: "To hide income from others" },
      { id: "d", label: "To make prices random" }
    ],
    correctOptionId: "b"
  },
  {
    id: 164,
    domain: "entrepreneurial",
    stem: "A student wants to start an online art commission business. What should be her FIRST step?",
    options: [
      { id: "a", label: "Buy expensive equipment immediately" },
      {
        id: "b",
        label: "Check if there are people willing to pay for her art"
      },
      { id: "c", label: "Stop practicing drawing" },
      { id: "d", label: "Rent a physical store" }
    ],
    correctOptionId: "b"
  },
  {
    id: 165,
    domain: "entrepreneurial",
    stem: "Which pricing strategy is MOST appropriate for a new product?",
    options: [
      { id: "a", label: "Setting a price without checking competitors" },
      { id: "b", label: "Setting a price based on cost and competitor prices" },
      { id: "c", label: "Using random prices every day" },
      { id: "d", label: "Always choosing the highest price" }
    ],
    correctOptionId: "b"
  },
  {
    id: 166,
    domain: "entrepreneurial",
    stem: "Which of the following BEST describes a 'target market'?",
    options: [
      { id: "a", label: "All people in the city" },
      {
        id: "b",
        label: "The specific group of customers a business focuses on"
      },
      { id: "c", label: "Only the owner's family and friends" },
      { id: "d", label: "People who do not buy products" }
    ],
    correctOptionId: "b"
  },
  {
    id: 167,
    domain: "entrepreneurial",
    stem: "Which statement BEST describes 'capital' in a small business?",
    options: [
      { id: "a", label: "The manager's personal traits" },
      { id: "b", label: "The money or assets used to start the business" },
      { id: "c", label: "The number of customers" },
      { id: "d", label: "The amount of time you spend resting" }
    ],
    correctOptionId: "b"
  },
  {
    id: 168,
    domain: "entrepreneurial",
    stem: "A student entrepreneur sells personalized keychains. Which action shows good inventory management?",
    options: [
      { id: "a", label: "Ordering materials only after running out" },
      {
        id: "b",
        label: "Keeping a record of how many keychains are sold and remaining"
      },
      { id: "c", label: "Ignoring the number of unsold keychains" },
      { id: "d", label: "Buying materials without checking sales" }
    ],
    correctOptionId: "b"
  },
  {
    id: 169,
    domain: "entrepreneurial",
    stem: "Which of the following BEST describes 'customer loyalty'?",
    options: [
      { id: "a", label: "Customers who complain frequently" },
      { id: "b", label: "Customers who buy once and never return" },
      { id: "c", label: "Customers who repeatedly buy from the same business" },
      { id: "d", label: "Customers who only ask for discounts" }
    ],
    correctOptionId: "c"
  },
  {
    id: 170,
    domain: "entrepreneurial",
    stem: "Which of the following is the BEST way to handle customer complaints?",
    options: [
      { id: "a", label: "Ignore the complaint and move on" },
      { id: "b", label: "Listen carefully and try to solve the issue" },
      { id: "c", label: "Blame the customer for the problem" },
      { id: "d", label: "Tell the customer to go away" }
    ],
    correctOptionId: "b"
  },
  {
    id: 171,
    domain: "entrepreneurial",
    stem: "Which type of expense is electricity for a small store?",
    options: [
      { id: "a", label: "Capital" },
      { id: "b", label: "Fixed or operating expense" },
      { id: "c", label: "Profit" },
      { id: "d", label: "Liability" }
    ],
    correctOptionId: "b"
  },
  {
    id: 172,
    domain: "entrepreneurial",
    stem: "A small café owner wants to attract more customers. Which idea is MOST helpful?",
    options: [
      { id: "a", label: "Reduce seating space" },
      { id: "b", label: "Improve service and create student discounts" },
      { id: "c", label: "Increase prices without reason" },
      { id: "d", label: "Close earlier than usual" }
    ],
    correctOptionId: "b"
  },
  {
    id: 173,
    domain: "entrepreneurial",
    stem: "Which of the following is an example of an ONLINE marketing strategy?",
    options: [
      { id: "a", label: "Posting flyers on walls" },
      { id: "b", label: "Announcing in the school canteen" },
      { id: "c", label: "Creating a Facebook page for the business" },
      { id: "d", label: "Using a megaphone in the street" }
    ],
    correctOptionId: "c"
  },
  {
    id: 174,
    domain: "entrepreneurial",
    stem: "Which of the following is the MAIN goal of an entrepreneur?",
    options: [
      { id: "a", label: "To avoid all risks in life" },
      { id: "b", label: "To create and manage a business for profit" },
      { id: "c", label: "To work as an employee forever" },
      { id: "d", label: "To spend all earnings immediately" }
    ],
    correctOptionId: "b"
  },
  {
    id: 175,
    domain: "entrepreneurial",
    stem: "A school club wants to raise funds and decides to sell T-shirts. What is the BEST first step?",
    options: [
      { id: "a", label: "Order T-shirts without design" },
      { id: "b", label: "Survey students about designs and sizes they prefer" },
      { id: "c", label: "Print the most expensive design" },
      { id: "d", label: "Sell T-shirts without planning price" }
    ],
    correctOptionId: "b"
  },
  {
    id: 176,
    domain: "entrepreneurial",
    stem: "Which quality helps an entrepreneur recover from failures and try again?",
    options: [
      { id: "a", label: "Impatience" },
      { id: "b", label: "Resilience" },
      { id: "c", label: "Laziness" },
      { id: "d", label: "Dishonesty" }
    ],
    correctOptionId: "b"
  },
  {
    id: 177,
    domain: "entrepreneurial",
    stem: "Which statement about competition in business is TRUE?",
    options: [
      { id: "a", label: "Competition is always bad and must be avoided." },
      {
        id: "b",
        label:
          "Competition can encourage businesses to improve products and services."
      },
      { id: "c", label: "Competition means copying everything from others." },
      { id: "d", label: "Competition has no effect on customers." }
    ],
    correctOptionId: "b"
  },
  {
    id: 178,
    domain: "entrepreneurial",
    stem: "Why is record-keeping important for small businesses?",
    options: [
      { id: "a", label: "To hide mistakes from others" },
      { id: "b", label: "To clearly track income, expenses, and profits" },
      { id: "c", label: "To confuse customers and competitors" },
      { id: "d", label: "To avoid paying employees" }
    ],
    correctOptionId: "b"
  },
  {
    id: 179,
    domain: "entrepreneurial",
    stem: "Which of the following BEST shows social responsibility in business?",
    options: [
      { id: "a", label: "Throwing waste anywhere to save time" },
      { id: "b", label: "Using eco-friendly packaging materials" },
      { id: "c", label: "Overworking employees without pay" },
      { id: "d", label: "Selling fake branded items" }
    ],
    correctOptionId: "b"
  },
  {
    id: 180,
    domain: "entrepreneurial",
    stem: "A student entrepreneur earns ₱3,000 from a project and spends ₱2,200 on materials and fees. What is the PROFIT?",
    options: [
      { id: "a", label: "₱800" },
      { id: "b", label: "₱3,000" },
      { id: "c", label: "₱2,200" },
      { id: "d", label: "₱5,200" }
    ],
    correctOptionId: "a"
  }
];

// ---------- HELPERS FOR RANDOM SELECTION ----------

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate random questions:
 * - 15 questions PER domain
 * - taken from the 30-item bank per domain
 */
export function generateRandomAptitudeQuestions(): AptitudeQuestion[] {
  const grouped: Record<AptitudeDomain, AptitudeQuestion[]> = {
    verbal: [],
    numerical: [],
    scientific: [],
    abstract: [],
    clerical: [],
    entrepreneurial: []
  };

  for (const q of aptitudeQuestionBank) {
    grouped[q.domain].push(q);
  }

  const selected: AptitudeQuestion[] = [];

  (Object.keys(grouped) as AptitudeDomain[]).forEach((domain) => {
    const domainQuestions = grouped[domain];
    const sampleSize = Math.min(
      QUESTIONS_PER_DOMAIN_IN_ASSESSMENT,
      domainQuestions.length
    );

    const chosen = shuffle(domainQuestions).slice(0, sampleSize);
    selected.push(...chosen);
  });

  // Optional: shuffle final exam order so domains are mixed
  return shuffle(selected);
}

/**
 * This is what the rest of the app currently imports.
 * Every fresh load of the app will get a new random 15-per-domain set.
 */
export const aptitudeQuestions: AptitudeQuestion[] =
  generateRandomAptitudeQuestions();
