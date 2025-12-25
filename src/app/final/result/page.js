'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMyMatch, getParticipantByCode, getActiveEvent } from '@/lib/firestore';

export default function FinalResultPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [match, setMatch] = useState(null);
  const [matchedPerson, setMatchedPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadResult();
    }
  }, [user]);

  const loadResult = async () => {
    setLoading(true);
    try {
      const eventData = await getActiveEvent();
      setEvent(eventData);

      const myMatch = await getMyMatch(user.eventDate, user.eventCode);
      setMatch(myMatch);

      if (myMatch) {
        const partnerCode = myMatch.person1Code === user.eventCode 
          ? myMatch.person2Code 
          : myMatch.person1Code;
        const partner = await getParticipantByCode(user.eventDate, partnerCode);
        setMatchedPerson(partner);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canShowResults = (event?.currentRound || 0) >= 10;

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      router.push('/login');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  // 결과 대기 중
  if (!canShowResults) {
    return (
      <div className="container">
        <div className="nav-top">
          <div className="nav-left">
            <button className="back-button" onClick={() => router.back()}>←</button>
            <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>Main</a>
            <a href="#" onClick={(e) => { e.preventDefault(); router.push('/mypage'); }}>My Page</a>
            <a href="#" className="active">행사 참여</a>
          </div>
          <div className="nav-right">
            <button onClick={handleLogout}>Log Out</button>
          </div>
        </div>

        <div className="header">
          <div className="logo" onClick={() => router.push('/')}>The Shortlist</div>
        </div>

        <div className="card">
          <div className="waiting-state">
            <div className="waiting-icon">⏳</div>
            <div className="waiting-title">결과 집계 중입니다</div>
            <div className="waiting-text">
              호스트가 결과를 공개하면<br />
              이 페이지에서 확인할 수 있어요.
            </div>
          </div>
        </div>

        <button onClick={() => router.push('/')} className="btn btn-secondary">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // 매칭 성사 + 연락처 공개
  if (match && matchedPerson) {
    const partnerConsent = match.person1Code === user.eventCode ? match.person2Consent : match.person1Consent;

    if (partnerConsent) {
      return (
        <div className="container">
          <div className="header">
            <div className="logo" onClick={() => router.push('/')}>The Shortlist</div>
          </div>

          <div className="card">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>💞</div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>축하합니다!</h2>
              <div style={{ fontSize: '16px', color: '#333', marginBottom: '30px' }}>
                당신이 선택하신 <strong>{matchedPerson.eventCode}</strong> 분과 매칭되었습니다!
              </div>
              
              <div className="match-info">
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '15px' }}>
                  ✨ {matchedPerson.name}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '20px' }}>
                  📞 {matchedPerson.phone}
                </div>
                
                {matchedPerson.introduction && (
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontStyle: 'italic', color: '#333' }}>
                    "💭 {matchedPerson.introduction}"
                  </div>
                )}
                
                <div style={{ marginBottom: '10px' }}>🎂 {matchedPerson.birthYear}년생</div>
                <div style={{ marginBottom: '10px' }}>💼 {matchedPerson.job}</div>
                {matchedPerson.greenFlag && (
                  <div style={{ marginBottom: '10px' }}>💚 {matchedPerson.greenFlag}</div>
                )}
                {matchedPerson.redFlag && (
                  <div style={{ marginBottom: '10px' }}>🚫 {matchedPerson.redFlag}</div>
                )}
              </div>
              
              <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#333' }}>
                어려운 기회인 만큼 진심으로 축하드립니다.<br />
                두 분의 이야기가 아름답게 이어지길 바랍니다.
              </div>
            </div>
          </div>

          <button onClick={() => router.push('/')} className="btn btn-secondary">
            홈으로 돌아가기
          </button>
        </div>
      );
    } else {
      // 매칭 성사 + 연락처 미공개
      return (
        <div className="container">
          <div className="header">
            <div className="logo" onClick={() => router.push('/')}>The Shortlist</div>
          </div>

          <div className="card">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>💝</div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>매칭 성사!</h2>
              <div style={{ fontSize: '16px', color: '#333', marginBottom: '30px' }}>
                당신이 선택하신 <strong>{matchedPerson.eventCode}</strong> 분과 매칭이 되었습니다.<br />
                어려운 기회인 만큼 진심으로 축하드립니다.
              </div>
              
              <div className="highlight-box" style={{ marginBottom: '30px', textAlign: 'left' }}>
                상대방께서 먼저 직접 연락을 드리고 싶어하십니다.<br /><br />
                운영진을 통해 조금만 기다려 주시면,<br />
                곧 좋은 소식을 전해드리겠습니다.
              </div>
              
              <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#333' }}>
                두 분의 이야기가 아름답게 시작되길 바랍니다.<br />
                설레는 만남을 진심으로 응원합니다.
              </div>
              
              <div style={{ marginTop: '30px' }}>
                <a 
                  href="https://www.instagram.com/theshortlist.seoul/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'inline-block' }}
                >
                  Instagram 문의하기
                </a>
              </div>
            </div>
          </div>

          <button onClick={() => router.push('/')} className="btn btn-secondary">
            홈으로 돌아가기
          </button>
        </div>
      );
    }
  }

  // 매칭 실패
  return (
    <div className="container">
      <div className="header">
        <div className="logo" onClick={() => router.push('/')}>The Shortlist</div>
      </div>

      <div className="card">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>✨</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>아쉽지만, 괜찮아요</h2>
          
          <div className="highlight-box" style={{ margin: '30px 0' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '15px' }}>
              당신은 충분히 매력적입니다
            </div>
            <div style={{ fontSize: '15px', color: '#555' }}>
              당신을 마음에 둔 분들이 분명 있었어요.
            </div>
          </div>
          
          <div className="info-box" style={{ marginBottom: '30px', textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '5px' }}>
              💡 Tip: 뒤풀이에 참석하신다면,
            </div>
            <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
              당신을 선택한 분들과 자연스럽게 더 이야기할 수 있는 기회가 있습니다.
            </div>
          </div>
          
          <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#333', marginBottom: '30px' }}>
            The Shortlist는 진정성 있는 만남을 추구하기 때문에<br />
            한 분만 선택하는 원칙을 고수합니다.
          </div>
          
          <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#333' }}>
            다음 기회에 꼭 다시 만나요.<br />
            당신의 특별한 인연을 언제나 응원합니다.
          </div>
        </div>
      </div>

      <button onClick={() => router.push('/')} className="btn btn-secondary">
        홈으로 돌아가기
      </button>
    </div>
  );
}
