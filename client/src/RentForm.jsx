import React, { useState } from 'react';
import axios from 'axios';

function RentForm() {
  const [formData, setFormData] = useState({
    type: 'rent',
    customerType: '개인',
    name: '',
    phone: '',
    carModel: '',
    contractPeriod: '60',
    prepayment: '0',
    distance: '2',
    serviceType: '장기렌트'
  });
  const [message, setMessage] = useState('');
  const [activeTooltip, setActiveTooltip] = useState(null);

  const toggleTooltip = (name) => {
    setActiveTooltip(activeTooltip === name ? null : name);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelect = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 배포된 서버의 전체 주소를 명시하여 통신 오류 방지
      const response = await axios.post('https://auto-leaders-platform.onrender.com/api/consultations', formData);
      if (response.status === 200) {
        setMessage('신청완료! 빠른 시간 내에 상담 연락 드리겠습니다.');
        setFormData({
          type: 'rent',
          customerType: '개인',
          name: '',
          phone: '',
          carModel: '',
          contractPeriod: '60',
          prepayment: '0',
          distance: '2',
          serviceType: '장기렌트'
        });
        setActiveTooltip(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const tooltips = {
    serviceType: "장기렌트는 번호판이 '하,허,호'로 나가며 보험료가 포함됩니다. 리스는 일반 번호판을 사용하며 보험은 별도로 가입합니다.",
    contractPeriod: "계약 기간이 길어질수록 월 대여료가 저렴해지는 경향이 있습니다.",
    prepayment: "차량 가격의 일부를 미리 납부하여 월 대여료를 낮추는 방식입니다.",
    distance: "연간 예상 주행거리에 맞춰 선택해주세요. 주행거리가 짧을수록 대여료가 저렴합니다."
  };

  return (
    <div className="container modern-form" onClick={() => setActiveTooltip(null)}>
      <div className="logo-container">
        <img src="/images/logo.jpeg" alt="Auto Leaders 오토리더스" className="brand-logo" />
        <p className="logo-subtitle">원하시는 조건으로 최적의 견적을 안내해 드립니다</p>
      </div>
      
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        {/* 고객 유형 이동 (최상단) */}
        <div className="form-group">
          <label className="section-label">고객 유형</label>
          <div className="radio-group-modern">
            {['개인', '개인사업자', '법인'].map((type) => (
              <label key={type} className={`radio-label ${formData.customerType === type ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="customerType"
                  value={type}
                  checked={formData.customerType === type}
                  onChange={handleChange}
                /> {type}
              </label>
            ))}
          </div>
        </div>

        <div className="form-divider"></div>

        {/* 이용 상품 선택 */}
        <div className="form-group relative">
          <label className="section-label">
            이용상품 
            <span className="help-icon" onClick={() => toggleTooltip('serviceType')}>?</span>
            {activeTooltip === 'serviceType' && <div className="tooltip">{tooltips.serviceType}</div>}
          </label>
          <div className="card-selector-large">
            <div 
              className={`card-item-large ${formData.serviceType === '장기렌트' ? 'active' : ''}`}
              onClick={() => handleSelect('serviceType', '장기렌트')}
            >
              <div className="card-title">장기렌트</div>
              <div className="card-desc">보험, 자동차세 포함<br/>신용영향X · 하허호 번호판</div>
            </div>
            <div 
              className={`card-item-large ${formData.serviceType === '리스' ? 'active' : ''}`}
              onClick={() => handleSelect('serviceType', '리스')}
            >
              <div className="card-title">리스</div>
              <div className="card-desc">보험, 자동차세 미포함<br/>신용영향O · 일반 번호판</div>
            </div>
          </div>
        </div>

        {/* 계약 기간 */}
        <div className="form-group relative">
          <label className="section-label">
            계약기간 
            <span className="help-icon" onClick={() => toggleTooltip('contractPeriod')}>?</span>
            {activeTooltip === 'contractPeriod' && <div className="tooltip">{tooltips.contractPeriod}</div>}
          </label>
          <div className="card-selector">
            {['1년', '2년', '3년', '4년', '5년'].map((year, idx) => {
              const val = (idx + 1) * 12 + "";
              return (
                <div 
                  key={year}
                  className={`card-item ${formData.contractPeriod === val ? 'active' : ''}`}
                  onClick={() => handleSelect('contractPeriod', val)}
                >
                  {idx === 4 && <span className="badge">최다</span>}
                  {year}
                </div>
              );
            })}
          </div>
        </div>

        {/* 선납금 */}
        <div className="form-group relative">
          <div className="label-row">
            <label className="section-label">
              선납금 
              <span className="help-icon" onClick={() => toggleTooltip('prepayment')}>?</span>
              {activeTooltip === 'prepayment' && <div className="tooltip">{tooltips.prepayment}</div>}
            </label>
            <span className="value-display">{formData.prepayment}만원</span>
          </div>
          <div className="card-selector">
            {['0%', '10%', '20%', '30%'].map((pct, idx) => (
              <div 
                key={pct}
                className={`card-item ${formData.prepayment === (idx * 10 * 10) + "" ? 'active' : ''}`} // 단순 예시 계산
                onClick={() => handleSelect('prepayment', (idx * 10 * 10) + "")}
              >
                {idx === 0 && <span className="badge">최다</span>}
                {pct}
              </div>
            ))}
          </div>
        </div>

        {/* 주행 거리 */}
        <div className="form-group relative">
          <div className="label-row">
            <label className="section-label">
              1년에 주행할 거리 
              <span className="help-icon" onClick={() => toggleTooltip('distance')}>?</span>
              {activeTooltip === 'distance' && <div className="tooltip">{tooltips.distance}</div>}
            </label>
            <span className="value-display">km</span>
          </div>
          <div className="card-selector">
            {['1만', '1.5만', '2만', '3만'].map((dist, idx) => (
              <div 
                key={dist}
                className={`card-item ${formData.distance === (idx === 1 ? '1.5' : (idx === 0 ? '1' : (idx === 2 ? '2' : '3'))) ? 'active' : ''}`}
                onClick={() => handleSelect('distance', (idx === 1 ? '1.5' : (idx === 0 ? '1' : (idx === 2 ? '2' : '3'))))}
              >
                {idx === 2 && <span className="badge">최다</span>}
                {dist}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="name"
            className="modern-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="성함을 입력해주세요"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phone"
            className="modern-input"
            value={formData.phone}
            onChange={handleChange}
            placeholder="연락처 (010-0000-0000)"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="carModel"
            className="modern-input"
            value={formData.carModel}
            onChange={handleChange}
            placeholder="관심 차종 (예: 그랜저, 카니발 등)"
            required
          />
        </div>

        <button type="submit" className="submit-btn modern-btn">상담 신청하기</button>
      </form>
      {message && <div className="message success">{message}</div>}
    </div>
  );
}

export default RentForm;
