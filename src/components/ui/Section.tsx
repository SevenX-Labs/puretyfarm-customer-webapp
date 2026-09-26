import { type HTMLAttributes, type ReactNode } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  background?: "default" | "cream" | "maroon";
}

const bgClasses = {
  default: "bg-[#FFFDF7]",
  cream: "bg-[#FBF6EE]",
  maroon: "bg-[#5C1B13]",
};

export function Section({
  children,
  background = "default",
  className = "",
  id,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={`
        w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8
        ${bgClasses[background]}
        ${className}
      `.trim()}
      {...props}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
