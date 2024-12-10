"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Signup successful! Welcome, ${data.user.username}`);
        setTimeout(() => {
          router.push("/dashboard"); // Redirect to the dashboard page after successful signup
        }, 2000);
      } else {
        // Check if the response contains an error message
        const errorData = await response.json();
        setError(errorData.error || "Signup failed. Please try again.");
      }
    } catch (err: unknown) {
      // Handle error type properly
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "1em" }}>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: "1em" }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "0.5em", margin: "0.5em 0" }}
            required
          />
        </div>
        <div style={{ marginBottom: "1em" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5em", margin: "0.5em 0" }}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <button type="submit" style={{ padding: "0.5em 1em" }}>
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
