"use client";

import { useId, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormSelectOption = { value: string; label: string };

type FormSelectProps = {
  /** Submitted form field name. Mirrors the chosen value via a hidden input. */
  name: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /** Controlled value — pair with `onChange`. */
  value?: string;
  /** Called whenever the user picks an option. */
  onChange?: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  /** Renders a "browser-required" hidden input so empty selects block submit. */
  required?: boolean;
  /** Optional id forwarded to the trigger so a `<Label htmlFor>` works. */
  id?: string;
  /** Append to the trigger className (sizing, etc.). */
  className?: string;
  disabled?: boolean;
};

/**
 * Themed select that wraps the shadcn/base-ui Select primitive AND mirrors
 * its value to a hidden `<input>` so it submits cleanly inside any
 * `<form action={…}>`. Replaces the bare native `<select>` we used to ship.
 */
export function FormSelect({
  name,
  defaultValue,
  value: controlledValue,
  onChange,
  options,
  placeholder,
  required,
  id,
  className,
  disabled,
}: FormSelectProps) {
  const isControlled = controlledValue !== undefined;
  const [innerValue, setInnerValue] = useState<string>(defaultValue ?? "");
  const value = isControlled ? controlledValue! : innerValue;
  const fallbackId = useId();
  const triggerId = id ?? fallbackId;

  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <Select
        value={value}
        onValueChange={(next) => {
          const v = next ?? "";
          if (!isControlled) setInnerValue(v);
          onChange?.(v);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={triggerId}
          className={[
            "border-input bg-background hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 h-10 w-full rounded-lg border px-3 text-sm transition-colors outline-none",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
