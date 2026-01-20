const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini AI 초기화
const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  Gemini API 키가 설정되지 않았습니다');
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
};

const geminiModel = initGemini();

// Gemini 체크 미들웨어
const checkGemini = (req, res, next) => {
  if (!geminiModel) {
    return res.status(503).json({
      success: false,
      error: 'Gemini AI 서비스 일시 장애',
      message: 'API 키가 설정되지 않았습니다. .env 파일을 확인해주세요'
    });
  }
  next();
};

/**
 * @swagger
 * /api/ai/resume:
 *   post:
 *     summary: 자기소개서 초안 생성 (Gemini)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, companyInfo, jobType, question]
 *             properties:
 *               userId: { type: integer }
 *               companyInfo: { type: string }
 *               jobType: { type: string }
 *               question: { type: string }
 *               recordIds: { type: array, items: { type: integer } }
 *     responses:
 *       200:
 *         description: 초안 생성 결과
 */
// 1. 자기소개서 초안 생성
router.post('/resume', checkGemini, async (req, res) => {
  try {
    const { userId, companyInfo, jobType, question, recordIds } = req.body;

    if (!userId || !companyInfo || !jobType || !question) {
      return res.status(400).json({
        success: false,
        error: 'userId, companyInfo, jobType, question은 필수입니다'
      });
    }

    // 사용자 활동 기록 조회
    let recordsQuery = 'SELECT title, type, description, content, tags, date FROM records WHERE user_id = $1';
    const params = [userId];

    if (recordIds && recordIds.length > 0) {
      recordsQuery += ` AND id = ANY($2)`;
      params.push(recordIds);
    }

    recordsQuery += ' ORDER BY date DESC';

    const recordsResult = await query(recordsQuery, params);
    const usedRecords = recordsResult.rows;

    // 활동 기록을 텍스트로 변환
    const activityData = usedRecords.map(record => 
      `[${record.type}] ${record.title} (${record.date?.toISOString().split('T')[0] || '날짜 미상'})\n설명: ${record.description || '없음'}\n${record.content ? '상세: ' + record.content.substring(0, 200) : ''}`
    ).join('\n\n');

    // Gemini 프롬프트
    const prompt = `당신은 대학생 취업 컨설턴트입니다. 아래 정보를 바탕으로 전문적이고 설득력 있는 자기소개서 초안을 작성해주세요.

**사용자 활동 기록:**
${activityData || '활동 기록이 없습니다.'}

**지원 기업:** ${companyInfo}
**지원 직무:** ${jobType}
**자소서 문항:** ${question}

**작성 요구사항:**
1. STAR 기법(Situation, Task, Action, Result)을 활용하여 구체적으로 작성
2. 위 활동 기록에서 관련성 높은 경험을 선택하여 구체적 수치나 성과 포함
3. 한국어로 자연스럽고 진정성 있게 작성
4. 분량: 800-1000자
5. 문항에 직접적으로 답변하는 구조로 작성

**자기소개서 초안을 작성해주세요:**`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const draft = response.text();

    // 글자 수 계산 (공백 제외)
    const wordCount = draft.replace(/\s/g, '').length;

    res.json({
      success: true,
      data: {
        draft,
        wordCount,
        usedRecords: usedRecords.map(r => ({ id: r.id, title: r.title })),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('자기소개서 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: 'AI 서비스 응답 실패',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/interview:
 *   post:
 *     summary: 면접 예상 질문 생성 (Gemini)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, companyInfo]
 *             properties:
 *               userId: { type: integer }
 *               companyInfo: { type: string }
 *               jobType: { type: string }
 *               recordIds: { type: array, items: { type: integer } }
 *     responses:
 *       200:
 *         description: 질문 목록
 */
// 2. 면접 예상 질문 생성
router.post('/interview', checkGemini, async (req, res) => {
  try {
    const { userId, companyInfo, jobType, recordIds } = req.body;

    if (!userId || !companyInfo) {
      return res.status(400).json({
        success: false,
        error: 'userId와 companyInfo는 필수입니다'
      });
    }

    // 사용자 활동 기록 조회
    let recordsQuery = 'SELECT title, type, description, content, tags, date FROM records WHERE user_id = $1';
    const params = [userId];

    if (recordIds && recordIds.length > 0) {
      recordsQuery += ` AND id = ANY($2)`;
      params.push(recordIds);
    }

    recordsQuery += ' ORDER BY date DESC LIMIT 10';

    const recordsResult = await query(recordsQuery, params);
    const usedRecords = recordsResult.rows;

    // 활동 기록을 텍스트로 변환
    const activityData = usedRecords.map(record => 
      `[${record.type}] ${record.title} (${record.date?.toISOString().split('T')[0] || '날짜 미상'})\n설명: ${record.description || '없음'}`
    ).join('\n\n');

    // Gemini 프롬프트
    const prompt = `당신은 면접관입니다. 아래 정보를 바탕으로 예상 면접 질문 5개를 생성해주세요.

**사용자 활동 기록:**
${activityData || '활동 기록이 없습니다.'}

**지원 기업:** ${companyInfo}
**지원 직무:** ${jobType || '미지정'}

각 질문에 대해 다음 형식의 JSON 배열로 응답해주세요:
[
  {
    "question": "구체적인 면접 질문",
    "intent": "질문의 의도 (무엇을 평가하려는가)",
    "tip": "답변 팁 (STAR 기법 등 구체적 조언)"
  }
]

**요구사항:**
1. 활동 기록과 연관된 실질적이고 구체적인 질문
2. 기술, 협업, 문제해결, 성장 등 다양한 영역의 질문
3. 한국어로 작성
4. 정확한 JSON 형식으로만 응답 (추가 설명 불필요)`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // JSON 파싱 (마크다운 코드 블록 제거)
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let questions;
    try {
      questions = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', text);
      throw new Error('AI 응답 형식이 올바르지 않습니다');
    }

    res.json({
      success: true,
      data: {
        questions: questions.slice(0, 5), // 최대 5개
        totalQuestions: questions.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('면접 질문 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: 'AI 서비스 응답 실패',
      message: error.message
    });
  }
});

module.exports = router;
