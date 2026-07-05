"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="type-label">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@moshmadness.id"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="type-label">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      {state?.error && (
        <p role="alert" className="type-label text-error">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="type-label mt-2">
        {pending ? "Memeriksa..." : "Masuk"}
      </Button>
    </form>
  );
}
