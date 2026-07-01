# 캐릭터 이미지 넣는 곳

여기에 아래 파일명 그대로 이미지를 넣으면 코드 수정 없이 바로 반영됩니다.
파일이 없으면 앱은 자동으로 이모지 플레이스홀더를 보여주므로 화면이 깨지지 않습니다.

## 또또 (흰색 비숑 강아지)
- `toto-default.png`   기본
- `toto-happy.png`     기분 좋을 때 (모든 상태가 좋을 때)
- `toto-eating.png`    밥/간식 먹을 때
- `toto-sleeping.png`  잘 때
- `toto-walking.png`   산책할 때

## 쁘니 (치즈 고양이)
- `ppuni-default.png`   기본
- `ppuni-happy.png`     기분 좋을 때
- `ppuni-eating.png`    밥/간식 먹을 때
- `ppuni-sleeping.png`  잘 때
- `ppuni-playing.png`   놀 때

## 권장 사양
- 정사각형(예: 512×512), 배경 투명 PNG
- 파일 경로는 `lib/constants.ts` 의 `petImagePath()` 에서 관리합니다.
