const express = require('express');
const Database = require('better-sqlite3');
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
- 계약 기간: ${data.contractPeriod}개월`;
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

데이터베이스를 확인해 주세요.
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 [${data.type}] 알림 이메일이 발송되었습니다.`);
    } catch (error) {
        console.error('이메일 발송 중 오류:', error);
    }
}

// 데이터베이스 연결 및 초기화
const db = new Database(path.join(__dirname, 'database.sqlite'));

// 테이블 생성
db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        birthdate TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS consultations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        customer_type TEXT,
        car_model TEXT,
        contract_period TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('✅ 데이터베이스 장부 준비 완료!');

// 신규 상담 신청 API
app.post('/api/consultations', (req, res) => {
    const { type, name, phone, customerType, carModel, contractPeriod, content } = req.body;

    try {
        const stmt = db.prepare(
            `INSERT INTO consultations (type, name, phone, customer_type, car_model, contract_period, content) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        stmt.run(type, name, phone, customerType, carModel, contractPeriod, content);
        
        // 정보 저장 후 이메일 알림 보내기 (비동기로 실행)
        sendNotification({ type, name, phone, customerType, carModel, contractPeriod, content });

        res.status(200).json({ message: '성공적으로 신청되었습니다.' });
        console.log(`📝 새 상담 등록 [${type}]: ${name} (${phone})`);
    } catch (error) {
        console.error('저장 중 오류 발생:', error);
        res.status(500).json({ message: '신청 중 문제가 발생했습니다.' });
    }
});

// 기존 API 유지
app.post('/api/customers', (req, res) => {
    const { name, phone, birthdate } = req.body;

    try {
        const stmt = db.prepare('INSERT INTO customers (name, phone, birthdate) VALUES (?, ?, ?)');
        stmt.run(name, phone, birthdate);
        
        sendNotification({ name, phone, birthdate });

        res.status(200).json({ message: '성공적으로 저장되었습니다.' });
        console.log(`📝 새 고객 등록: ${name} (${phone})`);
    } catch (error) {
        console.error('저장 중 오류 발생:', error);
        res.status(500).json({ message: '저장 중 문제가 발생했습니다.' });
    }
});

// 모든 알 수 없는 경로는 클라이언트(React)의 index.html로 보냅니다.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`🚀 서버가 포트 ${port} 에서 돌아가고 있습니다!`);
});
