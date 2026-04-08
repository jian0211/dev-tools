export interface ClaudeConfig {
  plans: MdFile[];
  agents: MdFile[];
  commands: string[];
  skills: string[];
  hooks: string[];
  settings: Record<string, unknown>;
}

export interface MdFile {
  name: string;
  content: string;
  parsedDate?: string;    // "2026-04-07"
  parsedFeature?: string; // "beer-seo"
  parsedType?: string;    // "meeting"
}

export interface AiTask {
  name: string;
  file: string;
  total: number;
  done: number;
  preview: string;
}

export interface HarnessProject {
  name: string;
  phase: string;
  folders: string[];
}

export interface HookEvent {
  timestamp: string;
  event: string;
  tool?: string;
  data: Record<string, unknown>;
}

export interface GitInfo {
  branch: string;
  modifiedFiles: Array<{ status: string; file: string }>;
  recentCommits: string[];
}

export interface WorkspaceData {
  claude: ClaudeConfig | null;
  tasks: AiTask[];
  harness: HarnessProject[];
  hookEvents: HookEvent[];
  git?: GitInfo;
}

// HARNESS 페이즈 → 서브탭 매핑
export const PHASE_TABS = {
  plan: { label: 'Plan', subTabs: ['meeting', 'cps', 'prd'] },
  design: { label: 'Design', subTabs: ['spec', 'architecture', 'tasks'] },
  build: { label: 'Build', subTabs: ['tasks', 'self-review'] },
  deliver: { label: 'Deliver', subTabs: ['self-review', 'pr'] },
} as const;

export type PhaseKey = keyof typeof PHASE_TABS;

declare global {
  interface Window {
    electronAPI?: {
      getWorkspaceData: (path: string) => Promise<WorkspaceData>;
      getHarnessFolder: (workspacePath: string, projectName: string, folder: string) => Promise<MdFile[]>;
      createHarnessProject: (workspacePath: string, projectName: string) => Promise<{ ok: boolean; error?: string; path?: string }>;
      askClaude: (workspacePath: string, prompt: string, context: string) => Promise<{ ok: boolean; answer?: string; error?: string }>;
      getHookEvents: () => Promise<HookEvent[]>;
      onHookEvent: (callback: (event: HookEvent) => void) => void;
    };
  }
}
