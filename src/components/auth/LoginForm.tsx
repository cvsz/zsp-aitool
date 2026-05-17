"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? "Login failed");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <h1 className="text-2xl font-semibold">Login</h1>
      <input className="w-full border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input className="w-full border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {error ? <p className="text-red-600">{error}</p> : null}
      <button className="bg-black text-white px-4 py-2" type="submit">Login</button>
    </form>
  );
}
