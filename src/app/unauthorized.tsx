import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Acesso não autorizado
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Faça login para continuar.
      </p>
      <Link href="/login" className={cn(buttonVariants(), "mt-6")}>
        Ir para o login
      </Link>
    </div>
  );
}
