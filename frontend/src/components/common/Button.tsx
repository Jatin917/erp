export default function Button({
    children, onClick, variant = "solid" as "solid" | "outline", size = "md" as "sm"|"md"|"lg", className = "", ...rest
  }: any) {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring disabled:opacity-60";
    const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-5" };
    const variants = {
      solid: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
    };
    return (
      <button onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
        {children}
      </button>
    );
  }
  