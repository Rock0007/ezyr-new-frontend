"use client";

import { Button, Tooltip } from "antd";
import type { ButtonProps } from "antd";

type IconButtonProps = ButtonProps & {
  label: string;
};

export function IconButton({ label, ...props }: IconButtonProps) {
  return (
    <Tooltip title={label}>
      <Button aria-label={label} {...props} />
    </Tooltip>
  );
}
