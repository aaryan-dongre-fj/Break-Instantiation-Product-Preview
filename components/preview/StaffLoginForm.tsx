"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withCompany } from "@/utils/company";

export default function StaffLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const isValid = form.email.trim().length > 0 && form.password.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(withCompany("/api/preview/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Couldn't sign in. Try again.");
        return;
      }

      router.replace(withCompany("/products"));
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email" className="font-sans font-medium text-primary-text">
            Staff email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
            className="h-12 rounded-md border-neutral bg-transparent text-primary-text placeholder:text-neutral focus-visible:border-secondary-background focus-visible:ring-1 focus-visible:ring-secondary-background"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className="font-sans font-medium text-primary-text">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              className="h-12 rounded-md border-neutral bg-transparent pr-10 text-primary-text placeholder:text-neutral focus-visible:border-secondary-background focus-visible:ring-1 focus-visible:ring-secondary-background"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral transition-colors hover:text-primary-text"
            >
              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="h-12 w-full cursor-pointer rounded-[50px] bg-primary-text text-base font-medium text-primary-background hover:bg-primary-text/90 hover:text-primary-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
