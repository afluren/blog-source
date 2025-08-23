---
title: 动态问卷调查
layout: page
---

<h2>在线问卷调查</h2>
<p>请对下列随机抽取的4个汇报内容，从五个方面进行评分（1为最差，5为最佳）。</p>

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
                formHTML += `<legend>汇报 ${index + 1}：${question['本周汇报和下周计划']} (题号: ${question.id})</legend>`;
                
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