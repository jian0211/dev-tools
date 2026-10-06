# dev-tools

有名なスキルを自分のワークフローに合わせて直し、使ったあとに向き不向きを残すリポジトリ。

1階層は段階、2階層はスキル名、3階層は `scripts/` か `references/` があるときだけ使う。

## 段階

| フォルダ | すること |
| --- | --- |
| [01-spec](01-spec/) | 何を作るか書く。調査と仕様。 |
| [02-design](02-design/) | どう作るか決める。構造、API、作業分解。 |
| [03-implement](03-implement/) | 作る。環境構築もここ。 |
| [04-test](04-test/) | 合っているか確かめる。テストとレビュー。 |
| [05-maintain](05-maintain/) | 出したものを直す。障害、修正、リファクタ。 |

## スキルフォルダ

```text
03-implement/test-driven-development/
  SKILL.md
  origin.md
  trial.md
  scripts/       # あるときだけ
  references/    # あるときだけ
```

名前は小文字とハイフンだけにする。段階の言葉は付けない。一つのスキルはいちばんよく使う段階にだけ置き、ほかの段階は README にリンクだけ書く。

状態は `trial`、`adopted`、`dropped`。まだ使っていなければ `trial`。

## 追加

1. 段階の下にスキルフォルダを作る。
2. `SKILL.md` は原文の要約ではなく、自分のトリガーで書き直した手順にする。
3. `origin.md` に著者、URL、ライセンス、取り込んだ日付、変えた点を書く。
4. 一度使ったあと `trial.md` を埋める。
5. その段階の README に状態と一行を足す。
