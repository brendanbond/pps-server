export type Project = "personal" | "music" | "financial" | "development";

export type Item = {
  id: string;
  description: string;
  pinned: boolean;
  completed: boolean;
  project: Project;
};
