export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div>
        <h2 className="font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
          {title}
        </h2>
        <hr className="my-2 border-[var(--border-secondary)]" />
        {children}
      </div>
    );
  }
  