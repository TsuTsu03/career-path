import Counter from "../models/Counter.js";
import User from "../models/User.js";

type GenerateStudentIdParams = {
  schoolCode?: string | undefined;
  batch?: string | undefined;
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

  // The counter can fall behind if IDs were ever assigned by hand, so skip
  // any number that is already taken.
  for (let attempt = 0; attempt < 50; attempt++) {
    const counter = await Counter.findOneAndUpdate(
      { key },
      { $inc: { value: 1 } },
      {
        new: true,
        upsert: true
      }
    );

    const sequence = String(counter.value).padStart(4, "0");
    const studentId = `STU${year2}-${sequence}`;

    if (!(await User.exists({ studentId }))) {
      return studentId;
    }
  }

  throw new Error("Could not generate a free student ID");
};
