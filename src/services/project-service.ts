import type { ProjectSummary } from "@/types/project";

export async function getProjectSummary(): Promise<ProjectSummary> {
  return {
    id: "ezyr-demo-project",
    name: "Untitled Ezyr App",
    status: "draft",
    updatedAt: new Date(0).toISOString(),
  };
}
