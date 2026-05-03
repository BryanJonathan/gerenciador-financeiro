import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <div className="space-y-6 rounded-lg border border-border bg-card p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm text-muted-foreground">
            Acesse o gerenciador financeiro com sua conta.
          </p>
        </div>
        <LoginForm />
        <p className="text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/signup" className="font-medium underline">
            Cadastre-se com um convite
          </Link>
        </p>
      </div>
    </div>
  );
}
