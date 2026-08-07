# 대국민지도 — 화면 디자인 스펙

기능명세서 7장(디자인 가이드)의 화면별 구체화. 실제 앱 스크린샷 레퍼런스(Google Maps·Waze·ParkMobile·Geocaching 등 지도 앱군)에서 공통 문법을 추출해 우리 화면에 대응시켰다.

## 0. 방향 한 줄

**지도가 주인공, UI는 지도 위에 뜬 얇은 층.** 모든 오버레이는 ① 상단 검색바 ② 우측 컨트롤 스택 ③ 하단 시트 — 이 세 자리 밖에 두지 않는다. 레퍼런스로 삼은 모든 지도 앱이 예외 없이 이 3분할을 따른다.

## 1. 토큰 (팀 와이어프레임 기준 — Figma 매칭2팀 파일 97:74 노드에서 추출)

```ts
// src/theme.ts — 모든 컴포넌트는 여기서만 가져다 쓴다
export const color = {
  brand:     "#0CA35B",  // 캠퍼스 그린 — 포인트·마커·층 배지·경로선·선택 강조.
                         // 와이어프레임의 파란보라에서 의도적으로 변주 (원본과 구별되는 정체성)
  brandSoft: "#DDF3E6",  // 선택 방 채움, 아바타 배경 등
  cta:       "#1B1D1F",  // 주 행동 버튼은 검정 풀폭 — 팀 시안 문법 (등록하기/보러 가기)
  ink:       "#191F28",  // 제목·본문
  sub:       "#8B95A1",  // 보조 텍스트
  border:    "#E5E8EB",
  bg:        "#F4F5F2",  // 미색 배경 — 팀 시안 톤
  white:     "#FFFFFF",
  danger:    "#E5484D",  // "경로 없음" 등
};
export const radius = 20;          // 시트·카드 공통 단일값 (팀 시안 라운드)
export const space = 4;            // 4pt 배수만
export const font = {              // Pretendard
  title: 17, body: 15, caption: 12,
};
```

아이콘은 **Lucide** 단일 세트 (RN에서는 `lucide-react-native`): search, navigation(길찾기 FAB),
locate-fixed(현위치), chevron-left/right/up, bookmark, ellipsis, refresh-cw, layers, info, locate,
map-pin, arrow-up-right(공유). 이모지·유니코드 글리프 사용 금지.
건물 일러스트의 유리는 실물대로 파랑 유지 — 그린 UI + 파란 건물 유리 조합이 이 앱의 시각 정체성.

지도 톤: 베이스맵을 파스텔 그린 계열로 리컬러한다 (와이어프레임의 연녹 지도 톤. 시안에서는 multiply 틴트로 근사, 실제 앱에서는 MapLibre 스타일 JSON의 land/park 색을 조정). 건물 마커는 `brand` 원형 도트 + 흰 칩(건물명) 조합.

터치 타깃 최소 44pt. 그림자는 시트·검색바에만 (`opacity 0.08, radius 12`), 지도 위 다른 요소엔 금지.

## 2. 화면별 문법

### 2.1 캠퍼스 뷰 (홈)

레퍼런스: Google Maps 홈 — 상단 플로팅 검색바 + 우측 컨트롤 + 하단 시트.

- 검색바: 상단 safe-area 아래 플로팅 필(pill). 좌 돋보기, 중앙 플레이스홀더 "건물·호실 검색", 우 × (입력 시)
- 우측 컨트롤 스택: 현위치 버튼 1개만 (레이어·나침반 등은 YAGNI)
- 건물 폴리곤: 채움 `bg`색 계열 + 외곽선, 라벨은 건물명만. 선택 시 `brand` 강조
- 하단: 평상시 시트 없음 — 지도 전면. (구글맵의 "주변 소식" 시트는 우리 범위 밖)

### 2.2 검색

레퍼런스: 지도 앱 공통 — 검색바 탭 → 리스트가 지도를 덮음.

- 현재 드롭다운 방식 유지 가능 (결과 ≤6개 전제). 결과 행: 좌 아이콘(건물/방/실외 구분) + 제목 + 부제("공학관 1층") + 층 배지
- 무결과: "등록되지 않은 장소" + 건물 카드 행 + "혹시 이 장소를 찾으세요?" 유사 3행 (명세 2.4 폴백)
- 업그레이드 경로: 결과가 많아지면 풀스크린 검색 화면으로 전환 — 문법만 바꾸면 되도록 결과 행 컴포넌트는 공용으로

### 2.3 장소 카드 (바텀시트)

레퍼런스: Geocaching 미리보기 시트, Google Maps 장소 시트 — **peek 시트**: 제목+부제+액션만 보이는 낮은 시트, 지도를 가리지 않음.

- 구성(위→아래): 그랩바 · 제목("115호") · 부제("재료시험실 · 공학관 1층") · 액션 행
- 액션 행: [지도에서 보기](건물 카드일 때) / [출발] [도착](라우팅 가능한 방일 때) / [공유] — 필 버튼, 주 액션만 `brand` 채움
- 건물 카드 확장(스와이프 업): 사진(있으면) · 최적 입구 안내 · 층별 요약
- 구현: `@gorhom/bottom-sheet` snap points `[112, "55%"]`. 현재의 고정 카드 → 시트 전환은 5단계(장소 카드) 작업에 포함

### 2.4 실내 층별 뷰

레퍼런스: 네이버지도 코엑스 실내 문법 (명세 명시) — 현재 구현이 이미 이 문법.

- 층 선택기: 우측 세로 스택, 현재 층 `brand` 채움 필, 나머지 white. B1은 `B1` 표기
- 상단: 뒤로가기 + "공학관 · 2F" 칩 (풀폭 헤더 바 금지 — 지도를 가림)
- 방 폴리곤: 용도별 채움은 저채도 유지, 라벨은 호실번호 우선. 선택 방만 `brand` 돌출(기존 fill-extrusion 유지)

### 2.5 경로 안내

레퍼런스: Waze 경로 요약(하단 카드: 시간·거리 + 단일 CTA), Google Maps(하단 시트 + 시작 버튼).

- 하단 요약 시트(peek): "**7분** · 320m · 층 이동 1회" + [종료] — 숫자(시간)가 제일 크게
- 층 전환 칩: 지도 상단 중앙 "1F → 2F" 필, 탭/스와이프로 층 넘김 (명세 3.3). 스텝 리스트는 시트 확장 시에만
- 경로선: `brand` 셰브론 선(기존 구현), 타층 구간 점선 유지
- "계단 없는 경로" 토글: 요약 시트 안 (2차 목표 시)

## 3. 모션 (딱 3개, 명세 7.4)

1. 바텀시트 스프링 (@gorhom 기본 스프링 사용, 커스텀 금지)
2. 층 전환: 도면 크로스페이드 200ms
3. 카메라 flyTo는 MapLibre 기본 이징 — 별도 애니메이션 라이브러리 도입 없음

## 4. 상태별 화면

| 상태 | 처리 |
|---|---|
| 검색 로딩 | 없음 (로컬 인덱스, 즉시) |
| 무결과 | 2.2 폴백 |
| 경로 없음 | 시트에 사유 + `danger` 텍스트, 지도는 그대로 |
| 지도 타일 로딩 실패(오프라인) | 실내 도면·검색은 로컬이므로 동작 유지, 베이스맵만 회색 |

## 5. 명시적으로 안 하는 것

하단 탭바(화면 1개뿐), 다크모드(후순위), 온보딩, 커스텀 마커 일러스트, 지도 위 그라데이션·장식. 각각 필요해지는 시점에 추가.

## 6. 검증 루프

화면 구현마다: 시뮬레이터(iOS)·웹 스크린샷 → 이 문서의 해당 절과 대조 → 어긋난 항목만 수정. 작은 폰(SE)·큰 폰에서 검색바/시트 겹침, 키보드 열림 상태, 긴 장소명 말줄임 확인.

## 참고 레퍼런스 (서명 URL, 1년 유효)

- [Google Maps 홈 — 검색바·컨트롤·시트 3분할](https://zlfyzdmohcskkucuunmk.supabase.co/storage/v1/render/image/sign/screenshots/nav1_google-maps/backlog/2025_11_18_22-59-38_247281E4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTU0MmU4OC1mNWRkLTQxMDEtOWZkYy0yODFiMzM3NmYyOTIiLCJhbGciOiJIUzI1NiJ9.eyJ0cmFuc2Zvcm1hdGlvbnMiOiJ3aWR0aDo3NjgscmVzaXplOmNvbnRhaW4scXVhbGl0eTo3MCIsInVybCI6InNjcmVlbnNob3RzL25hdjFfZ29vZ2xlLW1hcHMvYmFja2xvZy8yMDI1XzExXzE4XzIyLTU5LTM4XzI0NzI4MUU0LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU3MjUwNTksImV4cCI6MTgxNzI2MTA1OX0.-OB6w2fT6Z0imXk2_gtrZu6R4cjfSxiATMVpOySE2wQ)
- [Geocaching — 장소 미리보기 peek 시트](https://zlfyzdmohcskkucuunmk.supabase.co/storage/v1/render/image/sign/screenshots/nav5_geocaching/compare/2024-05-13(01-18-19).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTU0MmU4OC1mNWRkLTQxMDEtOWZkYy0yODFiMzM3NmYyOTIiLCJhbGciOiJIUzI1NiJ9.eyJ0cmFuc2Zvcm1hdGlvbnMiOiJ3aWR0aDo3NjgscmVzaXplOmNvbnRhaW4scXVhbGl0eTo3MCIsInVybCI6InNjcmVlbnNob3RzL25hdjVfZ2VvY2FjaGluZy9jb21wYXJlLzIwMjQtMDUtMTMoMDEtMTgtMTkpLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU1NTcxMzAsImV4cCI6MTgxNzA5MzEzMH0.zbG_mgSFnTabvg3XRAuZG-1eV5Eeqhcd9kaenHDTJDc)
- [Waze — 경로 요약 하단 카드](https://zlfyzdmohcskkucuunmk.supabase.co/storage/v1/render/image/sign/screenshots/nav2_waze/compare/2025-05-03-15-33-13-.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTU0MmU4OC1mNWRkLTQxMDEtOWZkYy0yODFiMzM3NmYyOTIiLCJhbGciOiJIUzI1NiJ9.eyJ0cmFuc2Zvcm1hdGlvbnMiOiJ3aWR0aDo3NjgscmVzaXplOmNvbnRhaW4scXVhbGl0eTo3MCIsInVybCI6InNjcmVlbnNob3RzL25hdjJfd2F6ZS9jb21wYXJlLzIwMjUtMDUtMDMtMTUtMzMtMTMtLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU0NzIwMzUsImV4cCI6MTgxNzAwODAzNX0.N2baJ0rXcrXI5PQRqmzVtXVMme3v_rwyAqmcPEPu-1c)
