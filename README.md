# dev-tools

유명 스킬을 내 워크플로에 맞게 고쳐 두고, 써본 뒤 좋고 나쁨을 남기는 저장소.

1깊이는 단계, 2깊이는 스킬 이름, 3깊이는 `scripts/` 또는 `references/`가 있을 때만 쓴다.

## 단계

| 폴더 | 하는 일 |
| --- | --- |
| [01-frame](01-frame/) | 문제를 자른다. 조사와 스펙도 여기. |
| [02-shape](02-shape/) | 범위와 설계를 정한다. |
| [03-build](03-build/) | 만든다. 환경 구성도 여기. |
| [04-check](04-check/) | 맞는지 본다. 테스트와 리뷰. |
| [05-keep](05-keep/) | 나간 것을 고친다. 장애, 수정, 리팩터. |

## 스킬 폴더

```text
03-build/test-driven-development/
  SKILL.md
  origin.md
  trial.md
  scripts/       # 있을 때만
  references/    # 있을 때만
```

이름은 소문자와 하이픈만 쓴다. 단계 말은 붙이지 않는다. 한 스킬은 가장 자주 쓰는 단계에만 두고, 다른 단계는 README에 링크만 건다.

상태는 `trial`, `adopted`, `dropped`. 아직 안 써봤으면 `trial`이다.

## 추가

1. 단계 아래에 스킬 폴더를 만든다.
2. `SKILL.md`는 원문 요약이 아니라, 내 트리거로 다시 쓴 호출 절차다.
3. `origin.md`에 저자, URL, 라이선스, 가져온 날짜, 고친 점을 적는다.
4. 한 번 써본 뒤 `trial.md`를 채운다.
5. 그 단계 README에 상태와 한 줄을 추가한다.
