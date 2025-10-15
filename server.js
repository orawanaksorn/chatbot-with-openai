require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const ExcelReader = require('./excelReader');
const OpenAIClient = require('./openaiClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

// Validate Environment Variables
const requiredEnvVars = ['OPENAI_API_KEY', 'LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    } else {
        console.warn('⚠️  Continuing in development mode without all env vars');
    }
}

// Line Bot Configuration
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// Initialize Excel Reader and OpenAI Client
const excelReader = new ExcelReader();
const openaiClient = new OpenAIClient();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] // แทนที่ด้วย domain จริง
        : ['http://localhost:3000', 'http://127.0.0.1:3000']
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'production' ? 30 : 100, // limit each IP
    message: {
        error: 'ขออภัยค่ะ น้องบอทได้รับข้อความเยอะเกินไป กรุณารอสักครู่นะคะ 🥺'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to webhook
app.use('/webhook', limiter);

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

app.use('/webhook', line.middleware(config));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'น้องบอท Chatbot API กำลังทำงาน! 🤖',
        status: 'active',
        totalProducts: excelReader.getAllData().length
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    try {
        const dataSummary = excelReader.getDataSummary();
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: require('./package.json').version,
            data: {
                totalProducts: excelReader.getAllData().length,
                subjects: dataSummary.subjects ? dataSummary.subjects.length : 0,
                grades: dataSummary.grades ? dataSummary.grades.length : 0,
                bookTypes: dataSummary.bookTypes ? dataSummary.bookTypes.length : 0
            },
            services: {
                excel: excelReader.getAllData().length > 0 ? 'connected' : 'disconnected',
                openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
                line: (process.env.LINE_CHANNEL_ACCESS_TOKEN && process.env.LINE_CHANNEL_SECRET) ? 'configured' : 'not configured'
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Line Webhook
app.post('/webhook', async (req, res) => {
    try {
        const events = req.body.events;
        
        if (!events || events.length === 0) {
            return res.status(200).json({ message: 'No events to process' });
        }

        await Promise.all(events.map(handleEvent));
        res.status(200).json({ message: 'Events processed successfully' });
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาดใน webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle Line Events
async function handleEvent(event) {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        if (event.type !== 'message' || event.message.type !== 'text') {
            return null;
        }

        const userMessage = event.message.text.trim();
        const userId = event.source.userId;
        
        console.log(`User ${userId} asked: ${userMessage}`);

        // ตรวจสอบว่าเป็นคำทักทาย
        if (isGreeting(userMessage)) {
            const greetingResponse = getGreetingResponse();
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: greetingResponse
            });
        }

        // ประมวลผลคำถามผ่าน OpenAI
        const response = await openaiClient.searchAndRespond(userMessage, excelReader);
        
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: response
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการจัดการ event:', error);
        
        // ส่งข้อความ error กลับไปให้ผู้ใช้
        try {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'ขออภัยค่ะ น้องบอทมีปัญหาเล็กน้อย กรุณาลองใหม่อีกครั้งนะคะ 🥺'
            });
        } catch (replyError) {
            console.error('ไม่สามารถส่งข้อความ error ได้:', replyError);
        }
    }
}

// ตรวจสอบคำทักทาย
function isGreeting(message) {
    const greetings = [
        'สวัสดี', 'หวัดดี', 'ดี', 'hello', 'hi', 'hey', 'สวัสดีครับ', 'สวัสดีค่ะ',
        'เริ่ม', 'start', 'ทักทาย', 'ดีครับ', 'ดีค่ะ'
    ];
    
    return greetings.some(greeting => 
        message.toLowerCase().includes(greeting.toLowerCase())
    );
}

// สร้างข้อความทักทาย
function getGreetingResponse() {
    const dataSummary = excelReader.getDataSummary();
    
    return `สวัสดีค่ะ! น้องบอทยินดีที่ได้รู้จักนะคะ 😊

น้องช่วยพี่หาข้อมูลสินค้าและหนังสือของบริษัทได้เลยค่ะ!

📚 ข้อมูลในระบบ:
• สินค้าทั้งหมด: ${dataSummary.totalProducts} รายการ
• กลุ่มสาระการเรียนรู้: ${dataSummary.subjects.length} กลุ่ม
• ประเภทหนังสือ: ${dataSummary.bookTypes.length} ประเภท  
• ชั้นปี: ${dataSummary.grades.length} ระดับ

🔍 พี่สามารถถามได้เลยค่ะ เช่น:
- "มีหนังสือคณิตศาสตร์ไหม"
- "หาหนังสือชั้น ป.1"
- "สินค้าใหม่มีอะไรบ้าง"
- "มีหนังสือภาษาอังกฤษไหม"

น้องพร้อมช่วยเหลือค่ะ! 💕`;
}

// API endpoint สำหรับทดสอบการค้นหา (ไม่ผ่าน Line)
app.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const results = excelReader.searchProducts(query);
        
        res.json({
            query: query,
            results: results.slice(0, 10), // แสดงแค่ 10 รายการแรก
            totalFound: results.length
        });
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการค้นหา:', error);
        res.status(500).json({ error: 'Search error' });
    }
});

// API endpoint สำหรับทดสอบ OpenAI response
app.post('/test-ai', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const response = await openaiClient.searchAndRespond(message, excelReader);
        
        res.json({
            userMessage: message,
            aiResponse: response
        });
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการทดสอบ AI:', error);
        res.status(500).json({ error: 'AI test error' });
    }
});

// Error Handling for Production
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 น้องบอท Server กำลังทำงานที่ port ${PORT}`);
    console.log(`📊 โหลดข้อมูลสินค้าแล้ว: ${excelReader.getAllData().length} รายการ`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`🔗 Webhook URL: https://your-app.onrender.com/webhook`);
        console.log(`🏥 Health Check: https://your-app.onrender.com/health`);
    } else {
        console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    }
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

module.exports = app;