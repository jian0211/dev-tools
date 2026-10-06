# dev-tools

유명 스킬을 내 워크플로에 맞게 고쳐 두고, 써본 뒤 좋고 나쁨을 남기는 저장소.

有名なスキルを自分のワークフローに合わせて直し、使ったあとに向き不向きを残すリポジトリ。

Depth 1 is a stage, depth 2 is a skill name, depth 3 is `scripts/` or `references/` only when needed.

## Stages

| Folder | What it holds |
| --- | --- |
| [01-spec](01-spec/) | 무엇을 만들지 글로 남긴다. 조사와 스펙. / 何を作るか書く。調査と仕様。 |
| [02-design](02-design/) | 어떻게 만들지 정한다. 구조, API, 작업 분해. / どう作るか決める。構造、API、作業分解。 |
| [03-implement](03-implement/) | 만든다. 환경 구성도 여기. / 作る。環境構築もここ。 |
| [04-test](04-test/) | 맞는지 본다. 테스트와 리뷰. / 合っているか確かめる。テストとレビュー。 |
| [05-maintain](05-maintain/) | 나간 것을 고친다. 장애, 수정, 리팩터. / 出したものを直す。障害、修正、リファクタ。 |

## Skill folder

```text
03-implement/karpathy-guidelines/
  SKILL.md
  README.md
  trial.md
  scripts/       # only when needed
  references/    # only when needed
```

Names use lowercase letters and hyphens. Do not repeat the stage name. Keep one copy in the stage where it is used most, and link it from other stage READMEs.

Status is `trial`, `adopted`, or `dropped`. Unused skills stay `trial`.

Explanations of a skill or a stage are written in Korean and Japanese. Headings, fields, and status values stay in English.

## Add a skill

1. Create a skill folder under the stage.
2. Rewrite `SKILL.md` as the trigger you will actually use, not as a summary of the source.
3. Put the source, license, and a Korean and Japanese explanation in `README.md`.
4. Fill `trial.md` after using it once.
5. Add a status and a one-line note to that stage README.

## Styles

출력 방식만 바꾸는 것은 단계 밖에 둔다. 원문은 가져오지 않고, 그 버전의 링크만 남긴다.

話し方だけを変えるものは段階の外に置く。原文は持ち込まず、そのバージョンのリンクだけ残す。

- [attention-span 0.8](styles/attention-span/)

