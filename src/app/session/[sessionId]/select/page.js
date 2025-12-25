'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvent } from '@/hooks/useEvent';
import { 
  getOppositeGenderParticipants, 
  submitSelection, 
  hasSubmittedSelection 
} from '@/lib/firestore';

const INFO_OPTIONS = [
  { value: 'birthYear', label: '출생연도', emoji: '🎂' },
  { value: 'job', label: '직업/회사', emoji: '💼' },
  { value: 'flirtingSecret', label: '플러팅용 비밀', emoji: '🤫' },
  { value: 'greenFlag', label: 'Green Flag', emoji: '💚' },
  { value: 'redFlag', label: 'Red Flag', emoji: '🚩' },
];

export default function SessionSelectPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = parseInt(params.sessionId);
  
  const { user, loading: authLoading, logout } = useAuth();
  const { event } = useEvent(user?.eventDate);
  
  const [candidates, setCandidates] = useState([]);
  const [firstChoice, setFirstChoice] = useState({ code: '', requestedInfo: '' });
  const [secondChoice, setSecondChoice] = useState({ code: '', requestedInfo: '' });
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getOppositeGenderParticipants(user.eventDate, user.gender)
        .then(setCandidates);
      
      hasSubmittedSelection(user.eventDate, user.eventCode, sessionId)
        .then(setAlreadySubmitted);
    }
  }, [user, sessionId]);

  const handleSubmit = async () => {
    if (!firstChoice.code || !firstChoice.requestedInfo) {
      setError('첫 번째 선택을 완료해주세요.');
      return;
    }
    
    if (secondChoice.code && !secondChoice.requestedInfo) {
      setError('두 번째 선택의 정보 항목을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitSelection(
        user.eventDate,
        user.eventCode,
        sessionId,
        firstChoice,
        secondChoice.code ? secondChoice : null
      );
      
      router.push('/');
    } catch (err) {
      console.error(err);
      setError(err.message || '제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      router.push('/login');
    }
  };

  if (authLoading) {
    return (
      <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  if (alreadySubmitted) {
    return (
      <div className="container">
        <div className="header">
          <div className="logo">The Shortlist</div>
        </div>
        <div className="card">
          <div className="result-message">
            <div className="result-icon">✅</div>
            <div className="result-title">이미 제출했습니다</div>
            <div className="result-text">세션 {sessionId} 선택이 완료되었습니다.</div>
          </div>
          <button onClick={() => router.push('/')} className="btn btn-secondary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '120px' }}>
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

      {/* Header */}
      <div className="header">
        <div className="logo" onClick={() => router.push('/')}>The Shortlist</div>
      </div>

      {/* Selection Card */}
      <div className="card">
        <div style={{ marginBottom: '15px', textAlign: 'right', color: '#888', fontSize: '14px' }}>
          Current Round: 세션 {sessionId} 선택
        </div>

        <div className="question">더 알고 싶은 사람은 누구인가요?</div>
        <div className="question-subtitle">
          행사코드와 정보 항목 조합을 선택해 주세요
        </div>

        {/* 첫 번째 선택 */}
        <div className="form-group">
          <label className="label">첫 번째 선택 (필수)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              value={firstChoice.code}
              onChange={(e) => setFirstChoice({ ...firstChoice, code: e.target.value })}
              className="input-field"
              style={{ flex: 1 }}
            >
              <option value="">행사코드</option>
              {candidates
                .filter(c => c.eventCode !== secondChoice.code)
                .map(c => (
                  <option key={c.id} value={c.eventCode}>{c.eventCode}</option>
                ))}
            </select>
            <select
              value={firstChoice.requestedInfo}
              onChange={(e) => setFirstChoice({ ...firstChoice, requestedInfo: e.target.value })}
              className="input-field"
              style={{ flex: 2 }}
            >
              <option value="">정보 항목</option>
              {INFO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 두 번째 선택 */}
        <div className="form-group">
          <label className="label">두 번째 선택 (선택)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              value={secondChoice.code}
              onChange={(e) => setSecondChoice({ ...secondChoice, code: e.target.value })}
              className="input-field"
              style={{ flex: 1 }}
            >
              <option value="">행사코드</option>
              {candidates
                .filter(c => c.eventCode !== firstChoice.code)
                .map(c => (
                  <option key={c.id} value={c.eventCode}>{c.eventCode}</option>
                ))}
            </select>
            <select
              value={secondChoice.requestedInfo}
              onChange={(e) => setSecondChoice({ ...secondChoice, requestedInfo: e.target.value })}
              className="input-field"
              style={{ flex: 2 }}
              disabled={!secondChoice.code}
            >
              <option value="">정보 항목</option>
              {INFO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !firstChoice.code || !firstChoice.requestedInfo}
          className="btn btn-primary"
        >
          {submitting ? '제출 중...' : '제출'}
        </button>

        <div className="info-text">
          ⚠️ 제출 후 수정이 불가합니다
        </div>
      </div>
    </div>
  );
}
