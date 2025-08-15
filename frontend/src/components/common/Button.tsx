interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
    children, onClick, variant = "solid", size = "md", className = "", ...rest
  }: ButtonProps) {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring disabled:opacity-60";
    const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-5" };
    const variants = {
      solid: "bg-accent text-white hover:bg-accent",
      outline: "border border-primary text-secondary hover:bg-card hover:text-primary",
    };
    return (
      <button onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
        {children}
      </button>
    );
  }
  