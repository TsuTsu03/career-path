// server/src/index.ts
import app from "./app.js";

const PORT = process.env.PORT || 9007;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
