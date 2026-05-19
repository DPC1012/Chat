import clsx from "clsx";
import { forwardRef } from "react";

type InputBoxProps = {
  placeholder: string;
  size: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  maxLength?: number;
};

export const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  (
    { placeholder, size, value, onChange, onKeyDown, disabled, maxLength },
    ref
  ) => {
    return (
      <input
        className={clsx(
          "px-4 py-2 border-2 border-stone-800 rounded bg-black text-md text-white outline-none placeholder:text-slate-500 focus:border-stone-500 disabled:cursor-not-allowed disabled:opacity-60",
          size
        )}
        value={value}
        ref={ref}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        maxLength={maxLength}
        type="text"
      />
    );
  }
);
