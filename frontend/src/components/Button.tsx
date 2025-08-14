import clsx from "clsx";

interface ButtonProps {
  title: string;
  variants: "sm" | "md" | "lg";
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  loading: boolean;
}
const VariantStyles = {
  sm: "bg-white text-black rounded hover:bg-gray-200 px-8 py-2 m-3",
  md: "bg-white text-black rounded hover:bg-gray-200 px-4 py-1 m-3",
  lg: "bg-white text-black rounded hover:bg-gray-200 w-lg p-2 m-3",
};
export const Button = ({ title, variants, onClick, loading }: ButtonProps) => {
  return (
    <button
      onClick={loading ? undefined : onClick}
      className={clsx(
        VariantStyles[variants],
        loading && "opacity-50 cursor-not-allowed disabled"
        )}>
      {title}
    </button>
  );
};
