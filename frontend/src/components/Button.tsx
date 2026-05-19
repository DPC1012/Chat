import clsx from "clsx";

interface ButtonProps {
  title: string;
  variants: "sm" | "md" | "lg";
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
}
const VariantStyles = {
  sm: "bg-white text-black rounded px-6 py-2",
  md: "bg-white text-black rounded px-5 py-2",
  lg: "bg-white text-black rounded w-full p-3",
};
export const Button = ({ title, variants, onClick, loading = false }: ButtonProps) => {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={clsx(
        "transition-all active:scale-[0.98] hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 font-medium",
        VariantStyles[variants],
      )}
    >
      {title}
    </button>
  );
};
