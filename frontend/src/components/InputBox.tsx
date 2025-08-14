import clsx from "clsx";
import { forwardRef } from "react";

type InputBoxProps = {
  placeholder: string;
  size: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

};

export const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  ({ placeholder, size, value, onChange }, ref) => {
    return (
      <input
        className={clsx(
          "px-5 py-1 border-2 border-stone-800 rounded text-md",
          size
        )}
        value={value}
        ref={ref}
        placeholder={placeholder}
        onChange={onChange}
        type="text"
      />
    );
  }
);