import React, { useState } from 'react';
import axios from 'axios';

function InsuranceForm() {
  const [formData, setFormData] = useState({
    type: 'insurance',
    name: '',
    phone: '',
    content: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/consultations', formData);
      if (response.status === 200) {
        setMessage('신청완료! 빠른 시간 내에 상담 연락 드리겠습니다.');
        setFormData({
          type: 'insurance',
          name: '',
          phone: '',
          content: ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="container">
      <h2>🛡️ 맞춤 보험 상담 신청</h2>
      <p>궁금하신 점이나 상담 내용을 남겨주시면 정직하게 상담해드립니다.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">성함</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="성함을 입력해주세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">연락처</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">상담 내용</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="예: 자동차 보험 갱신, 실비 보험 문의 등"
            rows="5"
            required
          ></textarea>
        </div>

        <button type="submit" className="submit-btn insurance-btn">무료 상담 신청하기</button>
      </form>
      {message && <div className="message success">{message}</div>}
    </div>
  );
}

export default InsuranceForm;
