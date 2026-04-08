import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import { spawn } from 'child_process';
import { readClaudeConfig, readAiTasks } from './utils/claude';
import { readHarnessProjects, readHarnessFolderFiles } from './utils/harness';
import { getGitInfo } from './utils/git';
import { getDummyData, DUMMY_FOLDER_FILES } from './data/dummyData';

let mainWindow: BrowserWindow | null = null;

// --- Hook 수신 서버 ---
const hookEvents: Array<{ timestamp: string; event: string; tool?: string; data: any }> = [];

function startHookServer() {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url?.startsWith('/api/hooks')) {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const event = {
            timestamp: new Date().toISOString(),
            event: data.hook_event_name || req.url?.split('/').pop() || 'unknown',
            tool: data.tool_name,
            data,
          };
          hookEvents.push(event);
          if (hookEvents.length > 500) hookEvents.shift();
          mainWindow?.webContents.send('hook-event', event);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(4200, () => console.log('[Hook Server] listening on :4200'));
}

// --- IPC 핸들러 등록 ---
function registerIpcHandlers() {
  ipcMain.handle('get-workspace-data', (_event, workspacePath: string) => {
    const harnessDir = path.join(workspacePath, '.harness');
    const hasHarness = fs.existsSync(harnessDir);

    const realClaude = readClaudeConfig(workspacePath);
    const realTasks = readAiTasks(workspacePath);
    const git = getGitInfo(workspacePath);
    const dummy = getDummyData();

    return {
      claude: realClaude || dummy.claude,
      tasks: realTasks.length > 0 ? realTasks : dummy.tasks,
      harness: hasHarness ? readHarnessProjects(workspacePath) : dummy.harness,
      hookEvents: hookEvents.slice(-50),
      git,
    };
  });

  ipcMain.handle('get-harness-folder', (_event, workspacePath: string, projectName: string, folder: string) => {
    const harnessDir = path.join(workspacePath, '.harness');
    if (!fs.existsSync(harnessDir)) {
      return DUMMY_FOLDER_FILES[projectName]?.[folder] || [];
    }
    return readHarnessFolderFiles(workspacePath, projectName, folder);
  });

  ipcMain.handle('create-harness-project', (_event, workspacePath: string, projectName: string) => {
    const projectDir = path.join(workspacePath, '.harness', projectName);
    if (fs.existsSync(projectDir)) {
      return { ok: false, error: 'Project already exists' };
    }

    const meetingDir = path.join(projectDir, 'meeting');
    fs.mkdirSync(meetingDir, { recursive: true });

    const today = new Date().toISOString().slice(0, 10);
    const meetingContent = `# Meeting Note ${today}\n\n## Participants\n- \n\n## Agenda\n- \n\n## Decisions\n- \n\n## Next Actions\n- \n`;
    fs.writeFileSync(path.join(meetingDir, 'current.md'), meetingContent, 'utf-8');

    return { ok: true, path: projectDir };
  });

  // Claude CLI で質問
  ipcMain.handle('ask-claude', (_event, workspacePath: string, prompt: string, context: string) => {
    return new Promise((resolve) => {
      const claudePath = path.join(process.env.HOME || '', '.local', 'bin', 'claude');
      const fullPrompt = context
        ? `以下のドキュメントについて質問があります:\n\n---\n${context}\n---\n\n質問: ${prompt}`
        : prompt;

      const child = spawn(claudePath, ['-p', fullPrompt, '--output-format', 'json'], {
        cwd: workspacePath,
        env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}` },
      });

      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
      child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
      child.on('close', (code: number) => {
        if (code === 0 && stdout) {
          try {
            const json = JSON.parse(stdout);
            resolve({ ok: true, answer: json.result || stdout });
          } catch {
            resolve({ ok: true, answer: stdout });
          }
        } else {
          resolve({ ok: false, error: stderr || `Exit code ${code}` });
        }
      });
      child.on('error', (err: Error) => {
        resolve({ ok: false, error: err.message });
      });
    });
  });

  ipcMain.handle('get-hook-events', () => hookEvents.slice(-100));
}

// --- 윈도우 생성 ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'AI Dashboard',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  startHookServer();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
