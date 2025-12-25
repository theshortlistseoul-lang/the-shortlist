import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// ============ Events ============
export async function getActiveEvent() {
  // settings 컬렉션 없이 직접 events에서 active 이벤트 찾기
  const eventsSnapshot = await getDocs(collection(db, 'events'));
  const activeEvent = eventsSnapshot.docs.find(d => d.data().status === 'active');
  
  if (activeEvent) {
    return { id: activeEvent.id, ...activeEvent.data() };
  }
  
  // active가 없으면 가장 최근 이벤트 반환
  const events = eventsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  if (events.length > 0) {
    return events.sort((a, b) => b.date?.localeCompare(a.date))[0];
  }
  
  return null;
}

// 모든 이벤트 가져오기 (호스트용)
export async function getAllEvents() {
  const eventsSnapshot = await getDocs(collection(db, 'events'));
  const events = eventsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return events.sort((a, b) => b.date?.localeCompare(a.date)); // 최신순
}

// 특정 날짜 이벤트 가져오기
export async function getEventByDate(eventDate) {
  const docSnap = await getDoc(doc(db, 'events', eventDate));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export function subscribeToEvent(eventDate, callback) {
  return onSnapshot(doc(db, 'events', eventDate), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
}

export async function updateEventRound(eventDate, round) {
  const session = Math.ceil(round / 2);
  await updateDoc(doc(db, 'events', eventDate), {
    currentRound: round,
    currentSession: session,
    updatedAt: serverTimestamp(),
  });
}

// ============ Participants ============
export async function loginParticipant(name, phone) {
  const normalizedPhone = phone.replace(/-/g, '');
  const q = query(
    collection(db, 'participants'),
    where('name', '==', name),
    where('phone', '==', normalizedPhone)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const participant = snapshot.docs[0];
  return { id: participant.id, ...participant.data() };
}

export async function getParticipant(participantId) {
  const docSnap = await getDoc(doc(db, 'participants', participantId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function updateParticipantProfile(participantId, data) {
  await updateDoc(doc(db, 'participants', participantId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// updateParticipantInfo - mypage에서 사용
export async function updateParticipantInfo(eventDate, participantId, data) {
  await updateDoc(doc(db, 'participants', participantId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// getAllSelections - host에서 사용
export async function getAllSelections(eventDate) {
  const q = query(
    collection(db, 'selections'),
    where('eventDate', '==', eventDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// getAllParticipants - host에서 사용  
export async function getAllParticipants(eventDate) {
  const q = query(
    collection(db, 'participants'),
    where('eventDate', '==', eventDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// getParticipantByCode - final result에서 사용
export async function getParticipantByCode(eventDate, eventCode) {
  const q = query(
    collection(db, 'participants'),
    where('eventDate', '==', eventDate),
    where('eventCode', '==', eventCode)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function getParticipantsByEvent(eventDate) {
  const q = query(
    collection(db, 'participants'),
    where('eventDate', '==', eventDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getOppositeGenderParticipants(eventDate, gender) {
  const oppositeGender = gender === 'M' ? 'W' : 'M';
  const q = query(
    collection(db, 'participants'),
    where('eventDate', '==', eventDate),
    where('gender', '==', oppositeGender)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============ Selections (Session 1-4) ============
export async function submitSelection(eventDate, selectorCode, sessionNumber, firstChoice, secondChoice = null) {
  const docId = `${eventDate}_${selectorCode}_${sessionNumber}`;
  
  // 이미 제출했는지 확인
  const existing = await getDoc(doc(db, 'selections', docId));
  if (existing.exists()) {
    throw new Error('이미 제출했습니다.');
  }
  
  await setDoc(doc(db, 'selections', docId), {
    eventDate,
    selectorCode,
    sessionNumber,
    firstChoice, // { code: 'W3', requestedInfo: 'birthYear' }
    secondChoice, // { code: 'W5', requestedInfo: 'job' } or null
    submittedAt: serverTimestamp(),
  });
}

export async function getMySelections(eventDate, selectorCode) {
  const q = query(
    collection(db, 'selections'),
    where('eventDate', '==', eventDate),
    where('selectorCode', '==', selectorCode)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getSelectionsForMe(eventDate, myCode, sessionNumber) {
  // 나를 선택한 사람들 찾기
  const q = query(
    collection(db, 'selections'),
    where('eventDate', '==', eventDate),
    where('sessionNumber', '==', sessionNumber)
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(sel => 
      sel.firstChoice?.code === myCode || sel.secondChoice?.code === myCode
    );
}

export async function hasSubmittedSelection(eventDate, selectorCode, sessionNumber) {
  const docId = `${eventDate}_${selectorCode}_${sessionNumber}`;
  const docSnap = await getDoc(doc(db, 'selections', docId));
  return docSnap.exists();
}

// ============ Final Selections (Session 5) ============
export async function submitFinalSelection(eventDate, selectorCode, firstChoice, secondChoice = null, consentToShare = false) {
  const docId = `${eventDate}_${selectorCode}`;
  
  const existing = await getDoc(doc(db, 'finalSelections', docId));
  if (existing.exists()) {
    throw new Error('이미 최종 선택을 제출했습니다.');
  }
  
  await setDoc(doc(db, 'finalSelections', docId), {
    eventDate,
    selectorCode,
    firstChoice,
    secondChoice,
    consentToShare,
    submittedAt: serverTimestamp(),
  });
}

export async function getMyFinalSelection(eventDate, selectorCode) {
  const docId = `${eventDate}_${selectorCode}`;
  const docSnap = await getDoc(doc(db, 'finalSelections', docId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function getAllFinalSelections(eventDate) {
  const q = query(
    collection(db, 'finalSelections'),
    where('eventDate', '==', eventDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function hasSubmittedFinalSelection(eventDate, selectorCode) {
  const docId = `${eventDate}_${selectorCode}`;
  const docSnap = await getDoc(doc(db, 'finalSelections', docId));
  return docSnap.exists();
}

// ============ Matches ============
export async function getMyMatch(eventDate, myCode) {
  const q = query(
    collection(db, 'matches'),
    where('eventDate', '==', eventDate)
  );
  const snapshot = await getDocs(q);
  
  const match = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .find(m => m.person1Code === myCode || m.person2Code === myCode);
  
  return match || null;
}

export async function createMatch(eventDate, person1Code, person2Code, matchType, person1Consent, person2Consent) {
  const docId = `${eventDate}_${person1Code}_${person2Code}`;
  await setDoc(doc(db, 'matches', docId), {
    eventDate,
    person1Code,
    person2Code,
    matchType,
    person1Consent,
    person2Consent,
    createdAt: serverTimestamp(),
  });
}

// ============ 매칭 알고리즘 ============
export async function calculateMatches(eventDate) {
  const finalSelections = await getAllFinalSelections(eventDate);
  const participants = await getParticipantsByEvent(eventDate);
  
  // 선택 데이터를 맵으로 변환
  const selectionMap = {};
  finalSelections.forEach(sel => {
    selectionMap[sel.selectorCode] = {
      first: sel.firstChoice,
      second: sel.secondChoice,
      consent: sel.consentToShare,
    };
  });
  
  const matched = new Set();
  const matches = [];
  
  // 1단계: Double 1 (1↔1 상호 1순위)
  for (const sel of finalSelections) {
    if (matched.has(sel.selectorCode)) continue;
    
    const myFirst = sel.firstChoice;
    const theirSelection = selectionMap[myFirst];
    
    if (theirSelection && theirSelection.first === sel.selectorCode) {
      matches.push({
        person1Code: sel.selectorCode,
        person2Code: myFirst,
        matchType: 'double1',
        person1Consent: sel.consentToShare,
        person2Consent: theirSelection.consent,
      });
      matched.add(sel.selectorCode);
      matched.add(myFirst);
    }
  }
  
  // 2단계: Preference Rule (1↔2 충돌 해결)
  for (const sel of finalSelections) {
    if (matched.has(sel.selectorCode)) continue;
    
    const myFirst = sel.firstChoice;
    if (matched.has(myFirst)) continue;
    
    const theirSelection = selectionMap[myFirst];
    if (!theirSelection) continue;
    
    // 상대가 나를 1순위 또는 2순위로 선택했는지 확인
    if (theirSelection.first === sel.selectorCode || theirSelection.second === sel.selectorCode) {
      // 상대의 1순위가 나인 경우 매칭
      if (theirSelection.first === sel.selectorCode) {
        matches.push({
          person1Code: sel.selectorCode,
          person2Code: myFirst,
          matchType: 'preference',
          person1Consent: sel.consentToShare,
          person2Consent: theirSelection.consent,
        });
        matched.add(sel.selectorCode);
        matched.add(myFirst);
      }
    }
  }
  
  // 3단계: Mutual 2nd (2↔2 상호 2순위)
  for (const sel of finalSelections) {
    if (matched.has(sel.selectorCode)) continue;
    if (!sel.secondChoice) continue;
    
    const mySecond = sel.secondChoice;
    if (matched.has(mySecond)) continue;
    
    const theirSelection = selectionMap[mySecond];
    if (theirSelection && theirSelection.second === sel.selectorCode) {
      matches.push({
        person1Code: sel.selectorCode,
        person2Code: mySecond,
        matchType: 'mutual2nd',
        person1Consent: sel.consentToShare,
        person2Consent: theirSelection.consent,
      });
      matched.add(sel.selectorCode);
      matched.add(mySecond);
    }
  }
  
  // Firestore에 매칭 결과 저장
  for (const match of matches) {
    await createMatch(
      eventDate,
      match.person1Code,
      match.person2Code,
      match.matchType,
      match.person1Consent,
      match.person2Consent
    );
  }
  
  // 미매칭자 선택 횟수 계산
  const unmatchedStats = {};
  participants.forEach(p => {
    if (!matched.has(p.eventCode)) {
      unmatchedStats[p.eventCode] = { code: p.eventCode, selectedByCount: 0 };
    }
  });
  
  finalSelections.forEach(sel => {
    if (unmatchedStats[sel.firstChoice]) {
      unmatchedStats[sel.firstChoice].selectedByCount++;
    }
    if (sel.secondChoice && unmatchedStats[sel.secondChoice]) {
      unmatchedStats[sel.secondChoice].selectedByCount++;
    }
  });
  
  return {
    matches,
    unmatched: Object.values(unmatchedStats),
  };
}

// ============ Submission Status ============
export async function getSubmissionStatus(eventDate, sessionNumber) {
  const participants = await getParticipantsByEvent(eventDate);
  const status = {};
  
  if (sessionNumber <= 4) {
    // 일반 세션
    for (const p of participants) {
      const submitted = await hasSubmittedSelection(eventDate, p.eventCode, sessionNumber);
      status[p.eventCode] = submitted;
    }
  } else {
    // 최종 세션
    for (const p of participants) {
      const submitted = await hasSubmittedFinalSelection(eventDate, p.eventCode);
      status[p.eventCode] = submitted;
    }
  }
  
  return status;
}