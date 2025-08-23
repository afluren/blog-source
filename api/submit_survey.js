// /api/submit-survey.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const submittedData = req.body; // 接收包含4个对象评分的数组

        // --- 数据校验 ---
        if (!Array.isArray(submittedData) || submittedData.length !== 4) {
            return res.status(400).json({ message: `Data format error: Expected an array of 4 topics, but received ${submittedData.length}.` });
        }

        // --- 准备写入表格的数据行 (核心改造) ---
        // 创建一个对象，其键(key)必须与你的Google Sheet表头完全一致
        const newRow = {
            // 第一列：提交时间
            '提交时间': new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),

            // 第二部分：汇报一 (从 submittedData[0] 获取)
            '汇报一题号': submittedData[0].id,
            '汇报一内容的翔实程度': submittedData[0].ratings.richness,
            '汇报一关联度': submittedData[0].ratings.relevance,
            '汇报一工作量': submittedData[0].ratings.workload,
            '汇报一规划性': submittedData[0].ratings.planning,
            '汇报一批判性思考': submittedData[0].ratings.criticality,

            // 第三部分：汇报二 (从 submittedData[1] 获取)
            '汇报二题号': submittedData[1].id,
            '汇报二内容的翔实程度': submittedData[1].ratings.richness,
            '汇报二关联度': submittedData[1].ratings.relevance,
            '汇报二工作量': submittedData[1].ratings.workload,
            '汇报二规划性': submittedData[1].ratings.planning,
            '汇报二批判性思考': submittedData[1].ratings.criticality,

            // 第四部分：汇报三 (从 submittedData[2] 获取)
            '汇报三题号': submittedData[2].id,
            '汇报三内容的翔实程度': submittedData[2].ratings.richness,
            '汇报三关联度': submittedData[2].ratings.relevance,
            '汇报三工作量': submittedData[2].ratings.workload,
            '汇报三规划性': submittedData[2].ratings.planning,
            '汇报三批判性思考': submittedData[2].ratings.criticality,

            // 第五部分：汇报四 (从 submittedData[3] 获取)
            '汇报四题号': submittedData[3].id,
            '汇报四内容的翔实程度': submittedData[3].ratings.richness,
            '汇报四关联度': submittedData[3].ratings.relevance,
            '汇报四工作量': submittedData[3].ratings.workload,
            '汇报四规划性': submittedData[3].ratings.planning,
            '汇报四批判性思考': submittedData[3].ratings.criticality,
        };

        // --- 连接 Google Sheets 并写入数据 (这部分逻辑不变) ---
        const doc = new GoogleSpreadsheet('1-LOLMJf3sMRexlGUSN8JsG6owCKag9S80KA1OZzbd1E'); // 替换成你的 Google Sheet ID
        const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0]; // 获取第一个工作表
        await sheet.addRow(newRow); // 将我们精心构造的 newRow 对象写入

        res.status(200).json({ message: '提交成功，非常感谢您的评分！' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: '服务器出现错误，请稍后再试。' });
    }
}