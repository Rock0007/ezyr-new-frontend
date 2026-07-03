export type ProjectStatus = "draft" | "published" | "archived";

export type ProjectSummary = {
  id: string;
  name: string;
  status: ProjectStatus;
  updatedAt: string;
};
