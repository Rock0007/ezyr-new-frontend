"use client";

import { Button, Typography } from "antd";
import { Maximize2, Minus, Plus } from "lucide-react";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { setZoom } from "@/store/slices/builder-slice";
import { cn } from "@/utils/cn";

const viewportWidthClass = {
  desktop: "w-[960px]",
  tablet: "w-[720px]",
  mobile: "w-[390px]",
};

export function BuilderCanvas() {
  const dispatch = useAppDispatch();
  const { viewport, zoom } = useAppSelector((state) => state.builder);

  return (
    <section className="relative flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#d8dee9] bg-[#f8fafc] px-4">
        <Typography.Text className="text-xs font-medium text-[#667085]">
          Canvas / Home page
        </Typography.Text>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Zoom out"
            icon={<Minus size={14} />}
            size="small"
            onClick={() => dispatch(setZoom(Math.max(25, zoom - 10)))}
          />
          <span className="w-12 text-center text-xs font-medium text-[#475467]">
            {zoom}%
          </span>
          <Button
            aria-label="Zoom in"
            icon={<Plus size={14} />}
            size="small"
            onClick={() => dispatch(setZoom(Math.min(200, zoom + 10)))}
          />
          <Button
            aria-label="Fit canvas"
            icon={<Maximize2 size={14} />}
            size="small"
          />
        </div>
      </div>

      <div className="ezyr-canvas-grid min-h-0 flex-1 overflow-auto p-10">
        <div
          className={cn(
            "mx-auto min-h-[640px] rounded-md border border-[#cfd7e4] bg-white shadow-sm transition-all",
            viewportWidthClass[viewport],
          )}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <div className="border-b border-[#e4e7ec] px-8 py-6">
            <Typography.Text className="text-xs font-semibold uppercase text-[#0f8ca8]">
              App screen
            </Typography.Text>
            <Typography.Title className="mt-2! mb-0! text-2xl! text-[#172033]!">
              Build something new
            </Typography.Title>
          </div>
          <div className="grid gap-4 p-8 md:grid-cols-3">
            {["Hero", "Form", "Data view"].map((label) => (
              <div
                className="h-36 rounded border border-dashed border-[#a9b6c8] bg-[#f8fafc] p-4"
                key={label}
              >
                <Typography.Text className="text-sm font-medium text-[#475467]">
                  {label}
                </Typography.Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
