"use client";

import {
  Button,
  Divider,
  Layout,
  Segmented,
  Tooltip,
  Typography,
} from "antd";
import {
  Bot,
  Cloud,
  Eye,
  Laptop,
  Lock,
  PanelLeft,
  Play,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import ezyrLogo from "@/app/ezyr_logo.png";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import {
  setMode,
  setViewport,
  toggleCanvasLock,
  toggleLeftPanel,
} from "@/store/slices/builder-slice";
import type { BuilderMode, BuilderViewport } from "@/types/builder";

const viewportOptions: Array<{
  value: BuilderViewport;
  icon: ReactNode;
  title: string;
}> = [
  { value: "desktop", icon: <Laptop size={15} />, title: "Desktop viewport" },
  { value: "tablet", icon: <Tablet size={15} />, title: "Tablet viewport" },
  { value: "mobile", icon: <Smartphone size={15} />, title: "Mobile viewport" },
];

export function TopToolbar() {
  const dispatch = useAppDispatch();
  const { mode, viewport, isCanvasLocked, isLeftPanelCollapsed } =
    useAppSelector((state) => state.builder);
  const { activeProject, isDirty } = useAppSelector((state) => state.project);

  return (
    <Layout.Header className="ezyr-panel z-10 grid h-14 grid-cols-[minmax(260px,1fr)_auto_minmax(260px,1fr)] items-center gap-3 border-b !px-0">
      <div className="flex min-w-0 items-center">
        <Tooltip
          title={
            isLeftPanelCollapsed ? "Expand left panel" : "Collapse left panel"
          }
        >
          <button
            aria-label="Toggle left panel"
            className={[
              "group relative grid h-14 w-[69px] shrink-0 place-items-center overflow-hidden bg-white transition",
              "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18a8c7] focus-visible:ring-inset",
              isLeftPanelCollapsed
                ? "text-[#0f8ca8]"
                : "text-[#172033] hover:bg-[#f8fafc]",
            ].join(" ")}
            type="button"
            onClick={() => dispatch(toggleLeftPanel())}
          >
            <Image
              alt="Ezyr"
              className="h-8 w-8 object-contain transition duration-150 group-hover:scale-95 group-hover:opacity-0 group-focus-visible:opacity-0"
              height={32}
              priority
              src={ezyrLogo}
              width={32}
            />
            <span className="absolute inset-0 grid place-items-center text-[#172033] opacity-0 transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              <PanelLeft size={16} />
            </span>
          </button>
        </Tooltip>
        <div className="flex min-w-0 flex-col px-3 leading-tight">
          <Typography.Text className="text-sm font-semibold text-[#172033]">
            Ezyr
          </Typography.Text>
          <Typography.Text className="max-w-56 truncate text-xs text-[#667085]">
            {activeProject.name}
            {isDirty ? " - Unsaved" : ""}
          </Typography.Text>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Segmented<BuilderMode>
          size="small"
          value={mode}
          onChange={(value) => dispatch(setMode(value))}
          options={[
            { label: "Select", value: "select" },
            { label: "Insert", value: "insert" },
            { label: "Preview", value: "preview" },
          ]}
        />
        <Divider type="vertical" />
        <Segmented<BuilderViewport>
          size="small"
          value={viewport}
          onChange={(value) => dispatch(setViewport(value))}
          options={viewportOptions.map((option) => ({
            value: option.value,
            label: (
              <Tooltip title={option.title}>
                <span className="flex h-5 items-center">{option.icon}</span>
              </Tooltip>
            ),
          }))}
        />
      </div>

      <div className="flex min-w-0 items-center justify-end gap-1 pr-2">
        <Tooltip title="Undo">
          <Button aria-label="Undo" icon={<Undo2 size={16} />} type="text" />
        </Tooltip>
        <Tooltip title="Redo">
          <Button aria-label="Redo" icon={<Redo2 size={16} />} type="text" />
        </Tooltip>
        <Tooltip title={isCanvasLocked ? "Unlock canvas" : "Lock canvas"}>
          <Button
            aria-label="Toggle canvas lock"
            icon={<Lock size={16} />}
            type={isCanvasLocked ? "primary" : "text"}
            onClick={() => dispatch(toggleCanvasLock())}
          />
        </Tooltip>
        <Divider type="vertical" />
        <Tooltip title="AI generate">
          <Button icon={<Bot size={16} />}>AI</Button>
        </Tooltip>
        <Tooltip title="Run preview">
          <Button icon={<Play size={16} />}>Run</Button>
        </Tooltip>
        <Tooltip title="Preview">
          <Button aria-label="Preview" icon={<Eye size={16} />} />
        </Tooltip>
        <Button icon={<Save size={16} />} type="primary">
          Save
        </Button>
        <Button icon={<Cloud size={16} />}>Publish</Button>
      </div>
    </Layout.Header>
  );
}
