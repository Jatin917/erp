export default function Tag({ children, tone = "slate" as "slate" | "green" | "orange" | "red" | "blue" }) {
    const toneMap: Record<string, string> = {
      slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200",
      orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200",
      red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200",
      blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
    };
    return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${toneMap[tone]}`}>{children}</span>;
  }
  