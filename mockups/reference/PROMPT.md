# 미래관 AI 이미지 생성 요청서

**레퍼런스 사진**: `miraegwan-namu.png` (출처: 나무위키 북악캠퍼스 문서 — 생성 참조용으로만 사용)
**사용법**: GPT(이미지 첨부) 또는 나노바나나(사진 편집 지시)에 사진과 아래 프롬프트를 함께 넣는다.

> 이 사진은 준공 초기 사진이지만 건물 구조·유리 배치는 지금과 같아서 생성 참조로는 충분하다.
> AI가 스타일을 전부 갈아엎기 때문에 사진의 낡은 화질·앞의 공사 짐은 결과물에 안 남는다.
> 더 좋은 결과를 원하면: **미래관 정면 1장 + 모서리(45도) 1장을 폰으로 직접 찍어서** 이 폴더에 넣고
> 그걸 첨부하는 게 웹에서 구할 수 있는 어떤 사진보다 낫다 (웹에는 최신 외관 사진이 사실상 없음 —
> 카카오맵 리뷰는 음식 사진뿐, 로드뷰는 나무에 가림, 공식 홈페이지는 지도만 제공).

**보너스**: `bukakgwan-n7n8-2023.jpg` — 2023년 북악관(N2)·N7·N8 전경 (운동장에서 촬영, 화질 좋음).
북악관 아이소메트릭 뽑을 때 레퍼런스로 사용. `yesulgwan-namu.png` — 예술관용.

스타일 방침: 실물(베이지 석재 + 파란 커튼월)을 와이어프레임 스타일(흰색 미니멀 + 파란 유리)로 변환.
파란 유리 부분이 미래관의 정체성이므로 유리 배치는 사진 그대로 유지시킨다.

---

## 1) 아이소메트릭 — 건물 상세 카드용 (1:1 정사각)

> Use the attached photo as the exact reference for building massing, proportions, and glass placement.
> Minimal architectural miniature: isometric 3D render of this building, reinterpreted in clean white
> minimal style — white matte facade, the blue glass curtain-wall sections and window strips kept
> light-blue glass exactly where they are in the photo, 5 stories, entrance plaza with wide steps in front.
> Floating diorama on a plain light-gray studio background (#E9EAEB), soft studio lighting, subtle
> shadows, a few tiny trees. High detail, no text, no labels, no people, no cars. Square 1:1.

## 2) 정면 입면 — 층 선택 화면용 (3:4 세로)

> Use the attached photo as reference. Flat front elevation, perfectly straight-on orthographic view of
> the same building in minimal white style: white facade panels, light-blue glass curtain-wall strips and
> window grid matching the photo's layout, blue entrance with steps at ground level. Clean 3D render
> look, soft daylight, pale sky background, no perspective distortion, no text, no people. Portrait 3:4.

---

## 규칙 (중요)

- **층 배지(2F·39 등)·텍스트를 이미지에 절대 넣지 않는다** — 배지는 앱 UI 레이어로 얹는다
- 결과물이 마음에 들면 그 이미지를 **스타일 레퍼런스로 저장**해두고, 다음 건물(공학관 등)을 뽑을 때
  "같은 스타일로" + 그 이미지를 함께 첨부한다 — 건물 20동이 한 세트로 보이게 하는 방법
- 나노바나나면 편집 지시가 잘 먹힌다: "이 사진 속 건물을 흰색 미니멀 아이소메트릭 3D 미니어처로
  바꿔줘. 파란 유리 부분은 그대로 유지" 식으로 한국어로 써도 됨
- 완성된 PNG를 이 폴더(`mockups/reference/`)에 넣어주면 시안에 합성한다
  (권장 파일명: `miraegwan-iso.png`, `miraegwan-elevation.png`)
