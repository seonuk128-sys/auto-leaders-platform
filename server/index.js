const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// 데이터를 주고받기 위한 설정 (JSON 형식 사용)
app.use(express.json());

// 정적 파일 제공 (빌드된 리액트 파일)
app.use(express.static(path.join(__dirname, '../client/dist')));

// 이메일 발송 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 이메일 보내는 함수
async function sendNotification(data) {
    const isRent = data.type === 'rent';
    const title = isRent ? '[장기렌트/리스] 새로운 상담 신청' : '[보험영업] 새로운 상담 신청';
    
    let detailsText = '';
    if (isRent) {
        detailsText = `
- 고객 유형: ${data.customerType}
- 관심 차종: ${data.carModel}
- 계약 기간: ${data.contractPeriod}개월
- 선납금: ${data.prepayment}만원
- 주행거리: ${data.distance}만km
- 상품종류: ${data.serviceType}`;
    } else {
        detailsText = `
- 상담 내용: ${data.content}`;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECEIVER_EMAIL,
        subject: `🔔 ${title}`,
        text: `
새로운 상담 신청이 접수되었습니다.

- 신청 유형: ${isRent ? '장기렌트/리스' : '보험영업'}
- 성함: ${data.name}
- 연락처: ${data.phone}${detailsText}

본 메일은 실시간 알림 서비스입니다.
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 [${data.type}] 알림 이메일이 발송되었습니다.`);
    } catch (error) {
        console.error('이메일 발송 중 오류:', error);
    }
}

console.log('🚀 서버 준비 중...');

// 신규 상담 신청 API
app.post('/api/consultations', (req, res) => {
    const data = req.body;

    try {
        // 정보 수신 즉시 이메일 알림 보내기
        sendNotification(data);

        res.status(200).json({ message: '성공적으로 신청되었습니다.' });
        console.log(`📝 새 상담 알림 발송 [${data.type}]: ${data.name} (${data.phone})`);
    } catch (error) {
        console.error('처리 중 오류 발생:', error);
        res.status(500).json({ message: '신청 중 문제가 발생했습니다.' });
    }
});

// 기존 API 유지 (이전 양식 대응)
app.post('/api/customers', (req, res) => {
    const data = req.body;
    try {
        sendNotification({ ...data, type: 'old' });
        res.status(200).json({ message: '성공적으로 저장되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '오류 발생' });
    }
});

// 모든 알 수 없는 경로는 클라이언트(React)의 index.html로 보냅니다.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`🚀 서버가 포트 ${port} 에서 안정적으로 돌아가고 있습니다!`);
});
