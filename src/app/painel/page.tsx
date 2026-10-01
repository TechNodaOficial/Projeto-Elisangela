import { exigirUsuario } from "@/lib/dal";

export default async function PaginaPainel() {
  const usuario = await exigirUsuario();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Olá, {usuario.nome}!</h1>
      <p className="text-muted-foreground">Suas festas vão aparecer aqui.</p>
    </div>
  );
}
