// --- Dummy Data ---
export function getDummyData() {
  return {
    claude: {
      plans: [
        { name: 'seo-strategy.md', content: '# SEO 전략\n\nPhase 1: 기본 메타태그 최적화\nPhase 2: 성능 개선 (LCP, CLS)\nPhase 3: 구조화 데이터 적용' },
        { name: 'auth-refactor.md', content: '# 인증 리팩토링\n\n기존 세션 기반 → JWT 전환\n마이그레이션 계획 포함' },
      ],
      agents: [
        { name: 'frontend-code-reviewer.md', content: '# Frontend Code Reviewer\nReact/TypeScript/Next.js 코드 리뷰 전문' },
        { name: 'backend-go-reviewer.md', content: '# Backend Go Reviewer\nClean Architecture, Go 관용구 리뷰' },
        { name: 'security-reviewer.md', content: '# Security Reviewer\nOWASP Top 10 취약점 탐지' },
      ],
      commands: ['create-prd', 'frontend-code-review', 'backend-code-review', 'commit-and-pr', 'table-design', 'extract-patterns'],
      skills: ['explaining-code', 'flutter-code-review', 'vercel-react-best-practices', 'web-design-guidelines'],
      hooks: ['auto-format-biome.sh', 'auto-format-dart.sh'],
      settings: { model: 'opusplan', language: 'Korean' },
    },
    tasks: [
      { name: 'perf-search-spot-banner', file: 'perf-search-spot-banner.md', total: 6, done: 2, preview: '# 태스크: /search/spot 배너 섹션 성능 개선\n\nLCP·CLS·INP 개선을 위한 배너 최적화' },
      { name: 'auth-session-migration', file: 'auth-session-migration.md', total: 8, done: 8, preview: '# 세션 → JWT 마이그레이션\n\n모든 엔드포인트 전환 완료' },
      { name: 'video-player-hls', file: 'video-player-hls.md', total: 4, done: 1, preview: '# HLS 비디오 플레이어 개선\n\npreload 로직 업데이트 및 썸네일 제거' },
    ],
    harness: [
      {
        name: 'beer-seo-optimization',
        phase: 'build',
        folders: ['meeting', 'cps', 'prd', 'spec', 'architecture', 'tasks'],
      },
      {
        name: 'moet-content-platform',
        phase: 'design',
        folders: ['meeting', 'cps', 'prd', 'spec'],
      },
      {
        name: 'tomato-ai-chat',
        phase: 'deliver-done',
        folders: ['meeting', 'cps', 'prd', 'spec', 'architecture', 'tasks', 'self-review', 'pr'],
      },
      {
        name: 'account-auth-refactor',
        phase: 'plan-in-progress',
        folders: ['meeting', 'cps', 'prd'],
      },
      {
        name: 'admin-tool-dashboard',
        phase: 'plan-not-started',
        folders: ['meeting'],
      },
    ],
    hookEvents: [
      { timestamp: new Date(Date.now() - 60000 * 2).toISOString(), event: 'PostToolUse', tool: 'Edit', data: {} },
      { timestamp: new Date(Date.now() - 60000 * 5).toISOString(), event: 'PostToolUse', tool: 'Bash', data: {} },
      { timestamp: new Date(Date.now() - 60000 * 8).toISOString(), event: 'PostToolUse', tool: 'Read', data: {} },
      { timestamp: new Date(Date.now() - 60000 * 12).toISOString(), event: 'SessionStart', tool: undefined, data: {} },
      { timestamp: new Date(Date.now() - 60000 * 30).toISOString(), event: 'Stop', tool: undefined, data: {} },
      { timestamp: new Date(Date.now() - 60000 * 31).toISOString(), event: 'PostToolUse', tool: 'Write', data: {} },
      { timestamp: new Date(Date.now() - 60000 * 35).toISOString(), event: 'PostToolUse', tool: 'Grep', data: {} },
      { timestamp: new Date(Date.now() - 60000 * 60).toISOString(), event: 'SessionStart', tool: undefined, data: {} },
    ],
  };
}

export const DUMMY_FOLDER_FILES: Record<string, Record<string, Array<{ name: string; content: string }>>> = {
  'beer-seo-optimization': {
    meeting: [
      { name: '2026-04-04-seo-progress-meeting.md', content: '# SEO 進捗ミーティング\n> 2026-04-04 | 田中(PM), Ji(FE), 佐藤(BE)\n\n## TL;DR\nPhase 1 バナー最適化進行中。next/image 移行完了、画像サイズ指定は今週中に対応予定。\n\n## 논의 사항\n- PageSpeed モバイルスコア 45→62 に改善（目標 85+）\n- next/image 移行は完了、CLS は 0.25→0.12 に改善\n- setTimeout 累積問題の対応方針\n\n## 결정 사항\n- 画像サイズ指定を今週中に完了させる\n- setTimeout 管理は useRef パターンで来週対応\n- Phase 2（求人カード画像）は Phase 1 完了後に着手\n\n## Action Items\n- [ ] Ji: 画像サイズ (width/height) 指定 → 4/7まで\n- [ ] 佐藤: setTimeout useRef 管理 → 4/11まで\n- [ ] 田中: Phase 2 スコープ整理 → 4/11まで\n\n## 다음 미팅\n4/11 (金) 14:00 — Phase 1 最終レビュー' },
      { name: '2026-04-01-kickoff-meeting.md', content: '# SEO 改善キックオフ\n> 2026-04-01 | 田中(PM), Ji(FE), 佐藤(BE), 鈴木(Design)\n\n## TL;DR\nBeer 検索ページの Core Web Vitals が基準未達。バナーセクション最適化を最優先で進める。\n\n## 논의 사항\n- PageSpeed Insights モバイル: 45点（競合平均: 72点）\n- LCP 4.2s, CLS 0.25, INP 280ms — 全指標で基準超過\n- 原因: バナー画像未最適化、slick CSS 同期ロード、setTimeout 累積\n\n## 결정 사항\n- Phase 1: バナーセクション最適化を最優先\n- next/image + slick CSS 非同期ロードで対応\n- CPS → PRD → Spec の順で文書化、AI が担当\n\n## Action Items\n- [ ] Ji: CPS 文書作成 → 4/2まで\n- [ ] Ji: PRD 作成 → 4/3まで\n- [ ] 佐藤: 現行バナーの Lighthouse 詳細分析 → 4/2まで' },
    ],
    cps: [
      { name: '2026-04-02-banner-optimization-cps.md', content: '# Context / Problem / Solution\n\n## Context\nBeer プラットフォームの求人検索ページ (/search/spot) は月間 50万 PV のメインページ。\nGoogle の Core Web Vitals 基準を満たしていない。\n\n## Problem\n1. LCP: 4.2s (基準: < 2.5s) — バナー画像の最適化不足\n2. CLS: 0.25 (基準: < 0.1) — 画像サイズ未指定\n3. INP: 280ms (基準: < 200ms) — setTimeout 累積\n\n## Solution\n- next/image による画像最適化\n- slick CSS の非同期ロード\n- setTimeout の適切な管理\n\n## 測定可能な目標\n- LCP: 4.2s → 2.0s\n- CLS: 0.25 → 0.05\n- INP: 280ms → 150ms\n- PageSpeed スコア: 45 → 85+' },
    ],
    prd: [
      { name: '2026-04-03-search-page-seo-prd.md', content: '# PRD: Beer 検索ページ SEO 改善\n\n## 目的\nCore Web Vitals の改善により検索順位を向上させる\n\n## 成功基準 (測定可能)\n- [ ] LCP < 2.5s (現在 4.2s)\n- [ ] CLS < 0.1 (現在 0.25)\n- [ ] INP < 200ms (現在 280ms)\n- [ ] PageSpeed モバイルスコア 85+\n\n## スコープ\n### Phase 1: バナーセクション最適化\n- SearchBannerSection コンポーネント改修\n- next/image 移行\n- CSS 非同期ロード\n\n### Phase 2: その他コンポーネント\n- 求人カード画像の最適化\n- フォント読み込み改善\n\n## 対象外\n- サーバーサイドの変更\n- データベースクエリの最適化' },
    ],
    spec: [
      { name: '2026-04-03-banner-section-spec.md', content: '# 技術仕様: バナーセクション最適化\n\n## 変更対象ファイル\n```\ntypescript/apps/beer/src/components/pages/SearchSpotPage/\n  components/SearchBannerSection/SearchBannerSection.tsx\n```\n\n## 変更内容\n\n### 1. slick CSS 非同期ロード\n- import 文を削除\n- next/dynamic で コンポーネント自体を遅延ロード\n\n### 2. next/image 移行\n- Chakra UI Image → next/image\n- width: 640, height: 176 (large)\n- width: 400, height: 153 (small)\n- index === 0 に priority 付与\n\n### 3. setTimeout 管理\n- useRef でタイマー ID 管理\n- clearTimeout で累積防止\n- useEffect cleanup で解放' },
    ],
    architecture: [
      { name: '2026-04-03-image-pipeline-architecture.md', content: '# アーキテクチャ: 画像最適化パターン\n\n## 方針\n既存の Chakra UI ベースを維持しつつ、\n画像コンポーネントのみ next/image に置換する。\n\n## コンポーネント構成\n```\nSearchBannerSection (lazy loaded)\n  └── next/image (priority for first banner)\n      ├── large: 640x176 webp\n      └── small: 400x153 webp\n```\n\n## 影響範囲\n- SearchBannerSection のみ\n- 他コンポーネントへの影響なし' },
    ],
    tasks: [
      { name: '2026-04-05-slick-css-async-task.md', content: '# slick CSS 非同期ロード化\n\n## 概要\nSearchBannerSection で同期 import されている slick CSS を next/dynamic で遅延ロードする。\n\n## 対象ファイル\n- SearchBannerSection.tsx\n\n## チェックリスト\n- [x] slick-carousel CSS import 削除\n- [x] next/dynamic で SearchBannerSection を lazy load\n- [x] ssr: false オプション設定\n- [x] 動作確認（バナースライド正常動作）\n\n## 完了条件\n- CLS への影響なし\n- バナースライドが正常に動作すること' },
      { name: '2026-04-05-next-image-migration-task.md', content: '# next/image コンポーネント移行\n\n## 概要\nChakra UI Image を next/image に置換し、画像最適化を実現する。\n\n## 対象ファイル\n- SearchBannerSection.tsx\n\n## チェックリスト\n- [x] Chakra UI Image → next/image 置換\n- [x] width: 640, height: 176 (large) 設定\n- [ ] width: 400, height: 153 (small) 設定\n- [ ] index === 0 に priority 属性付与\n- [ ] WebP フォーマット確認\n\n## 完了条件\n- LCP 2.5s 以下' },
      { name: '2026-04-05-settimeout-management-task.md', content: '# setTimeout 累積防止\n\n## 概要\nバナーの自動スライドで setTimeout が累積している問題を修正する。\n\n## 対象ファイル\n- SearchBannerSection.tsx\n\n## チェックリスト\n- [ ] useRef でタイマー ID 管理\n- [ ] clearTimeout で累積防止\n- [ ] useEffect cleanup で解放\n- [ ] INP 測定テスト\n\n## 完了条件\n- INP 200ms 以下\n- タイマーリーク無し' },
      { name: '2026-04-05-pagespeed-validation-task.md', content: '# PageSpeed 最終検証\n\n## 概要\n全最適化完了後に PageSpeed Insights で目標スコア達成を確認する。\n\n## チェックリスト\n- [ ] モバイル PageSpeed テスト実行\n- [ ] LCP < 2.5s 確認\n- [ ] CLS < 0.1 確認\n- [ ] INP < 200ms 確認\n- [ ] スコア 85+ 達成確認\n\n## 完了条件\n- 全 Core Web Vitals 基準クリア\n- PageSpeed モバイルスコア 85+' },
      { name: '2026-04-03-initial-audit-task.md', content: '# 初期パフォーマンス調査\n\n## 概要\n現状の /search/spot ページのパフォーマンスを詳細分析する。\n\n## チェックリスト\n- [x] PageSpeed Insights 分析\n- [x] 競合サイト調査（3社）\n- [x] Lighthouse レポート生成\n- [x] ボトルネック特定・文書化\n\n## 完了条件\n- 分析レポート完成' },
    ],
  },
  'moet-content-platform': {
    meeting: [
      { name: '2026-04-03-recommend-kickoff-meeting.md', content: '# レコメンド機能 キックオフ\n> 2026-04-03 | 山田(PM), Ji(FE), 木村(ML)\n\n## TL;DR\n動画視聴完了率が低い（35%）。協調フィルタリングベースのレコメンドエンジン導入を決定。\n\n## 논의 사항\n- 現状レコメンドは新着順のみ → ユーザー離脱の主因\n- ML チームのリソースは 4月中旬から確保可能\n\n## 결정 사항\n- AIベースの協調フィルタリング導入\n- まず視聴データ収集パイプラインから着手\n\n## Action Items\n- [ ] 木村: 視聴データスキーマ設計 → 4/7まで\n- [ ] Ji: CPS 文書作成 → 4/4まで' },
    ],
    cps: [
      { name: '2026-04-04-recommend-engine-cps.md', content: '# Context / Problem / Solution\n\n## Context\n動画プラットフォームの視聴完了率が低い（平均35%）\n\n## Problem\nレコメンドが単純な新着順のみで、ユーザーの興味に合っていない\n\n## Solution\n視聴履歴ベースの協調フィルタリング導入' },
    ],
    prd: [
      { name: '2026-04-04-recommend-feature-prd.md', content: '# PRD: レコメンド機能改善\n\n## 成功基準\n- 視聴完了率: 35% → 50%\n- クリック率: 2.1% → 5%\n\n## スコープ\n- Phase 1: 視聴データ収集パイプライン\n- Phase 2: レコメンドAPI\n- Phase 3: UI 統合' },
    ],
    spec: [
      { name: '2026-04-05-recommend-api-spec.md', content: '# 技術仕様: レコメンドエンジン\n\n## API 設計\nGET /api/recommendations/:userId\n\n## データモデル\n- viewing_history テーブル追加\n- content_similarity マトリクス' },
    ],
  },
  'tomato-ai-chat': {
    meeting: [
      { name: '2026-03-28-release-readiness-meeting.md', content: '# リリース準備確認\n> 2026-03-28 | 中村(PM), Ji(FE), 高橋(QA)\n\n## TL;DR\n全テスト・パフォーマンス・セキュリティレビュー完了。PM 最終確認を待ってリリース。\n\n## 결정 사항\n- QA サインオフ完了\n- PM 最終確認後、4/1 リリース予定\n\n## Action Items\n- [ ] 中村: 最終確認 → 3/29まで' },
      { name: '2026-03-20-ai-chat-kickoff-meeting.md', content: '# AIチャット機能 キックオフ\n> 2026-03-20 | 中村(PM), Ji(FE), 高橋(QA)\n\n## TL;DR\n医師向けAI相談チャット機能の開発開始。Claude API + Flutter で 3月末リリース目標。\n\n## 결정 사항\n- Clean Architecture + BLoC パターンで実装\n- ストリーミングレスポンス対応必須\n\n## Action Items\n- [ ] Ji: CPS + PRD 作成 → 3/21まで\n- [ ] Ji: チャット UI プロトタイプ → 3/23まで' },
    ],
    cps: [
      { name: '2026-03-21-ai-chat-cps.md', content: '# CPS: AIチャットアプリ\n\n## Context\n医師向けAI相談チャット機能\n\n## Solution\nClaude API + Flutter で実装' },
    ],
    prd: [
      { name: '2026-03-22-ai-chat-prd.md', content: '# PRD: Tomato AI Chat\n\n## 成功基準\n- 応答時間 < 3s\n- ユーザー満足度 4.0+/5.0' },
    ],
    spec: [
      { name: '2026-03-23-flutter-chat-spec.md', content: '# 技術仕様\n\nFlutter + Claude API\nストリーミングレスポンス対応' },
    ],
    architecture: [
      { name: '2026-03-23-clean-arch-architecture.md', content: '# アーキテクチャ\n\nClean Architecture + BLoC パターン' },
    ],
    tasks: [
      { name: '2026-03-25-chat-ui-task.md', content: '# チャット UI 実装\n\n## 概要\nFlutter で医師向けチャット画面を実装する。\n\n## チェックリスト\n- [x] メッセージリスト表示\n- [x] 入力フォーム\n- [x] 送信ボタン・ショートカット\n- [x] ローディングインジケータ\n\n## 完了条件\n- デザインカンプ通りの実装' },
      { name: '2026-03-25-api-integration-task.md', content: '# Claude API 統合\n\n## 概要\nClaude API とのストリーミング通信を実装する。\n\n## チェックリスト\n- [x] API クライアント実装\n- [x] ストリーミングレスポンス対応\n- [x] エラーハンドリング\n- [x] リトライロジック\n\n## 完了条件\n- 応答時間 3s 以内' },
    ],
    'self-review': [
      { name: '2026-03-27-release-check-review.md', content: '# セルフレビュー\n\n- [x] 全テストパス\n- [x] パフォーマンステスト完了\n- [x] セキュリティレビュー完了\n- [x] PM最終確認完了' },
    ],
    pr: [
      { name: '2026-03-28-ai-chat-feature-pr.md', content: '# PR: Tomato AI Chat 機能実装\n\n> feature/tomato-ai-chat → main\n> Author: Ji | Reviewers: 高橋, 中村\n\n## Summary\n医師向けAI相談チャット機能を実装。Claude API によるストリーミングレスポンスに対応。\n\n## Tasks\n\n### [x] チャット UI 実装\nFlutter で医師向けチャット画面を実装。\n\n#### Commits\n- `a1b2c3d` feat: add ChatScreen widget with message list\n- `e4f5g6h` feat: add input form with send button and keyboard shortcut\n- `i7j8k9l` feat: add loading indicator for AI response\n- `m0n1o2p` style: adjust chat bubble spacing and colors\n\n#### Changed Files\n- lib/features/chat/presentation/chat_screen.dart\n- lib/features/chat/presentation/widgets/message_bubble.dart\n- lib/features/chat/presentation/widgets/chat_input.dart\n\n### [x] Claude API 統合\nClaude API とのストリーミング通信を実装。\n\n#### Commits\n- `q3r4s5t` feat: add Claude API client with streaming support\n- `u6v7w8x` feat: add retry logic with exponential backoff\n- `y9z0a1b` fix: handle connection timeout gracefully\n- `c2d3e4f` test: add unit tests for API client\n\n#### Changed Files\n- lib/features/chat/data/claude_api_client.dart\n- lib/features/chat/data/chat_repository_impl.dart\n- test/features/chat/data/claude_api_client_test.dart\n\n## Stats\n- Files changed: 12\n- Insertions: +847\n- Deletions: -23' },
    ],
  },
  'account-auth-refactor': {
    meeting: [
      { name: '2026-04-05-auth-kickoff-meeting.md', content: '# 認証リファクタリング キックオフ\n> 2026-04-05 | 田中(PM), Ji(FE), 佐藤(BE)\n\n## TL;DR\nセッション管理がコンプライアンス要件未達。JWT + リフレッシュトークンへ移行決定。\n\n## 논의 사항\n- 現行セッション方式のセキュリティ監査指摘事項\n- JWT 移行時のゼロダウンタイム要件\n\n## 결정 사항\n- JWT + リフレッシュトークン方式に移行\n- 段階的移行（新旧並行期間 2週間）\n\n## Action Items\n- [ ] 佐藤: CPS 作成 → 4/6まで\n- [ ] Ji: フロントエンド影響範囲調査 → 4/7まで' },
    ],
    cps: [
      { name: '2026-04-06-jwt-migration-cps.md', content: '# CPS: 認証リファクタリング\n\n## Problem\nセッション管理がコンプライアンス要件を満たしていない\n\n## Solution\nJWT + リフレッシュトークン方式に移行' },
    ],
    prd: [
      { name: '2026-04-06-auth-overhaul-prd.md', content: '# PRD: 認証基盤刷新\n\n## 成功基準\n- 全APIエンドポイントJWT対応\n- セッション完全廃止\n- ゼロダウンタイム移行' },
    ],
  },
  'admin-tool-dashboard': {
    meeting: [
      { name: '2026-04-06-admin-dashboard-meeting.md', content: '# 管理ツール ダッシュボード キックオフ\n> 2026-04-06 | 田中(PM), Ji(FE)\n\n## TL;DR\n管理ツールのダッシュボード改善について初回打ち合わせ。まだ方向性未定、次回までに現状分析。\n\n## 논의 사항\n- 現行ダッシュボードの使いにくさ（操作数が多い）\n- データ可視化の改善要望\n\n## 결정 사항\n- 次回までに現状の課題を整理\n- ユーザーインタビュー実施検討\n\n## Action Items\n- [ ] Ji: 現行画面のスクリーンショット + 課題整理 → 4/10まで\n- [ ] 田中: ユーザーインタビュー対象者リスト → 4/10まで' },
    ],
  },
};
