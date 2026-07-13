# Expo + MapLibre 구조 요약

이 문서는 대국민지도 앱의 현재 Expo 설정과 MapLibre 화면 구조를 빠르게 다시 확인하기 위한 메모다.

현재 기준 파일:

- [`app.json`](../app.json): 설치되는 앱과 네이티브 빌드 설정
- [`package.json`](../package.json): JavaScript 프로젝트 실행과 의존성 설정
- [`src/app/index.tsx`](../src/app/index.tsx): 캠퍼스 지도 첫 화면

## 1. 전체 구조

```text
Expo 앱 설정
|- app.json       네이티브 앱의 이름, 식별자, 플러그인
|- package.json   실행 명령, 진입점, 라이브러리 버전
`- src/app
   `- index.tsx
      `- View
         |- StatusBar
         `- Map
            `- Camera
```

`View`와 `Map`은 화면에 보이는 영역이고, `StatusBar`와 `Camera`는 각각 운영체제 상태 표시줄과 지도 시점을 제어한다.

## 2. app.json과 package.json

### app.json

Expo가 네이티브 iOS/Android 앱을 생성하고 실행할 때 읽는 앱 설정이다.

| 현재 항목 | 역할 |
|---|---|
| `name` | 홈 화면 등에 표시되는 앱 이름 |
| `slug` | Expo 프로젝트 식별용 이름 |
| `version` | 사용자에게 배포되는 앱 버전 |
| `orientation` | 화면 방향 제한 |
| `scheme` | `kookmin://` 형태의 딥링크 스킴 |
| `plugins` | Expo Prebuild에서 적용할 네이티브 설정 플러그인 |
| `ios.bundleIdentifier` | iOS 앱의 고유 식별자 |
| `android.package` | Android 앱의 고유 식별자 |

현재 `com.anonymous.kookmin`은 임시 식별자다. 스토어 배포나 실제 딥링크를 설정하기 전에 팀 소유 식별자로 확정해야 한다.

앱 설정은 빌드 결과에 포함될 수 있으므로 비밀키 저장소로 사용하지 않는다.

### package.json

npm과 Expo CLI가 JavaScript 프로젝트를 설치하고 실행할 때 읽는 설정이다.

| 현재 항목 | 역할 |
|---|---|
| `main` | 앱의 JavaScript 진입점. 현재는 `expo-router/entry` |
| `scripts` | `npm run start`, `npm run ios` 같은 실행 명령 |
| `dependencies` | 앱 실행에 필요한 라이브러리와 허용 버전 |
| `devDependencies` | 타입 검사 등 개발 중에 필요한 도구 |
| `private: true` | 이 앱을 npm 패키지로 실수로 배포하지 못하게 함 |

`package-lock.json`은 실제로 설치된 전체 의존성 버전을 고정한다. 직접 편집하지 않고 `npm install`로 갱신한다.

핵심 차이:

```text
app.json     = 어떤 네이티브 앱을 만들 것인가
package.json = 어떤 JavaScript 코드와 도구로 실행할 것인가
```

## 3. 컴포넌트 역할

### View

React Native의 기본 레이아웃 컨테이너다. 웹의 `div`와 비슷한 위치지만 실제 iOS/Android 네이티브 뷰로 렌더링된다.

현재 바깥 `View`의 `flex: 1`은 앱 화면 전체를 차지하게 한다.

### StatusBar

화면 상단의 시계, 배터리, 네트워크 아이콘 영역을 제어한다.

```tsx
<StatusBar style="dark" />
```

현재 설정은 상태 표시줄의 아이콘과 글자를 어둡게 표시한다. 일반 레이아웃 요소처럼 높이를 차지하는 헤더는 아니다.

### Map

MapLibre의 네이티브 지도 렌더러다. 지도 제스처, 지도 이벤트, 소스와 레이어 렌더링을 담당한다.

```tsx
<Map
  style={styles.map}
  mapStyle="https://demotiles.maplibre.org/style.json"
>
```

- `style`: React Native 화면에서 지도 박스의 크기와 위치를 정한다.
- `mapStyle`: 지도 안에 어떤 데이터를 어떤 순서와 모양으로 그릴지 정한다.

현재 `mapStyle` URL은 MapLibre 데모 지도다. 앱 구조 확인용이며 대국민지도 고유 지도 스타일은 아니다.

### Camera

지도에서 사용자가 바라보는 영역을 제어한다. 화면에 별도 UI를 그리는 컴포넌트는 아니다.

```tsx
<Camera
  initialViewState={{
    center: [126.9975, 37.611],
    zoom: 15.5
  }}
/>
```

- `center`: 중심 좌표. 순서는 `[경도, 위도]`다.
- `zoom`: 확대 수준이다.
- `bearing`: 지도 회전 각도다.
- `pitch`: 지도 기울기다.
- `padding`: 하단 시트나 상단 UI를 피해 지도를 배치할 여백이다.
- `initialViewState`: 화면이 처음 열릴 때만 적용되는 초기 시점이다.

검색 결과를 누른 뒤 특정 건물이나 호실로 이동할 때는 `Camera` ref의 `fitBounds`, `flyTo`, `easeTo` 같은 명령형 메서드를 사용한다.

## 4. 스타일의 3계층

세 종류의 스타일을 구분해야 한다.

| 계층 | 대상 | 예시 |
|---|---|---|
| React Native `style` | 지도 컴포넌트의 화면 크기와 위치 | `flex: 1` |
| Map `mapStyle` | 지도 전체의 데이터 소스와 레이어 구성 | 배경, 도로, 건물, 글꼴 |
| Layer `paint` / `layout` | 개별 지도 레이어의 표현 | 방 색상, 경로선 두께, 호실 글자 |

`mapStyle`은 URL뿐 아니라 Style JSON 객체도 받을 수 있다.

```tsx
const campusStyle = {
  version: 8 as const,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background" as const,
      paint: { "background-color": "#F5F6F8" }
    }
  ]
};

<Map style={styles.map} mapStyle={campusStyle} />
```

대국민지도에서는 지도 전체 테마를 `mapStyle`로 정의하고, 건물·층·호실·경로 GeoJSON은 소스와 레이어로 추가한다. 호실마다 별도 `Map`을 만들지 않는다.

## 5. MORI 핵심 흐름에 적용

검색 결과에서 호실을 선택하는 수직 슬라이스는 다음 순서로 연결된다.

```text
장소 검색
-> 장소 선택
-> 장소의 건물, 층, 경계 좌표 조회
-> 선택 건물과 층의 GeoJSON 레이어 표시
-> Camera.fitBounds()로 해당 호실까지 이동
-> 대상 호실 레이어를 강조
```

역할을 나누면 다음과 같다.

- 데이터: 장소가 어느 건물·층에 있고 경계가 어디인지 제공한다.
- `Map`과 레이어: 선택한 층의 평면도와 호실을 그린다.
- `Camera`: 선택한 호실이 잘 보이는 화면 범위로 이동한다.
- React Native UI: 검색창, 층 선택 버튼, 장소 카드를 지도 위에 배치한다.

초기 구현에서는 `Camera`를 지도 시점의 단일 제어 지점으로 두는 편이 단순하다. `mapStyle`의 기본 `center`/`zoom`과 `Camera` 설정을 동시에 관리하지 않는다.

## 6. 공식 문서

- [Expo app config](https://docs.expo.dev/workflow/configuration/)
- [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [React Native View](https://reactnative.dev/docs/view)
- [Expo StatusBar](https://docs.expo.dev/versions/latest/sdk/status-bar/)
- [MapLibre React Native Map](https://maplibre.org/maplibre-react-native/docs/components/map/)
- [MapLibre React Native Camera](https://maplibre.org/maplibre-react-native/docs/components/camera/)
- [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/)
