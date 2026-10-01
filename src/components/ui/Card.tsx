import { type HTMLAttributes, type ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  hover = false,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-[#E8DFD4]
        ${paddingClasses[padding]}
        ${hover ? "transition-all duration-300 hover:shadow-xl hover:shadow-[#5C1B13]/5 hover:-translate-y-1" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
