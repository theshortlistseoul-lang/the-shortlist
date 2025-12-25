'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { updateParticipantInfo } from '@/lib/firestore';

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, login } = useAuth();
  
  const [formData, setFormData] = useState({
    job: '',
    introduction: '',
    flirtingSecret: '',
    greenFlag: '',
    redFlag: '',
  });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        job: user.job || '',
        introduction: user.introduction || '',
        flirtingSecret: user.flirtingSecret || '',
        greenFlag: user.greenFlag || '',
        redFlag: user.redFlag || '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateParticipantInfo(user.eventDate, user.id, formData);
      
      // 로컬 상태 업데이트
      const updatedUser = { ...user, ...formData };
      login(updatedUser);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      {/* Navigation */}
      <div className="nav-top">
        <div className="nav-left">
          <button className="back-button" onClick={() => router.back()}>←</button>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }}>Main</a>
          <a href="#" className="active">My Page</a>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/history'); }}>기록</a>
        </div>
        <div className="nav-right">
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {/* Header */}
      <div className="header">
        <div className="logo" onClick={() => router.push('/')}>The Shortlist</div>
      </div>

      {/* My Info Card */}
      <div className="card">
        <h3 style={{ marginBottom: '25px', color: 'var(--primary)' }}>내 정보</h3>

        {/* 행사코드 (최상단) */}
        <div className="form-group">
          <label className="label">행사코드</label>
          <input
            type="text"
            value={user.eventCode || ''}
            disabled
            className="input-field"
            style={{ fontWeight: 'bold', color: 'var(--primary)' }}
          />
        </div>

        {/* 수정 불가 정보 */}
        <div className="form-group">
          <label className="label">이름</label>
          <input type="text" value={user.name || ''} disabled className="input-field" />
        </div>

        <div className="form-group">
          <label className="label">전화번호</label>
          <input type="tel" value={user.phone || ''} disabled className="input-field" />
        </div>

        <div className="form-group">
          <label className="label">이메일</label>
          <input type="email" value={user.email || ''} disabled className="input-field" />
        </div>

        <div className="form-group">
          <label className="label">출생연도</label>
          <input type="text" value={user.birthYear || ''} disabled className="input-field" />
        </div>

        {/* 수정 가능 정보 */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #e0e0e0', paddingTop: '30px' }}>
          <div className="form-group">
            <label className="label">직업/회사</label>
            <input
              type="text"
              value={formData.job}
              onChange={(e) => handleChange('job', e.target.value)}
              placeholder="직업/회사를 입력해 주세요"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="label">나를 한 문장으로</label>
            <textarea
              value={formData.introduction}
              onChange={(e) => handleChange('introduction', e.target.value)}
              placeholder="자신을 소개해 주세요"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="label">플러팅용 비밀</label>
            <textarea
              value={formData.flirtingSecret}
              onChange={(e) => handleChange('flirtingSecret', e.target.value)}
              placeholder="당신만의 매력을 알려주세요"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="label">Green Flag (심쿵 포인트)</label>
            <textarea
              value={formData.greenFlag}
              onChange={(e) => handleChange('greenFlag', e.target.value)}
              placeholder="어떤 모습에 끌리시나요?"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="label">Red Flag (절대 허용할 수 없는)</label>
            <textarea
              value={formData.redFlag}
              onChange={(e) => handleChange('redFlag', e.target.value)}
              placeholder="어떤 모습은 어려우신가요?"
              className="input-field"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? '저장 중...' : '수정 완료'}
        </button>

        {showSuccess && (
          <div className="success-message" style={{ marginTop: '15px' }}>
            정보가 업데이트되었습니다
          </div>
        )}
      </div>
    </div>
  );
}