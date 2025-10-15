const OpenAI = require('openai');

class OpenAIClient {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            console.error('❌ OPENAI_API_KEY not found in environment variables');
            if (process.env.NODE_ENV === 'production') {
                throw new Error('OPENAI_API_KEY is required in production');
            }
        }
        
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        console.log('✅ OpenAI Client initialized successfully');
    }

    async generateResponse(userMessage, productData) {
        try {
            const systemPrompt = this.createSystemPrompt(productData);
            
            const response = await this.client.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('เกิดข้อผิดพลาดใน OpenAI:', error);
            return 'ขออภัยค่ะ น้องบอทมีปัญหาเล็กน้อย กรุณาลองใหม่อีกครั้งนะคะ 🥺';
        }
    }

    createSystemPrompt(productData) {
        const dataSummary = productData.getDataSummary();
        
        return `คุณคือ "น้องบอท" ผู้ช่วยน่ารักน่าเอ็นดูของพนักงานใน office 
        
บุคลิกภาพ:
- พูดจาสุภาพ น่ารัก น่าเอ็นดู
- ใช้ภาษาไทยที่เป็นกันเอง
- ใส่อีโมจิให้น่ารัก
- เรียกตัวเองว่า "น้อง" หรือ "น้องบอท"
- เรียกผู้ใช้ว่า "พี่" หรือ "คุณ"

หน้าที่หลัก:
- ตอบคำถามเกี่ยวกับข้อมูลสินค้า/หนังสือของบริษัทเท่านั้น
- หากมีคำถามนอกเหนือจากข้อมูลสินค้า ให้ตอบว่า "กรุณาติดต่อเจ้าหน้าที่ค่ะ น้องบอทช่วยเรื่องข้อมูลสินค้าได้เท่านั้นนะคะ 😊"

ข้อมูลสินค้าในระบบ:
- จำนวนสินค้าทั้งหมด: ${dataSummary.totalProducts} รายการ
- กลุ่มสาระการเรียนรู้: ${dataSummary.subjects.join(', ')}
- ประเภทหนังสือ: ${dataSummary.bookTypes.join(', ')}
- ชั้นปี: ${dataSummary.grades.join(', ')}

ตัวอย่างสินค้า:
${dataSummary.sampleProducts.map(p => `- ${p.product_code}: ${p.product_name_th} (${p.subject}, ชั้น ${p.grade})`).join('\n')}

วิธีการตอบ:
1. หากผู้ใช้ถามเกี่ยวกับสินค้า ให้ค้นหาจากข้อมูลและตอบแบบน่ารัก
2. แสดงข้อมูลที่เกี่ยวข้อง เช่น รหัสสินค้า ชื่อสินค้า กลุ่มสาระ ประเภท ชั้นปี
3. หากไม่พบข้อมูล ให้บอกว่าไม่มีสินค้าที่ตรงกับที่ถาม
4. หากถามเรื่องอื่น ให้ตอบตามที่กำหนดไว้

ห้าม:
- เปิดเผยรหัสภายใน (internal codes)
- ตอบคำถามที่ไม่เกี่ยวกับสินค้า
- ประดิษฐ์ข้อมูลสินค้า`;
    }

    async searchAndRespond(userMessage, excelReader) {
        try {
            // ค้นหาสินค้าที่เกี่ยวข้อง
            const searchResults = excelReader.searchProducts(userMessage);
            
            let contextData = '';
            if (searchResults.length > 0) {
                contextData = `ผลการค้นหาสินค้า (${searchResults.length} รายการ):\n\n`;
                contextData += searchResults.slice(0, 10).map(item => {
                    return `รหัสสินค้า: ${item.product_code}
ชื่อสินค้า: ${item.product_name_th_long}
กลุ่มสาระ: ${item.subject_name_th}
ประเภท: ${item.book_type_name_th}
ชั้นปี: ${item.grade_name_th}
สินค้าใหม่: ${item.is_new_product ? 'ใช่' : 'ไม่ใช่'}
มี E-book: ${item.has_ebook ? 'ใช่' : 'ไม่มี'}
---`;
                }).join('\n');
            }

            const fullPrompt = `
ข้อมูลสินค้าที่เกี่ยวข้องกับคำถาม:
${contextData || 'ไม่พบข้อมูลสินค้าที่ตรงกับคำค้นหา'}

คำถามจากผู้ใช้: ${userMessage}

กรุณาตอบคำถามในแบบน้องบอทน่ารัก และใช้ข้อมูลข้างต้นเท่านั้น`;

            return await this.generateResponse(fullPrompt, excelReader);
            
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการค้นหาและตอบ:', error);
            return 'ขออภัยค่ะ น้องบอทมีปัญหาในการค้นหาข้อมูล กรุณาลองใหม่อีกครั้งนะคะ 🥺';
        }
    }
}

module.exports = OpenAIClient;