'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvent } from '@/hooks/useEvent';

const ROUND_INFO = {
  0: { session: '-', description: '행사 시작전', type: 'wait' },
  1: { session: 1, description: '세션 1 선택', type: 'select' },
  2: { session: 1, description: '세션 1 결과', type: 'result' },
  3: { session: 2, description: '세션 2 선택', type: 'select' },
  4: { session: 2, description: '세션 2 결과', type: 'result' },
  5: { session: 3, description: '세션 3 선택', type: 'select' },
  6: { session: 3, description: '세션 3 결과', type: 'result' },
  7: { session: 4, description: '세션 4 선택', type: 'select' },
  8: { session: 4, description: '세션 4 결과', type: 'result' },
  9: { session: 5, description: '최종 선택', type: 'final-select' },
  10: { session: 5, description: '최종 결과', type: 'final-result' },
};

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { event, loading: eventLoading } = useEvent(user?.eventDate);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || eventLoading) {
    return (
      <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  const currentRound = event?.currentRound || 0;
  const roundInfo = ROUND_INFO[currentRound] || ROUND_INFO[0];

  const formatDate = (dateStr) => {
    if (!dateStr) return '날짜 미정';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${month}월 ${day}일 ${weekday}요일`;
  };

  const handleParticipate = () => {
    if (currentRound === 0) {
      alert('행사 시작 전입니다. Session 1 시작 후부터 참여 가능합니다.');
      return;
    }

    if (roundInfo.type === 'select') {
      router.push(`/session/${roundInfo.session}/select`);
    } else if (roundInfo.type === 'result') {
      router.push(`/session/${roundInfo.session}/result`);
    } else if (roundInfo.type === 'final-select') {
      router.push('/final/select');
    } else if (roundInfo.type === 'final-result') {
      router.push('/final/result');
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      router.push('/login');
    }
  };

  return (
    <div className="container">
      {/* Navigation */}
      <div className="nav-top">
        <div className="nav-left">
          <a href="#" className="active">Main</a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/mypage'); }}>My Page</a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/history'); }}>기록</a>
        </div>
        <div className="nav-right">
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {/* Header */}
      <div className="header">
        <div className="logo">The Shortlist</div>
        <div className="user-code">{user.eventCode}</div>
      </div>

      {/* Event Card */}
      <div className="card">
        <div className="welcome-message">
          {user.name}님 반갑습니다 🎉
        </div>
        
        <div className="event-date">{formatDate(user.eventDate)}</div>
        <div className="event-title">The Shortlist Wine Mixer</div>

        <div className="event-details">
          <div className="event-detail-item">
            <span className="icon">📍</span>
            <span>{event?.location || '장소 미정'}</span>
          </div>
          <div className="event-detail-item">
            <span className="icon">🕖</span>
            <span>7:00PM (6:30PM Doors Open)</span>
          </div>
          <div className="event-detail-item">
            <span className="icon">✨</span>
            <span>현재: {roundInfo.description}</span>
          </div>
        </div>

        {event?.openChatUrl && (
          <a 
            href={event.openChatUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ marginBottom: '10px', display: 'block' }}
          >
            💬 오픈채팅 참여
          </a>
        )}

        <button
          onClick={handleParticipate}
          className={`btn ${currentRound === 0 ? 'btn-disabled' : 'btn-primary'}`}
          style={{ cursor: currentRound === 0 ? 'not-allowed' : 'pointer' }}
        >
          행사 참여하기
        </button>
      </div>

      {/* Instagram */}
      <div className="instagram-icon">
        <a href="https://www.instagram.com/theshortlist.seoul/" target="_blank" rel="noopener noreferrer">
          @theshortlist.seoul
        </a>
      </div>
    </div>
  );
}
