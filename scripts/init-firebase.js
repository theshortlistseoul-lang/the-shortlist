/**
 * Firebase 초기 데이터 설정 스크립트
 * 
 * 사용법:
 * 1. Firebase Console에서 프로젝트 생성
 * 2. .env.local 파일에 Firebase 설정 입력
 * 3. 이 스크립트를 Node.js로 실행: node scripts/init-firebase.js
 */

const fs = require('fs');
const path = require('path');

// CSV 파싱 함수
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // CSV 파싱 (쉼표가 포함된 필드 처리)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    data.push(row);
  }
  
  return data;
}

// 참가자 데이터 변환
function transformParticipant(row, eventDate, index) {
  const gender = row['성별'] === '여성' ? 'W' : 'M';
  const eventCode = `${gender}${index + 1}`;
  
  return {
    eventDate,
    eventCode,
    name: row['이름'],
    gender,
    birthYear: parseInt(row['태어난 연도']) || null,
    phone: row['휴대폰 번호 (예: 01012345678)']?.replace(/-/g, ''),
    email: row['이메일 주소 (예:abc@gmail.com)'],
    job: row['직업/회사명'],
    acquaintanceType: row['지인 유형'],
    linkedIn: row['본인 확인용 링크 (LinkedIn/리멤버/Instagram 아이디 등)'],
    referrerCode: row['추천인 코드 (없다면 알게된 경로를 알려주세요)'],
    referrer: row['추천인'],
    referrerRelation: row['추천인과의 관계'],
    introduction: row['본인을 한 문장으로 소개해 주세요. '] || row['본인을 한 문장으로 소개해 주세요.'],
    flirtingSecret: row['플러팅용 비밀: 나에게 호감 있는 사람에게만 알려주고 싶은 비밀 한 가지'],
    greenFlag: row['Green Flag: 나를 반하게 하는 이성의 모습 한 가지 (예: 호기심이 끊이지 않는 사람, 자기 일에 진심인 사람)'],
    redFlag: row['Red Flag: 내가 절대 허용할 수 없는 이성의 모습 한 가지 (예: 흡연, 주위 사람에게 무례한 사람)'],
    expectedRelationship: row['이번 The Shortlist에서 기대하는 관계를 알려주세요.'],
    preferredType: row['당신이 선호하는 사람은 어떤 사람인가요? (분위기, 성향, 대화 스타일 등)'],
    avoidType: row['당신이 피하고 싶은 사람(지인 등)이나 유형이 있다면 알려주세요.'],
    afterparty: row['행사 종료 후 뒷풀이 참석 의향'],
    paid: row['Paid?'] === 'O',
    attendance: false,
    consentToShare: row['(3) 매칭 성사 시 연락처 및 정보 제공 동의 (선택)']?.includes('동의') || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Firestore 초기 데이터 생성
function generateFirestoreData(csvPath, eventDate, ageRange) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  
  // 성별로 분리하여 인덱싱
  const males = rows.filter(r => r['성별'] === '남성');
  const females = rows.filter(r => r['성별'] === '여성');
  
  const participants = [
    ...males.map((r, i) => transformParticipant(r, eventDate, i)),
    ...females.map((r, i) => transformParticipant(r, eventDate, i)),
  ];
  
  // 이벤트 데이터
  const event = {
    date: eventDate,
    ageRange,
    place: '서울 강남구 대치동 900-18 지하1층',
    deadline: '2025-12-24',
    openChatUrl: 'https://open.kakao.com/o/g8aNVy6h',
    currentRound: 0,
    currentSession: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // 설정 데이터
  const settings = {
    adminEmail: 'theshortlist.seoul@gmail.com',
    bankAccount: '케이뱅크 100-125-290275 김연진',
  };
  
  return { participants, event, settings };
}

// 메인 실행
function main() {
  console.log('=== The Shortlist Firebase 초기화 데이터 생성 ===\n');
  
  // CSV 파일 경로 (실제 경로로 변경 필요)
  const csvPath = process.argv[2] || './data/participants.csv';
  const eventDate = process.argv[3] || '2025-12-27';
  const ageRange = process.argv[4] || '92-97';
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV 파일을 찾을 수 없습니다: ${csvPath}`);
    console.log('\n사용법: node scripts/init-firebase.js <csv파일경로> <행사날짜> <연령대>');
    console.log('예시: node scripts/init-firebase.js ./data/1227.csv 2025-12-27 92-97');
    return;
  }
  
  const data = generateFirestoreData(csvPath, eventDate, ageRange);
  
  console.log(`이벤트: ${eventDate} (${ageRange}년생)`);
  console.log(`참가자: ${data.participants.length}명`);
  console.log(`  - 남성: ${data.participants.filter(p => p.gender === 'M').length}명`);
  console.log(`  - 여성: ${data.participants.filter(p => p.gender === 'W').length}명`);
  
  // JSON 파일로 저장
  const outputDir = './scripts/output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, `participants_${eventDate}.json`),
    JSON.stringify(data.participants, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, `event_${eventDate}.json`),
    JSON.stringify(data.event, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'settings.json'),
    JSON.stringify(data.settings, null, 2)
  );
  
  console.log(`\n출력 파일이 ${outputDir}에 생성되었습니다.`);
  console.log('\n다음 단계:');
  console.log('1. Firebase Console에서 Firestore 데이터베이스 생성');
  console.log('2. 생성된 JSON 파일을 Firebase Console에서 Import 또는');
  console.log('3. Firebase Admin SDK로 데이터 업로드');
  
  // Firebase 콘솔에서 직접 사용할 수 있는 형식 출력
  console.log('\n=== Firestore 컬렉션 구조 ===');
  console.log('\nevents/' + eventDate + ':');
  console.log(JSON.stringify(data.event, null, 2));
  
  console.log('\nsettings/config:');
  console.log(JSON.stringify(data.settings, null, 2));
  
  console.log('\nparticipants/ (처음 3명 예시):');
  data.participants.slice(0, 3).forEach((p, i) => {
    console.log(`\n[${i + 1}] ${p.eventCode}:`);
    console.log(JSON.stringify(p, null, 2));
  });
}

main();
