# The Shortlist 웹앱

초대 기반 로테이션 소개팅 행사를 위한 실시간 매칭 웹앱입니다.

## 🚀 Quick Start

### 1. 프로젝트 설치

```bash
cd the-shortlist
npm install
```

### 2. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
2. Firestore Database 생성 (아시아 리전 권장: `asia-northeast3`)
3. 프로젝트 설정 > 일반 > 웹 앱 추가
4. Firebase 설정값 복사

### 3. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 Firebase 설정값 입력:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. 초기 데이터 업로드

CSV 파일에서 참가자 데이터 변환:

```bash
node scripts/init-firebase.js ./data/participants.csv 2025-12-27 92-97
```

생성된 JSON 파일을 Firebase Console에서 Import하거나, 아래 수동 설정 진행.

### 5. Firestore 수동 설정

Firebase Console > Firestore에서 다음 컬렉션 생성:

#### `settings/config` 문서:
```json
{
  "activeEventDate": "2025-12-27",
  "adminEmail": "theshortlist.seoul@gmail.com",
  "smsSender": "01044161889"
}
```

#### `events/2025-12-27` 문서:
```json
{
  "date": "2025-12-27",
  "ageRange": "92-97",
  "place": "서울 강남구 대치동 900-18 지하1층",
  "currentRound": 0,
  "currentSession": 0,
  "status": "pending",
  "openChatUrl": "https://open.kakao.com/o/g8aNVy6h"
}
```

#### `participants` 컬렉션:
각 참가자별로 문서 생성 (scripts 출력 JSON 참고)

### 6. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

### 7. 배포

#### Vercel (권장)
```bash
npm install -g vercel
vercel
```

#### 또는 Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 📱 화면 구조

### 참가자
- `/login` - 로그인 (이름 + 전화번호)
- `/` - 메인 대시보드
- `/mypage` - 프로필 관리
- `/session/[n]/select` - 세션 선택 (n=1~4)
- `/session/[n]/result` - 세션 결과
- `/final/select` - 최종 선택
- `/final/result` - 최종 결과
- `/history` - 선택 기록

### 호스트
- `/host` - 호스트 대시보드 (비밀번호: `shortlist2024`)

---

## 🔄 라운드 시스템

| Round | 화면 | 설명 |
|-------|------|------|
| 0 | 대기 | 행사 시작 전 |
| 1 | 세션 1 선택 | 2:2 대화 후 선택 |
| 2 | 세션 1 결과 | 결과 확인 |
| 3~8 | 세션 2~4 | 반복 |
| 9 | 최종 선택 | 최종 2명 선택 |
| 10 | 최종 결과 | 매칭 결과 |

---

## 💕 매칭 알고리즘

1. **Double 1**: 서로 1순위로 선택 → 매칭
2. **Preference Rule**: A→B(1순위), B→A(2순위) 충돌 시 B의 1순위 우선
3. **Mutual 2nd**: 서로 2순위로 선택 → 매칭

---

## 📁 프로젝트 구조

```
the-shortlist/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.js          # 메인 페이지
│   │   ├── login/           # 로그인
│   │   ├── mypage/          # 프로필
│   │   ├── session/         # 세션 선택/결과
│   │   ├── final/           # 최종 선택/결과
│   │   ├── history/         # 선택 기록
│   │   └── host/            # 호스트 대시보드
│   ├── lib/
│   │   ├── firebase.js      # Firebase 설정
│   │   └── firestore.js     # Firestore 함수
│   └── hooks/
│       ├── useAuth.js       # 인증 Context
│       └── useEvent.js      # 실시간 이벤트 구독
├── scripts/
│   └── init-firebase.js     # 초기 데이터 생성
├── firestore.rules          # Firestore 보안 규칙
└── .env.example             # 환경변수 예시
```

---

## ⚠️ 주의사항

1. **호스트 비밀번호**: 실 서비스에서는 Firebase Auth로 변경 권장
2. **보안 규칙**: `firestore.rules` 파일을 Firebase에 배포
3. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용
4. **백업**: 행사 전 Firestore 데이터 백업 권장

---

## 🔧 트러블슈팅

### Firebase 연결 오류
- `.env.local` 파일의 Firebase 설정값 확인
- Firebase Console에서 웹 앱이 등록되어 있는지 확인

### 로그인 안 됨
- `participants` 컬렉션에 해당 참가자 데이터가 있는지 확인
- 이름과 전화번호가 정확히 일치하는지 확인 (전화번호는 하이픈 제거)

### 라운드 변경이 안 됨
- `events/{날짜}` 문서가 존재하는지 확인
- `settings/config`의 `activeEventDate`가 올바른지 확인

---

## 📞 문의

기술 지원: theshortlist.seoul@gmail.com
