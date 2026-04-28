"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-frigia-cream">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-frigia-dark">
              Frigia
            </h1>
            <p className="text-sm text-neutral-500 mt-1">Panel de administración</p>
          </div>

          <form action={action} className="flex flex-col gap-4">
            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoFocus
              autoComplete="current-password"
              error={state?.error}
            />
            <Button type="submit" loading={pending} className="w-full mt-2">
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
