# PitchCoach — AI 기반 스타트업 IR 피칭 코치 플랫폼

> **투자자 앞에 서기 전, AI와 함께 완벽하게 준비하세요.**  
> IR Deck 분석 → 음성 피칭 녹음 → Q&A 연습까지, 피칭의 전 과정을 AI가 코칭합니다.

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [화면 구성 및 사용자 플로우](#화면-구성-및-사용자-플로우)
- [프론트엔드 구현 상세](#프론트엔드-구현-상세)
- [디렉터리 구조](#디렉터리-구조)
- [시작하기](#시작하기)

---

## 프로젝트 소개

**PitchCoach**는 스타트업 창업자가 투자자 IR 피칭을 준비하는 전 과정을 AI가 코칭해 주는 웹 플랫폼입니다.

공고문(심사 기준)을 기반으로 IR Deck의 슬라이드를 분석하고, 발표 음성의 전달력·구조를 평가하며, 투자자가 물어볼 예상 질문에 직접 음성으로 답변하고 피드백을 받을 수 있습니다. 모든 분석이 끝나면 레이더 차트·점수 링·토픽 커버리지 바 차트를 포함한 종합 리포트를 생성해 줍니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **회원가입 / 로그인** | JWT 토큰 인증, 온보딩 프로필 설정 |
| **Pitch 목록 관리** | 진행중 / 완료 상태 필터, 실시간 검색 (300ms 디바운싱) |
| **공고문 등록** | 심사 기준이 담긴 공고문 업로드 → AI가 자동 분석 |
| **IR Deck 분석** | PDF 업로드 → 슬라이드 단위 AI 피드백 + 공고 기준별 점수 + 발표 가이드 |
| **음성 피칭 녹음** | 슬라이드 전환 타임스탬프 기록 + 브라우저 `MediaRecorder` 실시간 녹음 |
| **음성 분석** | WPM(분당 단어 수), 말하기 속도 시각화, 세부 기준별 점수 |
| **Q&A 예상 질문** | AI 생성 예상 질문 목록 + 답변 가이드 제공 |
| **Q&A 음성 연습** | 질문별 음성 녹음 → 답변 피드백 |
| **종합 리포트** | 레이더 차트, 총점 링, 핵심 요소 준비도 바, 토픽 커버리지, 개선 포인트 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Radix UI (Dialog, Popover, Tabs), `cmdk` |
| **Icons** | `@iconify/react` |
| **HTTP** | Axios + 커스텀 인터셉터 (토큰 자동 첨부 / 갱신) |
| **Package Manager** | pnpm |

---

## 화면 구성 및 사용자 플로우

```
로그인 / 회원가입
      ↓
  Pitch 목록 (대시보드)
      ↓  새 Pitch 추가
  ┌──────────────────────────────────────────┐
  │  STEP 1. 공고문 등록                      │
  │   기본 정보 입력 → 피칭 유형 선택          │
  │   → 공고문 업로드 → AI 분석 결과 확인      │
  └──────────────────────────────────────────┘
      ↓
  ┌──────────────────────────────────────────┐
  │  STEP 2. IR Deck 분석                     │
  │   PDF 업로드 → AI 분석 대기 (폴링)         │
  │   → 슬라이드 피드백 + 발표 가이드 확인     │
  └──────────────────────────────────────────┘
      ↓
  ┌──────────────────────────────────────────┐
  │  STEP 3. 음성 피칭 녹음 & 분석            │
  │   슬라이드 뷰어 + MediaRecorder 녹음       │
  │   → 업로드 → AI 분석 대기 (폴링)           │
  │   → WPM / 전달력 / 구조 분석 결과 확인    │
  └──────────────────────────────────────────┘
      ↓
  ┌──────────────────────────────────────────┐
  │  STEP 4. Q&A 연습                         │
  │   유형 선택 (가이드 / 실시간 답변)          │
  │   → AI 예상 질문 목록 확인                 │
  │   → 질문별 음성 녹음 → 답변 피드백         │
  └──────────────────────────────────────────┘
      ↓
  ┌──────────────────────────────────────────┐
  │  STEP 5. 종합 리포트 생성                  │
  │   IR Deck + 음성 + Q&A 전체 결과 종합      │
  │   → 레이더 차트, 총점, 개선 포인트 출력    │
  └──────────────────────────────────────────┘
```

---

## 프론트엔드 구현 상세

### 1. App Router 기반 라우트 그룹 설계

Next.js App Router의 라우트 그룹을 활용해 인증(`(auth)`), 메인(`(main)`), 피칭 플로우(`(new)`) 영역을 레이아웃 단위로 분리했습니다.  
각 그룹은 공통 레이아웃(Sidebar, Header, StepNavbar)을 독립적으로 가지며 불필요한 리렌더링 없이 단계별 UI를 구성합니다.

```
src/app/
├── (auth)/         # 로그인, 회원가입, 온보딩
├── (main)/         # 홈, Pitch 목록
└── (new)/
    ├── notice/     # 공고문 등록 플로우 (basic → type → upload → analysis)
    └── new/
        ├── deck/   # IR Deck 업로드 → 분석
        ├── voice/  # 음성 녹음 → 분석
        ├── qna/    # Q&A 유형 → 목록 → 연습 → 피드백
        └── report/ # 종합 리포트
```

### 2. 비동기 AI 분석 — 폴링(Polling) 패턴

AI 분석은 수십 초~수 분이 소요되는 비동기 작업입니다.  
분석 상태가 `IN_PROGRESS`인 동안 `setInterval`로 백엔드를 주기적으로 폴링하고, `COMPLETED` 또는 `FAILED` 상태가 반환되면 인터벌을 정리합니다.

```typescript
// IR Deck 분석 폴링 (10초 간격)
useEffect(() => {
  if (data?.analysis_status === "IN_PROGRESS") {
    const interval = setInterval(() => fetchData(), 10000);
    return () => clearInterval(interval);
  }
}, [data?.analysis_status, fetchData]);
```

불필요한 리렌더링을 막기 위해 새 응답과 이전 상태를 `JSON.stringify`로 비교하여 동일하면 상태 업데이트를 건너뜁니다.

### 3. 브라우저 MediaRecorder API를 활용한 실시간 음성 녹음

Web API `MediaRecorder`를 직접 제어해 별도 라이브러리 없이 음성 녹음 기능을 구현했습니다.

- **슬라이드 타임스탬프 기록**: 슬라이드 전환 시 `performance.now()`로 경과 시간을 측정해 각 슬라이드별 `start_timestamp` / `end_timestamp`를 배열로 구성, 백엔드로 함께 전송합니다.
- **일시정지 / 재시작**: `mediaRecorder.pause()` / `resume()` 으로 연속 스트림 내에서 자연스러운 일시정지를 지원합니다.
- **Q&A 연습**: 각 질문에 대해 독립적인 `MediaRecorder` 인스턴스를 생성해 질문별 Blob을 순차적으로 서버에 제출합니다.

### 4. sessionStorage 기반 크로스 페이지 상태 공유

여러 단계를 거치는 피칭 플로우에서 페이지 간 데이터 전달이 필요합니다.  
`URL 쿼리 파라미터`(`pitch_id`, `ir_deck_id`, `voice_id`)로 ID를 전달하고, 슬라이드 이미지 URL 배열이나 Q&A 질문 목록처럼 크기가 큰 데이터는 `sessionStorage`에 저장해 페이지 이동 시 유지합니다.

```typescript
// 슬라이드 이미지: IR Deck 분석 완료 후 sessionStorage 저장
sessionStorage.setItem("pitch_slides", JSON.stringify(slides));

// 음성 녹음 페이지에서 복원
const savedSlides = sessionStorage.getItem("pitch_slides");
```

### 5. 커스텀 SVG 차트 (외부 차트 라이브러리 미사용)

종합 리포트 페이지의 시각화 컴포넌트를 React + SVG로 직접 구현했습니다.

- **RadarChart**: n각형 그리드를 동적으로 계산, 각 축의 점수에 따라 polygon을 그려 다차원 점수를 한눈에 비교
- **ScoreRing**: `strokeDashoffset`으로 점수에 비례한 원형 게이지를 표현
- **ProgressBar**: 토픽 커버리지 점수 75% 기준으로 우수(파랑) / 보완 필요(노랑) 색상을 동적으로 적용

### 6. Pitch 목록 실시간 검색 (디바운싱)

검색어 입력 시 300ms 디바운싱을 적용해 API 호출 빈도를 줄이고, 상태 필터(전체 / 진행중 / 완료) 변경과 검색어 변경을 동일한 `useEffect`에서 처리합니다.

```typescript
useEffect(() => {
  const timer = setTimeout(() => fetchPitches(), 300);
  return () => clearTimeout(timer);
}, [statusFilter, searchQuery]);
```

### 7. Axios 인터셉터 기반 인증 처리

커스텀 `AxiosInstance`에 요청 인터셉터를 등록해 모든 API 호출에 `localStorage`의 `access_token`을 자동으로 첨부합니다. 인증 오류 시 `refresh_token`으로 갱신하는 흐름을 단일 지점에서 관리합니다.

---

## 디렉터리 구조

```
src/
├── app/                   # Next.js App Router 페이지
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (main)/            # 메인 서비스 페이지
│   └── (new)/             # 피칭 플로우 페이지
├── components/
│   ├── analysis/          # FeedbackSummary, SlideFeedback
│   ├── common/            # Header, Sidebar, StepNavbar, BottomNextBar, BottomChooseBar
│   ├── modal/             # PwModal
│   ├── pitch/             # PitchCard
│   └── ui/                # Radix UI 래퍼 (Dialog, Popover, Tabs, Command)
├── apis/
│   ├── AxiosInstance.ts   # 토큰 인터셉터 포함 Axios 인스턴스
│   ├── PitchApi.ts        # 피칭 관련 API 함수
│   └── SignupApi.ts       # 인증 API 함수
└── types/                 # TypeScript 타입 정의
    ├── PitchType.ts
    ├── IRAnalysisType.ts
    ├── VoiceAnalysisType.ts
    ├── QNAAnalysisType.ts
    ├── ReportType.ts
    └── SignupType.ts
```

---

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

> **환경 변수**: 백엔드 API 주소를 `.env.local`에 설정하세요.
> ```
> NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
> ```
