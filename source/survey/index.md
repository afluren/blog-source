---
title: 动态问卷调查
layout: page
---

<h2>在线问卷调查</h2>
<p>
阅读相应汇报内容，从5个维度进行评分，分值为1-5，<b>1代表非常不符合，3代表一般，5代表非常符合</b>。

评分细则如下：
<h4>（一）内容的翔实程度：</h4>

此维度评估报告是否具体阐述了学习内容的细节，并且能够准确地对应上所学内容的主题，体现了报告的可信度和学生对所学内容的理解程度。例如，通过引用关键术语、论文名称或核心公式等方式来支撑叙述。

<h4>（二）关联度：</h4>

此维度评估本周工作内容与学生核心研究方向的契合程度，所学内容应当契合学生选题，对于并不完全契合的学习内容，应当解释自己的思路。

<h4>（三）工作量：</h4>

此维度综合评估报告所反映的工作投入和钻研深度。报告中展现出的工作内容要能支撑起学生一周的投入，评估将侧重于质量而非数量：对单一任务的深入探索，远比对多个任务的浅尝辄止更有价值。会根据学生所处阶段判断学生一周的基本工作量。

<h4>（四）规划性：</h4>

此维度评估学生对研究进程的自我驱动和管理能力。学生需在报告中对下周的计划进行叙述，体现出学生对当前探索方向的思考和规划，合理地延续本周的工作。一个好的计划应当是具体、可执行的，而不仅仅是一个模糊的方向。

<h4>（五）批判性思考：</h4>

此维度评估学生对所学内容的吸收程度和主动思考能力。报告中不仅要客观翔实地叙述出所学内容，最好在学习之上提出自己的理解和看法，一些目前所学的问题，一些新的思路，或者是与旧的知识的联动。

感谢参与！
</p>

<div id="survey-container">
    <p id="loading-message">正在为您生成专属问卷，请稍候...</p>
    <form id="survey-form" style="display: none;"></form>
</div>

<div id="response-message" style="margin-top: 20px;"></div>

<style>
    fieldset { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    legend { font-weight: bold; font-size: 1.2em; }
    .rating-group { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .rating-group label { flex-basis: 30%; }
    .rating-group .options { flex-basis: 70%; text-align: right; }
    .rating-group input[type="radio"] { margin: 0 5px; }
    .question-text {white-space: pre-wrap;}
</style>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const loadingMessage = document.getElementById('loading-message');
        const form = document.getElementById('survey-form');
        const responseMessage = document.getElementById('response-message');

        let questionsData = []; // 用来存储从后端获取的4个问题

        // 维度定义 (key -> 中文名)
        const dimensions = {
            richness: '内容的翔实程度',
            relevance: '关联度',
            workload: '工作量',
            planning: '规划性',
            criticality: '批判性思考'
        };
        function escapeHTML(str) {
            if (str === null || str === undefined) {
                return '';
            }
            const p = document.createElement('p');
            p.textContent = str;
            return p.innerHTML;
        }

        // 1. 获取并渲染问题的函数 (不变)
        async function initializeSurvey() {
            try {
                const response = await fetch('/api/get-questions');
                if (!response.ok) throw new Error('无法从服务器获取题目');
                questionsData = await response.json();
                
                if (!questionsData || questionsData.length !== 4) {
                    loadingMessage.innerText = `错误：需要4个题目，但实际获取到 ${questionsData.length} 个。请检查题库数量。`;
                    return;
                }

                renderForm(questionsData);
                loadingMessage.style.display = 'none';
                form.style.display = 'block';
            } catch (error) {
                loadingMessage.style.color = 'red';
                loadingMessage.innerText = '加载问卷失败：' + error.message;
            }
        }

        // 2. 根据问题数据渲染HTML表单 (核心改造)
        function renderForm(questions) {
            let formHTML = '';
            questions.forEach((question, index) => {
                // 为每个题目创建一个 <fieldset>
                console.log(question);
                formHTML += `<fieldset>`;
                formHTML += `<legend>汇报 ${index + 1} 选题：${escapeHTML(question.title)} (题号: ${escapeHTML(question.id)})</legend>`;
                formHTML += `<p class="question-text">${escapeHTML(question.text)}</p>`;
                fromHTML += `<p>请对以上题目进行评分，分值为1-5，1代表非常不符合，2代表比较不符合，3代表一般，4代表比较符合，5代表非常符合。</p>`;
                
                // 存储题号
                formHTML += `<input type="hidden" name="topic_${index}_id" value="${question.id}">`;

                // 循环生成5个维度的评分项
                for (const [key, name] of Object.entries(dimensions)) {
                    formHTML += `<div class="rating-group">`;
                    formHTML += `<label>${name}:</label>`;
                    formHTML += `<div class="options">`;
                    for (let i = 1; i <= 5; i++) {
                        formHTML += `
                            <label>
                                <input type="radio" name="topic_${index}_${key}" value="${i}" required> ${i}
                            </label>
                        `;
                    }
                    formHTML += `</div></div>`;
                }
                formHTML += `</fieldset>`;
            });
            formHTML += `<button type="submit" id="submit-btn">提交所有评分</button>`;
            form.innerHTML = formHTML;
        }

        // 3. 监听表单提交事件 (核心改造)
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerText = '正在提交...';
            responseMessage.innerText = '';

            const formData = new FormData(form);
            const submissionData = [];

            // 从 FormData 中提取结构化数据
            questionsData.forEach((question, index) => {
                const topicRating = {
                    id: formData.get(`topic_${index}_id`),
                    ratings: {}
                };
                for (const key of Object.keys(dimensions)) {
                    topicRating.ratings[key] = formData.get(`topic_${index}_${key}`);
                }
                submissionData.push(topicRating);
            });
            
            try {
                const response = await fetch('/api/submit-survey', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(submissionData), // 发送包含4个对象的新数据结构
                });
                
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);

                responseMessage.style.color = 'green';
                responseMessage.innerText = result.message;
                form.reset();
            } catch (error) {
                responseMessage.style.color = 'red';
                responseMessage.innerText = '提交失败：' + error.message;
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = '提交所有评分';
            }
        });

        // 页面加载后立即开始初始化问卷
        initializeSurvey();
    });
</script>