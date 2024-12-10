// pages/index.tsx
import React, { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("Loading");

  useEffect(() => {
    fetch("http://127.0.0.1:5000")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("Failed to load message");
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h3>Next JS Python Flask</h3>
      <div>{message}</div>
    </main>
  );
}
