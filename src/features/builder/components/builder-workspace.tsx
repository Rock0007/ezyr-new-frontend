"use client";

import { Layout } from "antd";
import { BuilderCanvas } from "@/components/builder/builder-canvas";
import { BuilderConsole } from "@/components/builder/builder-console";
import { LeftSidebar } from "@/components/builder/left-sidebar";
import { PropertyPanel } from "@/components/builder/property-panel";
import { TopToolbar } from "@/components/builder/top-toolbar";

export function BuilderWorkspace() {
  return (
    <Layout className="h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <TopToolbar />
      <Layout className="min-h-0 flex-1">
        <LeftSidebar />
        <Layout.Content className="min-w-0 bg-[#eef3f8]">
          <BuilderCanvas />
        </Layout.Content>
        <PropertyPanel />
      </Layout>
      <BuilderConsole />
    </Layout>
  );
}
