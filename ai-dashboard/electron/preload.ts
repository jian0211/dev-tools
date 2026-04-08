import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getWorkspaceData: (path: string) => ipcRenderer.invoke('get-workspace-data', path),
  getHarnessFolder: (workspacePath: string, projectName: string, folder: string) =>
    ipcRenderer.invoke('get-harness-folder', workspacePath, projectName, folder),
  createHarnessProject: (workspacePath: string, projectName: string) =>
    ipcRenderer.invoke('create-harness-project', workspacePath, projectName),
  askClaude: (workspacePath: string, prompt: string, context: string) =>
    ipcRenderer.invoke('ask-claude', workspacePath, prompt, context),
  getHookEvents: () => ipcRenderer.invoke('get-hook-events'),
  onHookEvent: (callback: (event: any) => void) => {
    ipcRenderer.on('hook-event', (_event, data) => callback(data));
  },
});
