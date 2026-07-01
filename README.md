# 또또랑 쁘니 🐶🐱

또또(흰색 비숑 강아지)와 쁘니(치즈 고양이)를 돌보는 따뜻한 반려동물 육성 웹앱.
모바일 우선 반응형이며 태블릿·PC에서도 자연스럽게 보입니다. 별도 서버 없이
브라우저 `localStorage` 에 상태가 저장되어 새로고침·재접속해도 유지됩니다.

## 기술 스택
- Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
- 상태 관리: React Context + 커스텀 훅 (외부 상태 라이브러리 없음)
- 애니메이션: 순수 CSS (`prefers-reduced-motion` 지원)

## 실행
```bash
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
```

## 폴더 구조
```
app/                 라우트/레이아웃/전역 스타일(디자인 토큰·애니메이션)
components/          UI 컴포넌트
  screens/           홈/활동/기록/설정 4개 화면
context/GameContext  전역 상태 + 모든 돌봄 액션(단일 소스, localStorage 저장)
hooks/               usePets · usePetActions · useActivityLogs · useTimeBasedStatus · useLocalStorage
lib/                 types · constants · storage · status · mood · effects · utils
public/images/pets/  캐릭터 이미지 폴더 (아래 참고)
```

## 캐릭터 이미지 교체
`public/images/pets/` 에 아래 파일명으로 이미지를 넣으면 코드 수정 없이 반영됩니다.
파일이 없으면 이모지 플레이스홀더가 자동으로 표시되어 화면이 깨지지 않습니다.

```
toto-default.png  toto-happy.png  toto-eating.png  toto-sleeping.png  toto-walking.png
ppuni-default.png ppuni-happy.png ppuni-eating.png ppuni-sleeping.png ppuni-playing.png
```
경로 규칙은 `lib/constants.ts` 의 `petImagePath()` 에서 관리합니다.

## 주요 기능
- 홈: 시간대 인사, 보유 간식/알림, 또또·쁘니 공간(탭 선택·문질러 쓰다듬기·말풍선),
  선택 동물의 5가지 상태(포만감/행복도/체력/청결도/친밀도), 빠른 행동 버튼
- 상호작용: 쓰다듬기(드래그+쿨다운+하트), 밥 주기, 간식 주기(동물별 적합 간식/하루 제한),
  재우기(실시간 체력 회복·수면 화면), 산책(또또)·놀이(쁘니) 타이머(1/3/5분·보상·간식 발견)
- 활동: 8종 행동 카드(선택 동물에 맞게 산책↔놀기 전환, 자는 중 비활성)
- 기록: 오늘의 기록, 최근 활동 로그, 또또/쁘니 친밀도 레벨, 연속 돌봄(3·7·14일 보상)
- 설정: 배경음/효과음/진동/알림 토글, 이름 변경, 데이터 초기화(확인 모달), 앱 정보
- 시간 경과 반영: 앱이 꺼져 있던 시간도 계산해 상태를 갱신(하한선이 있어 0이 되거나 아프지 않음)
