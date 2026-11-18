# 두뇌 산책

할머니를 위한 두뇌 운동 앱입니다. 요일마다 바뀌는 놀이, 두뇌 체크, 물건 자리 도우미, 매일 알림이 들어 있어요.

## 앱 받기 (갤럭시)

1. 휴대폰에서 아래 주소를 열면 최신 앱 파일이 내려받아져요.
   `https://github.com/<아이디>/brainwalk/releases/latest/download/brainwalk.apk`
2. 내려받은 `brainwalk.apk` 를 누르고 **설치**를 눌러 주세요.
   처음 한 번은 "출처를 알 수 없는 앱" 설치를 허용해야 해요 (설정 화면이 자동으로 열려요).
3. 앱을 열고 첫 화면의 **매일 알림 켜기**를 눌러 알림을 허용해 주세요.
4. 알림이 늦게 오면: 설정 → 애플리케이션 → 두뇌 산책 → 배터리 → **제한 없음**

## 업데이트

`www/index.html` 을 고쳐서 main 브랜치에 올리면 GitHub Actions가 새 APK를 만들어 Releases에 올려요.
같은 주소에서 다시 내려받아 설치하면 기록은 그대로 두고 앱만 새로 바뀝니다.

## 구조

- `www/index.html` : 앱 화면 전체 (한 파일)
- `android/` : Capacitor 안드로이드 프로젝트
- 알림: `@capacitor/local-notifications`, 음성 안내: `@capacitor-community/text-to-speech`
