'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMySelections, getMyFinalSelection, getActiveEvent } from '@/lib/firestore';

const INFO_LABELS = {
  birthYear: { label: '태어난 연도', emoji: '🎂' },
  job: { label: '직업/회사', emoji: '💼' },
  flirtingSecret: { label: '플러팅용 비밀', emoji: '🤫' },
  greenFlag: { label: 'Green Flag', emoji: '💚' },
  redFlag: { label: 'Red Flag', emoji: '🚩' },
};

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [selections, setSelections] = useState([]);
  const [finalSelection, setFinalSelection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [eventData, mySelections, myFinal] = await Promise.all([
        getActiveEvent(),
        getMySelections(user.eventDate, user.eventCode),
        getMyFinalSelection(user.eventDate, user.eventCode)
      ]);
      
      setEvent(eventData);
      const sorted = mySelections.sort((a, b) => a.sessionNumber - b.sessionNumber);
      setSelections(sorted);
      setFinalSelection(myFinal);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canShowSessionResult = (sessionNumber) => {
    const resultRound = sessionNumber * 2;
    return (event?.currentRound || 0) >= resultRound;
  };

  const canShowFinalResult = (event?.currentRound || 0) >= 10;

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

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      {/* Navigation */}
      <div className="nav-top">
        <div className="nav-left">
          <button className="back-button" onClick={() => router.back()}>←</button>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>Main</a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/mypage'); }}>My Page</a>
          <a href="#" className="active">기록</a>
        </div>
        <div className="nav-right">
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {/* Header */}
      <div className="header">
        <div className="logo" onClick={() => router.push('/')}>The Shortlist</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>
          내 선택 기록
        </h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          세션별 선택 내역을 확인하세요
        </p>
      </div>

      {/* 선택 기록 */}
      {selections.length === 0 && !finalSelection ? (
        <div className="card">
          <div className="waiting-state">
            <div className="waiting-icon">📝</div>
            <div className="waiting-title">아직 선택 기록이 없습니다</div>
          </div>
        </div>
      ) : (
        <div>
          {selections.map((sel) => {
            const canShowResult = canShowSessionResult(sel.sessionNumber);
            
            return (
              <div key={sel.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>세션 {sel.sessionNumber}</h3>
                  {canShowResult ? (
                    <button
                      onClick={() => router.push(`/session/${sel.sessionNumber}/result`)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--primary)', 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      결과 보기 →
                    </button>
                  ) : (
                    <span className="badge badge-gray">⏳ 결과 대기중</span>
                  )}
                </div>
                
                {/* 1순위 */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 15px',
                  background: '#fff5f3',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>1</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{sel.firstChoice?.code}</span>
                  </div>
                  {canShowResult ? (
                    <span style={{ fontSize: '13px', color: '#666' }}>
                      {INFO_LABELS[sel.firstChoice?.requestedInfo]?.emoji}{' '}
                      {INFO_LABELS[sel.firstChoice?.requestedInfo]?.label}
                    </span>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#999' }}>🔒 정보 미공개</span>
                  )}
                </div>
                
                {/* 2순위 */}
                {sel.secondChoice && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 15px',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        background: '#999',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>2</span>
                      <span style={{ fontWeight: '700', color: '#666' }}>{sel.secondChoice?.code}</span>
                    </div>
                    {canShowResult ? (
                      <span style={{ fontSize: '13px', color: '#666' }}>
                        {INFO_LABELS[sel.secondChoice?.requestedInfo]?.emoji}{' '}
                        {INFO_LABELS[sel.secondChoice?.requestedInfo]?.label}
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#999' }}>🔒 정보 미공개</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* 최종 선택 */}
          {finalSelection && (
            <div className="card" style={{ border: '2px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>💕 최종 선택</h3>
                {canShowFinalResult ? (
                  <span className={`badge ${finalSelection.consentToShare ? 'badge-green' : 'badge-gray'}`}>
                    {finalSelection.consentToShare ? '연락처 공유 동의' : '연락처 비공개'}
                  </span>
                ) : (
                  <span className="badge badge-gray">⏳ 결과 대기중</span>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 15px',
                background: '#fff5f3',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>💖</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '16px' }}>{finalSelection.firstChoice}</span>
                </div>
                <span style={{ fontSize: '13px', color: '#666' }}>1순위</span>
              </div>
              
              {finalSelection.secondChoice && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 15px',
                  background: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>💜</span>
                    <span style={{ fontWeight: '700', color: '#666', fontSize: '16px' }}>{finalSelection.secondChoice}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#666' }}>2순위</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
