const XLSX = require('xlsx');
const path = require('path');

class ExcelReader {
    constructor() {
        this.data = null;
        this.loadData();
    }

    loadData() {
        try {
            const filePath = path.join(__dirname, 'item-asset.xlsx');
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // แปลงข้อมูลเป็น JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // ข้าม header row และแปลงเป็น object array
            const headers = [
                'internal_product_code',      // A - รหัสภายในสินค้า (ไม่ให้ค้นหาได้)
                'product_code',               // B - รหัสสินค้า
                'product_name_th_long',       // C - ชื่อสินค้า/หนังสือภาษาไทย (แบบยาว)
                'product_name_en_long',       // D - ชื่อสินค้า/หนังสือภาษาอังกฤษ (แบบยาว)
                'product_name_th_short',      // E - ชื่อสินค้า/หนังสือภาษาไทย (แบบสั้น)
                'product_name_en_short',      // F - ชื่อสินค้า/หนังสือภาษาอังกฤษ (แบบสั้น)
                'subject_internal_code',      // G - รหัสภายในกลุ่มสาระการเรียนรู้
                'subject_name_th',            // H - ชื่อกลุ่มสาระการเรียนรู้ (ไทย)
                'subject_name_en',            // I - ชื่อกลุ่มสาระการเรียนรู้ (อังกฤษ)
                'prefix_internal_code',       // J - รหัสภายในคำนำหน้าชื่อสินค้า/หนังสือ
                'prefix_name_th',             // K - คำนำหน้าชื่อสินค้า/หนังสือ (ไทย)
                'prefix_name_en',             // L - คำนำหน้าชื่อสินค้า/หนังสือ (อังกฤษ)
                'book_type_internal_code',    // M - รหัสภายในประเภทหนังสือ
                'book_type_name_th',          // N - ชื่อประเภทหนังสือ (ไทย)
                'book_type_name_en',          // O - ชื่อประเภทหนังสือ (อังกฤษ)
                'sequence',                   // P - ลำดับ
                'is_new_product',             // Q - สินค้าใหม่
                'has_ebook',                  // R - มี Ebook หรือไม่
                'image_url',                  // S - URL รูปภาพสินค้า หรือหนังสือ
                'grade_internal_code',        // T - รหัสภายในชั้นปี
                'grade_name_th',              // U - ชื่อชั้นปี (ไทย)
                'grade_name_en'               // V - ชื่อชั้นปี (อังกฤษ)
            ];

            this.data = jsonData.slice(1).map(row => {
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = row[index] || '';
                });
                return item;
            }).filter(item => item.product_code); // กรองเฉพาะรายการที่มีรหัสสินค้า

            console.log(`โหลดข้อมูลสินค้าสำเร็จ: ${this.data.length} รายการ`);
            
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล Excel:', error);
            this.data = [];
        }
    }

    // ค้นหาสินค้าด้วยคำค้น
    searchProducts(query) {
        if (!this.data || this.data.length === 0) {
            return [];
        }

        const searchTerm = query.toLowerCase();
        
        return this.data.filter(item => {
            return (
                item.product_code.toLowerCase().includes(searchTerm) ||
                item.product_name_th_long.toLowerCase().includes(searchTerm) ||
                item.product_name_th_short.toLowerCase().includes(searchTerm) ||
                item.product_name_en_long.toLowerCase().includes(searchTerm) ||
                item.product_name_en_short.toLowerCase().includes(searchTerm) ||
                item.subject_name_th.toLowerCase().includes(searchTerm) ||
                item.subject_name_en.toLowerCase().includes(searchTerm) ||
                item.book_type_name_th.toLowerCase().includes(searchTerm) ||
                item.book_type_name_en.toLowerCase().includes(searchTerm) ||
                item.grade_name_th.toLowerCase().includes(searchTerm) ||
                item.grade_name_en.toLowerCase().includes(searchTerm)
            );
        });
    }

    // ดึงข้อมูลทั้งหมด (สำหรับส่งให้ OpenAI เป็น context)
    getAllData() {
        return this.data || [];
    }

    // แปลงข้อมูลเป็น string สำหรับส่งให้ OpenAI
    getDataAsString() {
        if (!this.data || this.data.length === 0) {
            return 'ไม่พบข้อมูลสินค้า';
        }

        return this.data.map(item => {
            return `รหัสสินค้า: ${item.product_code}
ชื่อสินค้า (ไทย): ${item.product_name_th_long}
ชื่อสินค้า (อังกฤษ): ${item.product_name_en_long}
กลุ่มสาระ: ${item.subject_name_th}
ประเภท: ${item.book_type_name_th}
ชั้นปี: ${item.grade_name_th}
สินค้าใหม่: ${item.is_new_product ? 'ใช่' : 'ไม่'}
มี E-book: ${item.has_ebook ? 'ใช่' : 'ไม่'}
---`;
        }).join('\n');
    }

    // สรุปข้อมูลพื้นฐานสำหรับ OpenAI
    getDataSummary() {
        if (!this.data || this.data.length === 0) {
            return 'ไม่พบข้อมูลสินค้า';
        }

        const subjects = [...new Set(this.data.map(item => item.subject_name_th).filter(Boolean))];
        const bookTypes = [...new Set(this.data.map(item => item.book_type_name_th).filter(Boolean))];
        const grades = [...new Set(this.data.map(item => item.grade_name_th).filter(Boolean))];

        return {
            totalProducts: this.data.length,
            subjects: subjects,
            bookTypes: bookTypes,
            grades: grades,
            sampleProducts: this.data.slice(0, 5).map(item => ({
                product_code: item.product_code,
                product_name_th: item.product_name_th_long,
                subject: item.subject_name_th,
                grade: item.grade_name_th
            }))
        };
    }
}

module.exports = ExcelReader;