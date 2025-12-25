'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { loginParticipant } from '@/lib/firestore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/-/g, '');
      const participant = await loginParticipant(name.trim(), cleanPhone);
      
      if (!participant) {
        setError('등록되지 않은 참가자입니다. 이름과 전화번호를 확인해주세요.');
        setLoading(false);
        return;
      }

      login(participant);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f1ed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px 40px',
      fontFamily: '"Noto Sans KR", sans-serif'
    }}>
      {/* Logo */}
      <h1 style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: '36px',
        fontWeight: '600',
        color: '#9d4a3d',
        marginBottom: '12px',
        letterSpacing: '1px'
      }}>
        The Shortlist
      </h1>
      
      {/* Subtitle */}
      <p style={{
        fontSize: '14px',
        color: '#301713',
        opacity: 0.7,
        marginBottom: '50px'
      }}>
        당신의 특별한 만남을 위해
      </p>

      {/* Form Container */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* 이름 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#301713',
              marginBottom: '8px'
            }}>
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 전화번호 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#301713',
              marginBottom: '8px'
            }}>
              전화번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="전화번호 (- 없이)"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: '#fff5f3',
              color: '#9d4a3d',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#cccccc' : '#9d4a3d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 안내 문구 */}
          <p style={{
            fontSize: '12px',
            color: '#301713',
            opacity: 0.6,
            textAlign: 'center',
            marginTop: '20px'
          }}>
            신청서에 작성하신 이름과 전화번호를 입력해 주세요
          </p>
        </form>
      </div>

      {/* Bottom Links */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '400px',
        marginTop: 'auto',
        paddingTop: '40px'
      }}>
        <a 
          href="https://forms.gle/71ddwxkWrqZ2Z2a2A" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            fontSize: '14px',
            color: '#301713',
            textDecoration: 'none'
          }}
        >
          참가 신청
        </a>
        <a 
          href="https://www.instagram.com/theshortlist.seoul/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            fontSize: '14px',
            color: '#301713',
            textDecoration: 'none'
          }}
        >
          Instagram
        </a>
      </div>
    </div>
  );
}
