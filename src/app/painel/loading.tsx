// Folhas vazias enquanto a lista carrega.
export default function Carregando() {
  return (
    <div aria-busy="true" aria-label="Carregando festas">
      <div className="mb-6 flex flex-col gap-2 md:mb-8">
        <div className="bg-border h-7 w-48 animate-pulse rounded-sm" />
        <div className="bg-border h-4 w-72 animate-pulse rounded-sm" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(17.5rem,1fr))] sm:gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="folha h-[calc(var(--linha)*8)] animate-pulse opacity-70" />
        ))}
      </div>
    </div>
  );
}
