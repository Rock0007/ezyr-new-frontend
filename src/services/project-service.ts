import type { ProjectSummary } from "@/types/project";

export async function getProjectSummary(): Promise<ProjectSummary> {
  return {
    id: "northstar-capital-os",
    name: "Northstar Capital OS",
    status: "draft",
    updatedAt: "2026-07-04T00:00:00.000Z",
  };
}
