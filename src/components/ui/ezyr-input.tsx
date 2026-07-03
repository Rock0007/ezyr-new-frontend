"use client";

import { Input } from "antd";
import type { InputProps } from "antd";
import { useState } from "react";
import { cn } from "@/utils/cn";

export function EzyrInput({ className, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Input
      {...props}
      variant={isFocused ? "outlined" : (props.variant ?? "filled")}
      onBlur={(event) => {
        setIsFocused(false);
        props.onBlur?.(event);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        props.onFocus?.(event);
      }}
      className={cn(
        "ezyr-input h-8 rounded-md text-sm shadow-none",
        className,
      )}
    />
  );
}
