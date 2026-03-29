import Counter from "../models/Counter.js";

type GenerateStudentIdParams = {
  schoolCode?: string;
  batch?: string;
};

export const generateStudentId = async ({
  schoolCode,
  batch
}: GenerateStudentIdParams = {}) => {
  const now = new Date();
  const year2 = now.getFullYear().toString().slice(-2);

  const parts = ["studentId", year2];

  if (schoolCode) {
    parts.push(String(schoolCode).trim().toUpperCase());
  }

  if (batch) {
    parts.push(String(batch).trim().toUpperCase());
  }

  const key = parts.join(":");

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { value: 1 } },
    {
      new: true,
      upsert: true
    }
  );

  const sequence = String(counter.value).padStart(4, "0");

  return `STU${year2}-${sequence}`;
};
