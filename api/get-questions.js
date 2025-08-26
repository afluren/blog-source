// /api/get-questions.js
const { GoogleSpreadsheet } = require('google-spreadsheet');

// 要从题库中随机抽取多少个问题
const QUESTION_COUNT = 4;

module.exports = async function handler(req, res) {
    try {
        const doc = new GoogleSpreadsheet('1-LOLMJf3sMRexlGUSN8JsG6owCKag9S80KA1OZzbd1E'); // 再次替换成你的 Sheet ID

        // 使用我们已经设置好的环境变量进行认证
        const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();

        // 通过标题准确地找到“题库”工作表
        const sheet = doc.sheetsByTitle['题库'];
        if (!sheet) {
            throw new Error("工作表 '题库' 未找到！");
        }

        // 读取所有行
        const rows = await sheet.getRows();
        const allQuestions = rows.map(row => ({
            id: row.id,
            text: row.本周汇报和下周计划,
            title: row.选题内容,
        }));

        // --- 核心随机抽取逻辑 ---
        // 使用 Fisher-Yates (aka Knuth) Shuffle 算法打乱数组顺序
        const shuffled = [...allQuestions]; // 创建一个副本
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 交换元素
        }

        // 从打乱后的数组中选取前 N 个问题
        const selectedQuestions = shuffled.slice(0, QUESTION_COUNT);

        // let special = shuffled.filter(q => q.id == 270);
        // selectedQuestions.push(special[0]); // 手动添加一个特殊问题

        // 将随机选取的问题作为 JSON 发送给前端
        res.status(200).json(selectedQuestions);

    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: '获取题目失败。', error: error.message });
    }
}