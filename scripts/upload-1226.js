/**
 * 2025-12-26 이벤트 데이터 Firebase 업로드 스크립트
 * 
 * 사용법: node scripts/upload-1226.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc } = require('firebase/firestore');

// Firebase 설정 (Vercel 환경변수와 동일)
const firebaseConfig = {
  apiKey: "AIzaSyAhsVLJWOH2GpHyGQs2HnBxbJEFwVNQ-bc",
  authDomain: "the-shortlist-997ee.firebaseapp.com",
  projectId: "the-shortlist-997ee",
  storageBucket: "the-shortlist-997ee.firebasestorage.app",
  messagingSenderId: "1072aborting98teleran0",
  appId: "1:1072145980790:web:4ab3a17c3db4a5d83c0dc0"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 이벤트 데이터
const eventData = {
  date: "2025-12-26",
  title: "The Shortlist Wine Mixer",
  location: "장소 미정",
  openChatUrl: "",
  currentRound: 0,
  currentSession: 0,
  status: "active",
  ageRange: "95-01"
};

// 참가자 데이터
const participants = [
  {"name": "이예진", "gender": "W", "birthYear": 1998, "phone": "01065175225", "email": "yiyejin1@gmail.com", "job": "전략컨설턴트 / 베인앤드컴퍼니", "introduction": "겉은 조용해도 속은 따뜻함으로 가득 찬, 작은 감동도 소중히 여기는 사람입니다.", "flirtingSecret": "저한테 호감 있으시면 쉬는 시간에 제 앞을 지나갈 때 속닥속닥 '파이팅'이라고 해주세요.", "greenFlag": "매너가 몸에 배어있는 사람", "redFlag": "과도한 음주 흡연", "eventCode": "W1", "eventDate": "2025-12-26"},
  {"name": "김혜성", "gender": "W", "birthYear": 1997, "phone": "01037419561", "email": "hs970218@gmail.com", "job": "서울대학교 대학원생 / AI분야", "introduction": "호기심 많은 재밌는 사람", "flirtingSecret": "저는 mbti 박사에요.", "greenFlag": "자기일을 잘하는 사람", "redFlag": "주위 사람에게 무례한 사람", "eventCode": "W2", "eventDate": "2025-12-26"},
  {"name": "황수경", "gender": "W", "birthYear": 1998, "phone": "01025513088", "email": "marion0122@naver.com", "job": "공정엔지니어 / 삼성전자", "introduction": "저는 다소 단순해요!", "flirtingSecret": "이번 겨울에 방어같이 드실 분을 찾습니다!", "greenFlag": "본인 일을 좋아하시는 분 좋아요", "redFlag": "흡연", "eventCode": "W3", "eventDate": "2025-12-26"},
  {"name": "강석희", "gender": "W", "birthYear": 1997, "phone": "01097010254", "email": "seokheekang@naver.com", "job": "공정엔지니어/지씨셀", "introduction": "하얗고 순둥 순둥 말티즈", "flirtingSecret": "눈을 맞추고 미소 짓기", "greenFlag": "선하고 다정한 사람", "redFlag": "흡연, 무존중, 알코올 중독", "eventCode": "W4", "eventDate": "2025-12-26"},
  {"name": "김유진", "gender": "W", "birthYear": 1999, "phone": "01083892201", "email": "06kimk@gmail.com", "job": "마케터 / 몽클레르 코리아", "introduction": "저는 외국계 패션회사에서 광고, 홍보 업무를 하고 있는 김유진입니다!", "flirtingSecret": "속눈썹이 긴 편이에요", "greenFlag": "E성향의 자신감 있는 모습", "redFlag": "욱하는 성격", "eventCode": "W5", "eventDate": "2025-12-26"},
  {"name": "황지원", "gender": "W", "birthYear": 1997, "phone": "01045754977", "email": "wldnjs1170@gmail.com", "job": "연구원/애경케미칼", "introduction": "저는 영화와 강아지를 좋아하는 estp에요", "flirtingSecret": "저는 겨울에 메종마르지엘라 by the fireplace 라는 향수를 써요.", "greenFlag": "긍정적이고 적극적인 사람", "redFlag": "흡연", "eventCode": "W6", "eventDate": "2025-12-26"},
  {"name": "김솔해", "gender": "W", "birthYear": 1997, "phone": "01045749463", "email": "rlathfgo@naver.com", "job": "데이터분석가/g마켓", "introduction": "리액션 왕", "flirtingSecret": "제가 마음에 드시면 저를 쳐다보며 턱을 괴어 주세요", "greenFlag": "책임감 있는 모습", "redFlag": "흡연", "eventCode": "W7", "eventDate": "2025-12-26"},
  {"name": "지정민", "gender": "W", "birthYear": 1995, "phone": "01099771866", "email": "janeji0504@gmail.com", "job": "연구원/한국생산성본부", "introduction": "무던하지만 도전을 좋아하는 호기심이 많은 사람입니다!", "flirtingSecret": "작은 식물을 키우고 있어요!", "greenFlag": "타인에게 선의을 베푸는 따뜻한 모습", "redFlag": "욕설", "eventCode": "W8", "eventDate": "2025-12-26"},
  {"name": "김은지", "gender": "W", "birthYear": 2001, "phone": "01092107192", "email": "kb083145@naver.com", "job": "연구조교/고려대학교 대학원", "introduction": "차분한 에너지로 편안한 분위기를 만드는 사람", "flirtingSecret": "제가 마음에 드시면 쉬는 시간에 핸드크림을 찾아주세요", "greenFlag": "편하고 다정한 사람", "redFlag": "주위 사람에게 무례한사람", "eventCode": "W9", "eventDate": "2025-12-26"},
  {"name": "구재윤", "gender": "W", "birthYear": 1999, "phone": "01042656675", "email": "jykoo8865@gmail.com", "job": "인사팀 / 한화생명", "introduction": "항상 해맑고 긍정적인 편이라 작은 일에도 잘 웃고, 어떤 상황에서도 좋은 면을 찾으려고 해요.", "flirtingSecret": "싱가포르를 오래 살다와서 저에게 싱가포르 생활에 대해서 물어봐주세요!", "greenFlag": "대화가 재밌는 사람, 여러 분야에 관심이 있는 사람", "redFlag": "사람을 차별하거나 무시하는 태도", "eventCode": "W10", "eventDate": "2025-12-26"},
  {"name": "이우찬", "gender": "M", "birthYear": 1996, "phone": "01043423494", "email": "uclee96@gmail.com", "job": "회사원/한국토지신탁", "introduction": "자유로운 영혼이 되고 싶었던 사람입니다.", "flirtingSecret": "저는 스물다섯살까지 모솔이었습니다.", "greenFlag": "진실된 사람", "redFlag": "흡연", "eventCode": "M1", "eventDate": "2025-12-26"},
  {"name": "변홍균", "gender": "M", "birthYear": 1995, "phone": "01088638656", "email": "bhg8656@gmail.com", "job": "신재생에너지투자/HRE", "introduction": "함께 있으면 편안함을 주는 사람입니다.", "flirtingSecret": "제가 마음에 드시면 안경에 대해 물어봐주세요!", "greenFlag": "경험 밖의 세상을 궁금해 하는 사람", "redFlag": "매사 부정적인 사람", "eventCode": "M2", "eventDate": "2025-12-26"},
  {"name": "이형근", "gender": "M", "birthYear": 1996, "phone": "01053759508", "email": "gomdori19@naver.com", "job": "기업금융/미쓰이스미토모은행", "introduction": "외국인", "flirtingSecret": "제일 좋아하는 음식은 햄버거", "greenFlag": "열정적인 사람", "redFlag": "예의없는 사람", "eventCode": "M3", "eventDate": "2025-12-26"},
  {"name": "강운혁", "gender": "M", "birthYear": 1996, "phone": "01025431625", "email": "beloropy@gmail.com", "job": "개발자 / 핀다", "introduction": "산책 좋아하는 흰 강아지", "flirtingSecret": "스트릿 문화 되게 좋아합니다", "greenFlag": "눈 안 보이는 웃음", "redFlag": "냉소적인 모습", "eventCode": "M4", "eventDate": "2025-12-26"},
  {"name": "김무환", "gender": "M", "birthYear": 1996, "phone": "01094973406", "email": "dodge1085@gmail.com", "job": "금융업", "introduction": "조용한 까불이 입니다.", "flirtingSecret": "현재 이직중이며(이에 회사명은 미작성) 4곳중 2곳에서 오퍼 받았습니다.", "greenFlag": "심성이 착한 사람", "redFlag": "무례한 사람", "eventCode": "M5", "eventDate": "2025-12-26"},
  {"name": "최재형", "gender": "M", "birthYear": 1995, "phone": "01021698652", "email": "chlwogud2304@gmail.com", "job": "AI 개발자 / AICESS", "introduction": "섬세하지만 예민하지는 않고, 사랑도 줄수있고 받을줄 아는 차분한 사람입니다.", "flirtingSecret": "싱가폴에 오래 살았어서 가끔 싱가폴 음식이 땡겨요. 같이 먹으러 가자고 해주세요", "greenFlag": "활발하고 긍정적인사람", "redFlag": "흡연", "eventCode": "M6", "eventDate": "2025-12-26"},
  {"name": "주홍영", "gender": "M", "birthYear": 1996, "phone": "01084060605", "email": "joogoon@snu.ac.kr", "job": "게임PD / 5민랩", "introduction": "잘 웃고, 잘 듣는 사람입니다", "flirtingSecret": "최근에 헤세의 싯다르타를 감명 깊게 읽었습니다", "greenFlag": "친절한 사람, 자기관리 잘하는 사람", "redFlag": "무례한 사람", "eventCode": "M7", "eventDate": "2025-12-26"},
  {"name": "김희승", "gender": "M", "birthYear": 1992, "phone": "01022274499", "email": "khs300kr@naver.com", "job": "프로그래머/크래프톤", "introduction": "평범한데 은근히 중독되는 스타일이에요", "flirtingSecret": "제가 마음에 드시면 혹시 피곤하냐고 물어봐주세요", "greenFlag": "배려심과 책임감", "redFlag": "흡연과 나쁜 술 버릇", "eventCode": "M8", "eventDate": "2025-12-26"},
  {"name": "김민수", "gender": "M", "birthYear": 1997, "phone": "01097877509", "email": "kmsoo97@naver.com", "job": "공사관리 / gs건설", "introduction": "낫밷입니다", "flirtingSecret": "해산물", "greenFlag": "매사에 똑똑한 모습", "redFlag": "눈치 없는 사람", "eventCode": "M9", "eventDate": "2025-12-26"},
  {"name": "김승훈", "gender": "M", "birthYear": 1994, "phone": "01098540324", "email": "kiriti0324@naver.com", "job": "Security engineer / 토스증권", "introduction": "같이 있으면 심심하진 않은 사람", "flirtingSecret": "다음에 이자카야 가실래요?", "greenFlag": "첫눈에 가려지는 편입니다", "redFlag": "흡연과 문신", "eventCode": "M10", "eventDate": "2025-12-26"}
];

async function uploadData() {
  try {
    console.log('🚀 Firebase 업로드 시작...\n');

    // 1. 이벤트 추가
    console.log('📅 이벤트 추가 중...');
    await setDoc(doc(db, 'events', '2025-12-26'), eventData);
    console.log('✅ 이벤트 추가 완료: 2025-12-26\n');

    // 2. 참가자 추가
    console.log('👥 참가자 추가 중...');
    for (const p of participants) {
      await addDoc(collection(db, 'participants'), {
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`  ✅ ${p.eventCode} ${p.name} 추가 완료`);
    }

    console.log('\n🎉 모든 데이터 업로드 완료!');
    console.log(`   - 이벤트: 2025-12-26`);
    console.log(`   - 참가자: ${participants.length}명 (여${participants.filter(p=>p.gender==='W').length}, 남${participants.filter(p=>p.gender==='M').length})`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 업로드 실패:', error);
    process.exit(1);
  }
}

uploadData();
