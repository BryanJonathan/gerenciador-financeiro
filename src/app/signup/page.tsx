import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "./form";

export const dynamic = "force-dynamic";

type Search = Promise<{ code?: string }>;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const session = await auth();
  if (session?.user) redirect("/");
  const { code } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <div className="space-y-6 rounded-lg border border-border bg-card p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            Você precisa de um código de convite para se cadastrar.
          </p>
        </div>
        <SignupForm defaultInviteCode={code ?? ""} />
        <p className="text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
