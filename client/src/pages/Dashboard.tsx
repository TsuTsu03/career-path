export default function Dashboard() {
  const fullName = localStorage.getItem("fullName") || "Student";
  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome to CARPATH 🎓</h1>
      <p>Logged in as {fullName}</p>

      <div style={{ marginTop: 16, border: "1px solid #ccc", padding: 16 }}>
        <h3>Next:</h3>
        <ul>
          <li>Connect MongoDB for real login</li>
          <li>Add Assessment & Recommendation pages</li>
        </ul>
      </div>
    </div>
  );
}
