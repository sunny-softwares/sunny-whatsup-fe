/**
 * Reusable presentational primitives for long-form legal pages
 * (privacy policy, terms & conditions, etc.).
 *
 * These are server-component-safe — they don't use any client hooks.
 */

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-0 text-xl font-bold tracking-tight text-foreground">{children}</h2>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-5 text-base font-semibold text-foreground">{children}</h3>
  );
}

export function InfoBox({
  children,
  variant = 'info',
}: {
  children: React.ReactNode;
  variant?: 'info' | 'note';
}) {
  const styles =
    variant === 'note'
      ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100'
      : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100';
  return (
    <div className={`not-prose my-4 rounded-md border p-4 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

export function DefinitionTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="not-prose my-4 overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">Term</th>
            <th className="px-4 py-2.5 text-left font-semibold text-foreground">Meaning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([term, meaning]) => (
            <tr key={term} className="odd:bg-background even:bg-muted/20">
              <td className="whitespace-nowrap px-4 py-2.5 font-medium text-foreground">{term}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="not-prose my-4 overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-background even:bg-muted/20">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 ${j === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
