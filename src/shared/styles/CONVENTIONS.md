# Style conventions

Expo / React Native 스타일 작성 기준. Vanilla Extract 대신 `StyleSheet` + theme 계약을 사용한다.

## File layout

| 대상                 | 파일                                                        |
| -------------------- | ----------------------------------------------------------- |
| 토큰                 | `src/shared/styles/tokens/` (`unit`, `spacing`, `color`, …) |
| 테마·공개 API        | `src/shared/styles/theme.ts`, `index.ts`                    |
| 컴포넌트/화면 스타일 | 같은 폴더에 `ComponentName.styles.ts` (colocate)            |

- 스타일 export 이름은 `styles`로 통일한다.
- `StyleSheet.create({ ... })`만 사용한다. 인라인 `style={{ ... }}`은 동적 값이 필요할 때만.

```ts
// Foo.styles.ts
import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg.primary },
})
```

```tsx
// Foo.tsx
import { styles } from './Foo.styles'
```

## Theme & tokens

- 컴포넌트에서는 `@/shared/styles`의 **`theme`** 을 import한다.
- 색·간격·폰트·radius를 hex/`number`로 하드코딩하지 않는다. (예외: 일회성 프로토타입·디버그 UI)
- **소스 of truth**: `tokens/figma-variables.json`. 키 이름은 Figma Variables와 동일(오타·중복·kebab/공백 포함).
- 토큰 레이어:
  - **Primitive**: `unit`, `percentage`, `primitiveColor`, `fontSize`/`lineHeight`/`letterSpacing` 등
  - **Semantic**: `space`, `semanticColor`, `typography.Heading`/`Body`, `radius`, `borderWidth`, `shadow`
  - **Brand**: `brandColor` — primary → `deep blue`, secondary → `neutral`
- 화면 코드는 주로 **semantic**을 쓴다.
  - `theme.color.text.primary`, `theme.space[16]`
  - kebab/공백 키: `theme.color.text['info-bold']`, `theme.color.bg['dim-32%']`, `theme.color.bg.interactive['primary-pressed']`
  - 타이포: `theme.typography.Heading.md['font size']` + `pretendardForWeight(weight)` (RN weight 파일 매핑)
- 새 토큰이 필요하면 Figma Variables에 추가 → JSON 갱신 → `tokens/`에 반영.
- **폰트**: Pretendard는 `assets/fonts` + `fonts.ts`의 `require` 맵을 `App.tsx`의 `useFonts`로 로드.

### Spacing vs Unit

**둘 다 유지**한다. 하나로 합치지 않는다.

|        | `unit`                                         | `space`                        |
| ------ | ---------------------------------------------- | ------------------------------ |
| 역할   | Primitive 격자 (Unit/N = N px)                 | 레이아웃 간격용 semantic alias |
| 사용처 | radius, borderWidth, elevation, 아이콘 크기 등 | margin / padding / gap         |
| 예시   | `radius.md` → `unit[4]`                        | `theme.space[16]` → `unit[16]` |

근거:

1. Figma도 Primitive(Unit)와 Semantic(Spacing)을 분리한다. 코드가 합치면 디자인·코드 매핑이 깨진다.
2. `space`만 두면 radius/border가 “간격 토큰”에 묶여 의미가 흐려진다.
3. `unit`만 두면 시맨틱 간격(`space[16]` 등) 레이어가 없어 디자인·코드 매핑이 어려워진다. alias 레이어를 두는 편이 안전하다.

컴포넌트에서는 **간격 = `theme.space`**, **크기 격자 = `theme.unit`(또는 appearance 토큰)** 을 쓴다.

## Design frame (Figma)

- 디자인 기준 프레임: **390×844** (`Mobile(390-844)`).
- 그리드 토큰: `theme.grid.mobile` (`Grid/Mobile/390` — 4열, gutter/margin 20).
- Figma px ≈ RN dp(포인트). 간격·타이포·그리드는 이 프레임 기준으로 `tokens`에 옮긴다.
- **네이티브 앱을 390×844로 고정하지 않는다.** 구현은 기기 풀스크린 + flex / SafeArea로 맞춘다. 좌우 여백은 `theme.grid.mobile.columns.margin`을 기준으로 맞춘다.
- 1차 시각 검수 시뮬레이터: **iPhone 14 (390×844)** 를 권장한다.
- 웹 미리보기용 390 폭 셸은 필요할 때만 추가한다 (필수가 아님).

## Layout vs Screen

| 레이어                     | 책임                                       |
| -------------------------- | ------------------------------------------ |
| `AppLayout` / `AuthLayout` | safe-area, 배경, 공통 padding/구조         |
| Screen / feature 컴포넌트  | 해당 화면·컴포넌트의 타이포, 간격, 버튼 등 |

레이아웃에 화면 전용 문구/버튼 스타일을 넣지 않는다. 공통으로 반복되면 `shared/components`로 올린다.

## Do / Don't

**Do**

- `theme.color.text.*` / `theme.color.bg.*`, `theme.space.*`, `theme.typography.Heading|Body`, `theme.radius.*` 사용
- Figma와 다른 키를 만들지 않는다 (camelCase 별칭·코드 전용 시맨틱 금지)
- 스타일 키는 역할 중심 (`root`, `content`, `title`, `subtitle`)
- Safe area는 Layout / `SafeAreaProvider`에서 처리

**Don't**

- Vanilla Extract API (`style()`, `*.css.ts`, CSS variables)
- 웹 전용 선택자·의사클래스 (`:hover`, `::before`, media query as CSS string)
- className / CSS Modules
- 레이아웃·토큰을 화면마다 복붙
- 컴포넌트에서 `unit`을 margin/padding에 직접 쓰기 (간격은 `space`)

## Related

- 토큰: `src/shared/styles/tokens/`
- 공개 API: `src/shared/styles/index.ts`
