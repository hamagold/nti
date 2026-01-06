import * as React from "react";
import { cn } from "@/lib/utils";
import { convertToEnglishNumbers } from "@/lib/numberUtils";

export interface LocalizedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  convertNumbers?: boolean;
}

const LocalizedInput = React.forwardRef<HTMLInputElement, LocalizedInputProps>(
  ({ className, type, convertNumbers = true, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (convertNumbers && (type === "tel" || type === "number" || props.inputMode === "numeric")) {
        const converted = convertToEnglishNumbers(e.target.value);
        e.target.value = converted;
      }
      onChange?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
LocalizedInput.displayName = "LocalizedInput";

export { LocalizedInput };
