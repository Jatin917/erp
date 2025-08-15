export default function Section({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-semibold tracking-tight text-primary">{title}</h3>
        {action}
      </div>
    );
  }
  