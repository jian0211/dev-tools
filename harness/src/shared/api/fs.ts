export interface ElectronAPI {
  openFolder: () => Promise<string | null>
  readFile: (filePath: string) => Promise<string | null>
  writeFile: (filePath: string, content: string) => Promise<void>
  ensureDir: (dirPath: string) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export const fsAPI = {
  openFolder: () => window.electronAPI.openFolder(),
  readFile: (filePath: string) => window.electronAPI.readFile(filePath),
  writeFile: (filePath: string, content: string) =>
    window.electronAPI.writeFile(filePath, content),
  ensureDir: (dirPath: string) => window.electronAPI.ensureDir(dirPath),

  getHarnessFilePath: (projectPath: string, phase: string, filename: string) =>
    `${projectPath}/.harness/${phase}/${filename}`,
}
