# 실시간 STT 태블릿 앱
마이크 음성을 실시간 텍스트 자막으로 변환해 태블릿 가로화면에 표시하는 앱.
---
## 기술 스택
| 영역 | 도구 |
|---|---|
| 프레임워크 | React Native + Expo (SDK 55) |
| 언어 | TypeScript |
| 라우팅 | expo-router |
| STT | `expo-speech-recognition` (**on-device 강제**, ko-KR) |
| 상태 관리 | Zustand |
| 로컬 저장 | AsyncStorage (Zustand `persist` 미들웨어) |
| 스타일 (기본) | StyleSheet (UI 컴포넌트 라이브러리 사용 금지) |
| 슬라이더 | `@react-native-community/slider` |
| 화면 방향 | `expo-screen-orientation` |
| 그라데이션 | `expo-linear-gradient` |
| SVG | `react-native-svg` |
| 애니메이션 | `react-native-reanimated` |
| 아이콘 | `lucide-react-native` |
| 블러 (글래스모피즘) | `expo-blur` |
| 텍스트 마스킹 | `@react-native-masked-view/masked-view` |
### 설치 명령어
```bash
npx expo install expo-linear-gradient react-native-svg expo-blur \
  react-native-reanimated @react-native-masked-view/masked-view \
  expo-screen-orientation @react-native-async-storage/async-storage \
  @react-native-community/slider expo-speech-recognition
npm install lucide-react-native zustand
```
> `react-native-reanimated`는 `babel.config.js`의 `plugins`에 `'react-native-reanimated/plugin'` 추가 필요 (반드시 마지막에 위치).
---
## 폴더 구조
```
src/
├── app/                          # expo-router 라우트
│   ├── _layout.tsx               # 가로 고정, 테마 프로바이더
│   ├── index.tsx                 # / (랜딩)
│   ├── permission.tsx            # /permission (권한 게이트)
│   └── main.tsx                  # /main (idle/active 내부 분기)
├── components/
│   ├── CaptionView.tsx           # 자막 ScrollView
│   ├── ControlBar.tsx            # 하단 제어 바 컨테이너
│   ├── FontSizeSlider.tsx        # 16~64pt 슬라이더
│   ├── ThemeToggle.tsx           # 다크/화이트 토글
│   └── StartStopButton.tsx       # ▶시작 / ■중지
├── store/
│   ├── settingsStore.ts          # fontSize, theme (persist)
│   └── sttStore.ts               # transcript, isListening, autoScrollPaused
├── hooks/
│   ├── useSpeechRecognition.ts
│   ├── useMicPermission.ts
│   └── useAutoScroll.ts
├── constants/
│   ├── theme.ts                  # 색상 토큰
│   └── layout.ts                 # 폰트 범위, 비율 등 상수
└── utils/
```
---
## 라우팅 흐름
```
랜딩(/)  ──[시작하기]──>  권한 게이트(/permission)  ──[허용]──>  메인(/main, idle)
                              ↑                                    │  ↑
                           [거부]                              [▶시작][■중지]
                              │                                    ↓  │
                         [설정 이동]                          메인(/main, active)
                              ↓
                       앱 복귀 시 권한 재확인
```
- `/main`의 **idle ↔ active**는 별도 라우트가 아니라 `sttStore.isListening` 값으로 같은 화면 안에서 분기한다.
---
## 화면 명세
### `/` (랜딩)
- 앱 타이틀 + "시작하기" 버튼 하나
- 버튼 클릭 → `router.replace('/permission')`
### `/permission`
- 마운트 시 `useMicPermission`으로 현재 권한 상태 확인
- 상태별 UI:
  - `undetermined` → 권한 요청 트리거
  - `granted` → 즉시 `router.replace('/main')`
  - `denied` → "마이크 권한이 없어 STT 기능을 사용할 수 없습니다" 메시지 + "설정으로 이동" 버튼 (`Linking.openSettings()`)
- **AppState 리스너**로 `active` 진입 시 권한 재확인 → granted면 자동 `/main` 이동
### `/main`
- 레이아웃: 자막 영역(약 78%) + 하단 제어 바(약 22%)
- 제어 바: `FontSizeSlider` / `ThemeToggle` / `StartStopButton`
- **idle 상태** (`isListening === false`): 자막 영역에 안내 텍스트("시작 버튼을 눌러 음성 인식을 시작하세요")
- **active 상태** (`isListening === true`): 실시간 자막 누적 표시 + 자동 스크롤 동작
---
## 기능 명세
### 1. 실시간 음성-텍스트 변환 (`useSpeechRecognition.ts`)
- `ExpoSpeechRecognitionModule.start({ lang: 'ko-KR', continuous: true, interimResults: true, requiresOnDeviceRecognition: true })`
- 이벤트:
  - `result` → `sttStore.appendTranscript(text, isFinal)` (interim은 마지막 segment 교체, final은 확정 append)
  - `error` → 콘솔 로깅 후 `isListening = false`
  - `end` → `isListening = false`
- 중지: `ExpoSpeechRecognitionModule.stop()`
- 화면 표시 지연 2초 이내 (interimResults로 보장)
- transcript는 **메모리에만 저장** (앱 종료 시 휘발)
### 2. 텍스트 크기 실시간 조절 (`FontSizeSlider.tsx`)
- 범위: 16 ~ 64 (step 1), 기본 32
- `@react-native-community/slider` 사용
- `onValueChange` → `settingsStore.setFontSize(v)` → 자막 텍스트 즉시 반영
- 핸들 터치 영역 최소 44×44
- 현재 값 라벨 표시 (예: "32pt")
- 값은 `persist`로 AsyncStorage 자동 저장
### 3. 다크/화이트 모드 (`ThemeToggle.tsx`)
- 토글 버튼 → `settingsStore.setTheme('dark' | 'light')`
- 모든 컴포넌트는 `useSettingsStore(s => s.theme)`로 구독해 `constants/theme.ts` 토큰 적용
- 배경/텍스트뿐 아니라 슬라이더 트랙, 버튼 등 **모든 UI 요소**에 모드별 색상 적용
- `persist`로 자동 저장, 첫 실행 시 기본값은 `light`
### 4. 랜드스케이프 UI 최적화
- `app.json`: `"orientation": "landscape"`
- `_layout.tsx`에서 `ScreenOrientation.lockAsync(LANDSCAPE)` 보강
- 메인 화면 레이아웃:
  - 자막 영역: `flex: 0.78`, 화면 가로 전체
  - 제어 바: `flex: 0.22`, 가로 배치 (좌: 슬라이더, 우: 토글 + 시작/중지)
- 기본 자막 폰트 32pt, 라인 높이 1.4
### 5. 마이크 권한 (`useMicPermission.ts`)
- `ExpoSpeechRecognitionModule.requestPermissionsAsync()` 호출
- 반환 상태: `granted` | `denied` | `undetermined`
- 거부 시: `Linking.openSettings()`로 시스템 설정 이동
- `AppState` 'change' 이벤트 리스너 → `nextAppState === 'active'`이면 권한 재조회
### 6. 자동 스크롤 (`useAutoScroll.ts`)
- `ScrollView` ref + `transcript` 변경 시 `scrollToEnd({ animated: true })`
- 사용자 드래그 감지:
  - `onScrollBeginDrag` → `sttStore.setAutoScrollPaused(true)`
  - `onScrollEndDrag` → 4초 `setTimeout` 후 `false`로 복귀
- 자동 스크롤 재개 시 미묘한 시각 피드백 (하단 인디케이터 페이드 인/아웃)
- 스크롤 애니메이션 약 300~500ms
---
## Zustand Store 구조
### `settingsStore.ts` (persist)
```ts
{
  fontSize: number,              // 16~64, 기본 32
  theme: 'light' | 'dark',       // 기본 'light'
  setFontSize: (n: number) => void,
  setTheme: (t: 'light' | 'dark') => void,
}
```
### `sttStore.ts` (메모리만, 저장 X)
```ts
{
  transcript: string,                                  // 누적 자막
  isListening: boolean,
  autoScrollPaused: boolean,
  appendTranscript: (text: string, isFinal: boolean) => void,
  resetTranscript: () => void,
  setListening: (v: boolean) => void,
  setAutoScrollPaused: (v: boolean) => void,
}
```
---
## 디자인 토큰 (`constants/theme.ts`)
```ts
export const themes = {
  light: {
    bg: '#FFFFFF',
    text: '#1A1A1A',
    subText: '#666666',
    accent: '#2E7AE0',
    controlBg: '#F2F2F2',
    sliderTrack: '#999999',
    border: '#E0E0E0',
  },
  dark: {
    bg: '#0A0A0A',
    text: '#FFFFFF',
    subText: '#AAAAAA',
    accent: '#4A9EFF',
    controlBg: '#1A1A1A',
    sliderTrack: '#CCCCCC',
    border: '#2A2A2A',
  },
} as const;
```
## 레이아웃 상수 (`constants/layout.ts`)
```ts
export const FONT_SIZE = { MIN: 16, MAX: 64, DEFAULT: 32 } as const;
export const CAPTION_AREA_RATIO = 0.78;
export const CONTROL_AREA_RATIO = 0.22;
export const AUTO_SCROLL_RESUME_DELAY = 4000; // ms
export const TOUCH_TARGET_MIN = 44;            // pt
```
---
## 스타일 라이브러리 사용 규칙
**기본 원칙**: 일반 레이아웃, 색상, 간격, 폰트는 **반드시 `StyleSheet`만 사용**.
아래 표의 효과가 필요할 때만 해당 라이브러리를 도입한다. UI 컴포넌트 라이브러리(NativeBase, React Native Paper 등)는 절대 사용 금지.
### 효과별 매핑
| 원하는 효과 / 웹 CSS | RN 구현 방법 | 사용 시점 |
|---|---|---|
| `linear-gradient` | `<LinearGradient>` from `expo-linear-gradient` | 버튼 배경, 사운드 바, 아이콘 컨테이너 등 그라데이션 필요한 모든 곳 |
| `radial-gradient` | `react-native-svg`의 `<RadialGradient>` 또는 LinearGradient 다중 레이어 근사 | 프레임 배경의 글로우 영역 (RN에는 radial gradient 기본 미지원) |
| `background-clip: text` (텍스트 그라데이션) | `<MaskedView>` + `<LinearGradient>` 조합 | 강조 텍스트 (예: 랜딩의 "자막" 글자) |
| `backdrop-filter: blur(...)` | `<BlurView>` from `expo-blur` | 글래스모피즘 버튼 (예: 뒤로가기) |
| `box-shadow` (강한 glow) | `shadowColor` + 큰 `shadowRadius` + 절대 배치 LinearGradient로 보강 | 마이크 아이콘 주변 글로우 등 (RN 기본 shadow는 약함) |
| `@keyframes` 무한 반복 | `react-native-reanimated`의 `withRepeat(withTiming(...), -1)` | 페이드인, 플로팅, 글로우 펄스, 웨이브 이동 등 모든 애니메이션 |
| `clamp()` 반응형 단위 | `useWindowDimensions()` + 계산 함수 | 폰트 크기, 패딩 등 화면 비례 값 |
| SVG `<path>` 애니메이션 | `react-native-svg` + Reanimated의 `useAnimatedProps` | 사운드 웨이브 라인 |
| `aspect-ratio: 16/9` | RN StyleSheet에서 그대로 지원 (`aspectRatio: 16/9`) | 16:9 프레임 박스 |
### 아이콘 사용
웹 코드의 `lucide-react`는 RN에서 `lucide-react-native`로 대체.
```tsx
import { Mic, ChevronRight, Shield } from 'lucide-react-native';
<Mic size={24} color="#fff" strokeWidth={2.2} />
```
> 모든 lucide 아이콘은 `react-native-svg`에 의존하므로 SVG 패키지가 먼저 설치돼 있어야 한다.
### 랜딩 화면 (`/`) 구현 시 주의
웹 버전의 시각 효과를 RN으로 옮길 때 우선순위:
1. **그라데이션 배경** → LinearGradient 레이어 2~3개 겹쳐서 radial 효과 근사
2. **떠다니는 태그 (말풍선)** → 이미지 에셋(`textbox_left.png`, `textbox_right.png`)을 `<Image>`로 깔고 그 위 `<Text>` 절대 배치, Reanimated로 fade-in + float
3. **사운드 웨이브** → `react-native-svg`의 `<Svg><Path/></Svg>`를 `transform: translateX`로 무한 루프
4. **텍스트 그라데이션** ("자막") → MaskedView + LinearGradient
5. **글래스모피즘 버튼** → BlurView 래퍼 + 반투명 배경
6. **CTA glow** → LinearGradient 버튼 + `shadowColor` + 절대 배치 그라데이션 후광
- **가로 모드 고정** — 세로 회전 차단
- **텍스트 저장 금지** — `sttStore.transcript`는 메모리에만 존재, 세션 종료 시 휘발
- **on-device STT만 사용** — 네트워크 의존성 없음, 클라우드 STT 코드 작성 금지
- **UI 컴포넌트 라이브러리 사용 금지** — NativeBase, React Native Paper 등 금지. 단, 저수준 스타일 프리미티브(expo-linear-gradient, react-native-svg, expo-blur, MaskedView, reanimated, lucide-react-native)는 위 "스타일 라이브러리 사용 규칙" 섹션에 따라 사용 허용
- **타겟 디바이스** — 16:9 (또는 16:10) 비율 태블릿, 반응형으로 처리
---
## 개발 우선순위
| Phase | 작업 |
|---|---|
| 1 | Expo 프로젝트 셋업 (위 설치 명령어 실행, Reanimated babel plugin 설정), 가로 모드 고정, expo-router 기본 라우트 3개 스켈레톤 |
| 2 | `useMicPermission` + `/permission` 화면 (요청, 거부 안내, 설정 이동, AppState 재확인) |
| 3 | `useSpeechRecognition` + `sttStore` (on-device ko-KR, interim/final 처리) |
| 4 | `CaptionView` + `/main` idle/active 분기, 기본 32pt 자막 표시 |
| 5 | `settingsStore` (persist) + `FontSizeSlider` (16~64pt 즉시 반영) |
| 6 | `ThemeToggle` + 다크/화이트 토큰 전 컴포넌트 적용 |
| 7 | `useAutoScroll` (하단 도달 자동 스크롤, 드래그 시 일시중지, 4초 후 재개) |
