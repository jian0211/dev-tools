import { useState } from 'react';
import { S } from '../styles/app.styles';

export function AskPanel({ workspacePath, project, phase, subTab, docContent, docName }: {
  workspacePath: string; project: string; phase: string; subTab: string;
  docContent: string; docName: string;
}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: string }>>([]);

  const handleAsk = async () => {
    if (!question.trim() || !window.electronAPI) return;
    setAsking(true);
    setAnswer('');

    const contextInfo = docContent
      ? `[Project: ${project}] [Phase: ${phase}] [Tab: ${subTab}] [File: ${docName}]\n\n${docContent}`
      : `[Project: ${project}] [Phase: ${phase}] [Tab: ${subTab}]`;

    const result = await window.electronAPI.askClaude(workspacePath, question, contextInfo);
    const ans = result.ok ? (result.answer || '') : `Error: ${result.error}`;
    setAnswer(ans);
    setHistory((prev) => [{ q: question, a: ans }, ...prev].slice(0, 20));
    setQuestion('');
    setAsking(false);
  };

  return (
    <div style={S.askPanel}>
      <div style={S.askHeader}>Ask Claude</div>

      <div style={S.askHistory}>
        {asking && (
          <div style={S.askBubbleAi}>
            <span style={S.askThinking}>Thinking...</span>
          </div>
        )}
        {answer && !asking && (
          <div style={S.askBubbleAi}>
            <pre style={S.askAnswer}>{answer}</pre>
          </div>
        )}
        {history.slice(answer && !asking ? 1 : 0).map((h, i) => (
          <div key={i}>
            <div style={S.askBubbleUser}>{h.q}</div>
            <div style={S.askBubbleAi}><pre style={S.askAnswer}>{h.a}</pre></div>
          </div>
        ))}
      </div>

      <div style={S.askInputRow}>
        <input
          style={S.askInput}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk()}
          placeholder={docName ? `Ask about ${docName}...` : 'Ask about this phase...'}
          disabled={asking}
        />
        <button style={S.askBtn} onClick={handleAsk} disabled={asking || !question.trim()}>
          {asking ? '...' : '↑'}
        </button>
      </div>
    </div>
  );
}
