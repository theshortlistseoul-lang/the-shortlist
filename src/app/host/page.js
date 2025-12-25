'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getActiveEvent,
  getAllEvents,
  getEventByDate,
  updateEventRound, 
  getAllSelections,
  getAllFinalSelections,
  calculateMatches,
  getAllParticipants
} from '@/lib/firestore';

const ADMIN_CODE = 'theshortlist2024';

const ROUND_INFO = {
  0: { description: '행사 시작전' },
  1: { description: '세션 1 선택' },
  2: { description: '세션 1 결과' },
  3: { description: '세션 2 선택' },
  4: { description: '세션 2 결과' },
  5: { description: '세션 3 선택' },
  6: { description: '세션 3 결과' },
  7: { description: '세션 4 선택' },
  8: { description: '세션 4 결과' },
  9: { description: '최종 선택' },
  10: { description: '최종 결과' },
};

export default function HostPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [event, setEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('control');
  
  // Data
  const [selections, setSelections] = useState([]);
  const [finalSelections, setFinalSelections] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('hostAuth');
    if (stored === 'true') {
      setAuthenticated(true);
      loadData();
    }
  }, []);

  const handleLogin = () => {
    if (inputCode === ADMIN_CODE) {
      setAuthenticated(true);
      localStorage.setItem('hostAuth', 'true');
      loadData();
    } else {
      alert('잘못된 코드입니다.');
    }
  };

  const loadData = async (targetDate = null) => {
    setLoading(true);
    try {
      // 모든 이벤트 가져오기
      const events = await getAllEvents();
      setAllEvents(events);
      
      // 선택된 날짜가 있으면 그 이벤트, 없으면 첫 번째 이벤트
      let eventData;
      if (targetDate) {
        eventData = await getEventByDate(targetDate);
      } else if (events.length > 0) {
        eventData = events[0]; // 가장 최근 이벤트
      }
      
      setEvent(eventData);
      if (eventData) {
        setSelectedDate(eventData.date);
        
        const [sels, finals, parts] = await Promise.all([
          getAllSelections(eventData.date),
          getAllFinalSelections(eventData.date),
          getAllParticipants(eventData.date)
        ]);
        setSelections(sels);
        setFinalSelections(finals);
        setParticipants(parts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoundChange = async (newRound) => {
    if (!event) return;
    
    if (confirm(`라운드를 ${newRound}(${ROUND_INFO[newRound]?.description})로 변경하시겠습니까?`)) {
      setLoading(true);
      try {
        await updateEventRound(event.id, newRound);
        setEvent({ ...event, currentRound: newRound });
        
        if (newRound === 10) {
          await calculateMatches(event.date);
          alert('최종 매칭이 완료되었습니다!');
        }
      } catch (err) {
        console.error(err);
        alert('오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const canShowSessionResult = (sessionNumber) => {
    const resultRound = sessionNumber * 2;
    return (event?.currentRound || 0) >= resultRound;
  };

  if (!authenticated) {
    return (
      <div className="container">
        <div className="header">
          <div className="logo">The Shortlist</div>
          <div className="subtitle">Host Dashboard</div>
        </div>

        <div className="card">
          <div className="form-group">
            <label className="label">관리자 코드</label>
            <input
              type="password"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="코드를 입력해 주세요"
              className="input-field"
            />
          </div>
          <button onClick={handleLogin} className="btn btn-primary">
            로그인
          </button>
        </div>
      </div>
    );
  }

  if (loading && !event) {
    return (
      <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      <div className="header">
        <div className="logo">The Shortlist</div>
        <div className="subtitle">Host Dashboard</div>
      </div>

      {/* 날짜 선택 드롭다운 */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '500', color: '#301713' }}>이벤트 날짜:</label>
          <select
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              loadData(e.target.value);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            {allEvents.map((ev) => (
              <option key={ev.date} value={ev.date}>
                {ev.date} - {ev.title || 'The Shortlist'} ({ev.status || 'pending'})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadData(selectedDate)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#9d4a3d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            새로고침
          </button>
        </div>
        {event && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
            참가자: {participants.length}명 (여{participants.filter(p=>p.gender==='W').length}, 남{participants.filter(p=>p.gender==='M').length})
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="session-tabs" style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('control')}
          className={`session-tab ${activeTab === 'control' ? 'active' : ''}`}
        >
          라운드 관리
        </button>
        <button
          onClick={() => setActiveTab('selections')}
          className={`session-tab ${activeTab === 'selections' ? 'active' : ''}`}
        >
          선택 현황
        </button>
        <button
          onClick={() => setActiveTab('final')}
          className={`session-tab ${activeTab === 'final' ? 'active' : ''}`}
        >
          최종 선택
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`session-tab ${activeTab === 'participants' ? 'active' : ''}`}
        >
          참가자
        </button>
      </div>

      {/* 라운드 관리 탭 */}
      {activeTab === 'control' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>라운드 관리</h3>
          
          <div className="highlight-box" style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>현재 라운드</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
              {event?.currentRound || 0} - {ROUND_INFO[event?.currentRound || 0]?.description}
            </div>
          </div>

          <div className="form-group">
            <label className="label">라운드 변경</label>
            <select
              value={event?.currentRound || 0}
              onChange={(e) => handleRoundChange(parseInt(e.target.value))}
              className="input-field"
              disabled={loading}
            >
              {Object.entries(ROUND_INFO).map(([round, info]) => (
                <option key={round} value={round}>
                  {round} - {info.description}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button
              onClick={() => handleRoundChange(Math.max(0, (event?.currentRound || 0) - 1))}
              disabled={loading || (event?.currentRound || 0) <= 0}
              className="btn btn-secondary"
            >
              ← 이전
            </button>
            <button
              onClick={() => handleRoundChange(Math.min(10, (event?.currentRound || 0) + 1))}
              disabled={loading || (event?.currentRound || 0) >= 10}
              className="btn btn-primary"
            >
              다음 →
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary"
            style={{ marginTop: '20px' }}
          >
            {loading ? '로딩 중...' : '새로고침'}
          </button>
        </div>
      )}

      {/* 선택 현황 탭 */}
      {activeTab === 'selections' && (
        <div>
          <div className="card">
            <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>세션별 선택 현황</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              총 {selections.length}개 선택
            </p>

            {[1, 2, 3, 4].map(sessionNum => {
              const sessionSels = selections.filter(s => s.sessionNumber === sessionNum);
              const canShow = canShowSessionResult(sessionNum);
              
              return (
                <div key={sessionNum} style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <span style={{ fontWeight: '600' }}>세션 {sessionNum}</span>
                    <span className={`badge ${canShow ? 'badge-green' : 'badge-gray'}`}>
                      {sessionSels.length}명 제출 {canShow ? '(공개)' : '(비공개)'}
                    </span>
                  </div>

                  {canShow ? (
                    sessionSels.length > 0 ? (
                      <div style={{ fontSize: '13px' }}>
                        {sessionSels.map((sel, i) => (
                          <div key={i} style={{ 
                            padding: '8px', 
                            background: i % 2 === 0 ? '#f9f9f9' : 'white',
                            borderRadius: '4px',
                            marginBottom: '4px'
                          }}>
                            <strong>{sel.selectorCode}</strong> → {sel.firstChoice?.code} ({sel.firstChoice?.requestedInfo})
                            {sel.secondChoice && `, ${sel.secondChoice.code} (${sel.secondChoice.requestedInfo})`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#999', fontSize: '14px' }}>아직 선택이 없습니다</div>
                    )
                  ) : (
                    <div style={{ 
                      padding: '15px', 
                      background: '#f5f5f5', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      color: '#666'
                    }}>
                      🔒 라운드 {sessionNum * 2}에서 공개됩니다
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 최종 선택 탭 */}
      {activeTab === 'final' && (
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>최종 선택 현황</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            총 {finalSelections.length}명 제출
          </p>

          {finalSelections.length > 0 ? (
            <div style={{ fontSize: '13px' }}>
              {finalSelections.map((sel, i) => (
                <div key={i} style={{ 
                  padding: '10px', 
                  background: i % 2 === 0 ? '#f9f9f9' : 'white',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{sel.selectorCode}</strong> → {sel.firstChoice}
                    {sel.secondChoice && `, ${sel.secondChoice}`}
                  </div>
                  <span className={`badge ${sel.consentToShare ? 'badge-green' : 'badge-gray'}`}>
                    {sel.consentToShare ? '공개' : '비공개'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#999', fontSize: '14px' }}>아직 최종 선택이 없습니다</div>
          )}
        </div>
      )}

      {/* 참가자 탭 */}
      {activeTab === 'participants' && (
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>참가자 목록</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            총 {participants.length}명
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <span className="badge badge-primary">
              남성 {participants.filter(p => p.gender === 'M').length}명
            </span>
            <span className="badge badge-primary">
              여성 {participants.filter(p => p.gender === 'F').length}명
            </span>
          </div>

          {participants.length > 0 ? (
            <div style={{ fontSize: '13px' }}>
              {participants.map((p, i) => (
                <div key={i} style={{ 
                  padding: '10px', 
                  background: i % 2 === 0 ? '#f9f9f9' : 'white',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }}>
                  <strong style={{ color: 'var(--primary)' }}>{p.eventCode}</strong>
                  {' '}- {p.name} ({p.gender === 'M' ? '남' : '여'}, {p.birthYear})
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#999', fontSize: '14px' }}>참가자가 없습니다</div>
          )}
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem('hostAuth');
          setAuthenticated(false);
        }}
        className="btn btn-secondary"
        style={{ marginTop: '20px' }}
      >
        로그아웃
      </button>
    </div>
  );
}