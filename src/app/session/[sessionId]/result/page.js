'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  getMySelections, 
  getOppositeGenderParticipants,
  getActiveEvent
} from '@/lib/firestore';

const INFO_LABELS = {
  birthYear: { label: '태어난 연도', emoji: '🎂' },
  job: { label: '직업/회사', emoji: '💼' },
  flirtingSecret: { label: '플러팅용 비밀', emoji: '🤫' },
  greenFlag: { label: 'Green Flag', emoji: '💚' },
  redFlag: { label: 'Red Flag', emoji: '🚩' },
};

export default function SessionResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = parseInt(params.sessionId);
  
  const { user, loading: authLoading, logout } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [mySelection, setMySelection] = useState(null);
  const [participantDetails, setParticipantDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const resultRound = sessionId * 2;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadResults();
    }
  }, [user, sessionId]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const eventData = await getActiveEvent();
      setEvent(eventData);

      const mySelections = await getMySelections(user.eventDate, user.eventCode);
      const sessionSelection = mySelections.find(s => s.sessionNumber === sessionId);
      setMySelection(sessionSelection);

      const participants = await getOppositeGenderParticipants(user.eventDate, user.gender);
      const details = {};
      participants.forEach(p => {
        details[p.eventCode] = p;
      });
      setParticipantDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canShowResults = (event?.currentRound || 0) >= resultRound;

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

  if (!mySelection) {
    return (
      <div className="container">
        <div className="header">
          <div className="logo">The Shortlist</div>
        </div>
        <div className="card">
          <div className="result-message">
            <div className="result-icon">❓</div>
            <div className="result-title">선택 기록이 없습니다</div>
            <div className="result-text">세션 {sessionId}에서 선택을 제출하지 않았습니다.</div>
          </div>
          <button onClick={() => router.push('/')} className="btn btn-secondary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 결과 대기 중
  if (!canShowResults) {
    return (
      <div className="container">
        {/* Navigation */}
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

        {/* Session Tabs */}
        <div className="session-tabs">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => router.push(`/session/${s}/result`)}
              className={`session-tab ${s === sessionId ? 'active' : ''}`}
            >
              세션 {s}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="waiting-state">
            <div className="waiting-icon">⏳</div>
            <div className="waiting-title">선택이 제출되었습니다!</div>
            <div className="waiting-text">
              호스트가 결과 공개 시간이 되면<br />
              이 페이지에서 결과를 확인할 수 있어요.
            </div>
            <div className="highlight-box" style={{ marginTop: '20px' }}>
              💡 선택 완료: {mySelection.firstChoice?.code}
              {mySelection.secondChoice?.code ? `, ${mySelection.secondChoice.code}` : ''}
            </div>
          </div>
        </div>

        <button onClick={() => router.push('/')} className="btn btn-secondary">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // 결과 공개
  const renderChoiceResult = (choice, rank) => {
    if (!choice) return null;
    
    const participant = participantDetails[choice.code];
    const infoMeta = INFO_LABELS[choice.requestedInfo];
    const value = participant?.[choice.requestedInfo];

    return (
      <div className="card" style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <span style={{
            width: '28px',
            height: '28px',
            background: rank === 1 ? 'var(--primary)' : '#999',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            marginRight: '12px'
          }}>
            {rank}
          </span>
          <span className="code">{choice.code}</span>
        </div>

        <div className="highlight-box">
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
            {infoMeta?.emoji} {infoMeta?.label}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '500' }}>
            {choice.requestedInfo === 'birthYear' ? `${value}년` : value || '-'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {/* Navigation */}
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

      {/* Session Tabs */}
      <div className="session-tabs">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/session/${s}/result`)}
            className={`session-tab ${s === sessionId ? 'active' : ''}`}
          >
            세션 {s}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>
          세션 {sessionId} 결과
        </h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          내 선택과 결과를 확인하세요
        </p>
      </div>

      {/* Results */}
      {renderChoiceResult(mySelection.firstChoice, 1)}
      {renderChoiceResult(mySelection.secondChoice, 2)}

      <button onClick={() => router.push('/')} className="btn btn-secondary">
        홈으로 돌아가기
      </button>
    </div>
  );
}
