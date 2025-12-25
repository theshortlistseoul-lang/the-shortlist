'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  getOppositeGenderParticipants, 
  submitFinalSelection,
  hasSubmittedFinalSelection
} from '@/lib/firestore';

export default function FinalSelectPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [candidates, setCandidates] = useState([]);
  const [firstChoice, setFirstChoice] = useState('');
  const [secondChoice, setSecondChoice] = useState('');
  const [consentToShare, setConsentToShare] = useState(false);
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
      
      hasSubmittedFinalSelection(user.eventDate, user.eventCode)
        .then(setAlreadySubmitted);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!firstChoice) {
      setError('1지망을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitFinalSelection(
        user.eventDate,
        user.eventCode,
        firstChoice,
        secondChoice || null,
        consentToShare
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
            <div className="result-text">최종 선택이 완료되었습니다.</div>
          </div>
          <button onClick={() => router.push('/')} className="btn btn-secondary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
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

      {/* Final Selection Card */}
      <div className="card">
        <div className="question">최종 선택</div>
        <div className="question-subtitle">
          마음이 통하는 한 분을 선택해 주세요
        </div>

        <div className="form-group">
          <label className="label">1지망 코드 (필수)</label>
          <select
            value={firstChoice}
            onChange={(e) => setFirstChoice(e.target.value)}
            className="input-field"
          >
            <option value="">선택해주세요</option>
            {candidates
              .filter(c => c.eventCode !== secondChoice)
              .map(c => (
                <option key={c.id} value={c.eventCode}>{c.eventCode}</option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">2지망 코드 (선택)</label>
          <select
            value={secondChoice}
            onChange={(e) => setSecondChoice(e.target.value)}
            className="input-field"
          >
            <option value="">선택 안함</option>
            {candidates
              .filter(c => c.eventCode !== firstChoice)
              .map(c => (
                <option key={c.id} value={c.eventCode}>{c.eventCode}</option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consentToShare}
              onChange={(e) => setConsentToShare(e.target.checked)}
              style={{ width: '20px', height: '20px', marginRight: '10px' }}
            />
            <span>매칭 시 연락처 공개에 동의합니다</span>
          </label>
        </div>

        <div className="info-box" style={{ marginBottom: '20px' }}>
          <strong style={{ color: 'var(--secondary)' }}>💡 안내</strong>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            • 연락처 공개에 동의하시면, 매칭 성사 시 상대방에게 연락처가 전달됩니다.<br />
            • 동의하지 않으시면, 운영진이 중간에서 연결을 도와드립니다.
          </p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !firstChoice}
          className="btn btn-primary"
        >
          {submitting ? '제출 중...' : '최종 제출'}
        </button>

        <div className="info-text">
          ⚠️ 제출 후 수정이 불가합니다
        </div>
      </div>
    </div>
  );
}
