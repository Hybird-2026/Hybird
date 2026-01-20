const express = require('express');
const router = express.Router();
const axios = require('axios');
const { query } = require('../db');

// Lambda 엔드포인트
const LAMBDA_RESUME_URL = process.env.LAMBDA_RESUME_URL;
const LAMBDA_INTERVIEW_URL = process.env.LAMBDA_INTERVIEW_URL;

// Axios 옵션/에러 포맷터
const axiosOptions = { timeout: 180000 };
const formatAxiosError = (err) => {
  if (err.response) return `status=${err.response.status} data=${JSON.stringify(err.response.data).slice(0, 500)}`;
  if (err.request) return 'no-response-from-lambda';
  return err.message;
};

// Lambda 체크 미들웨어
const checkLambda = (req, res, next) => {
  if (!LAMBDA_RESUME_URL || !LAMBDA_INTERVIEW_URL) {
    return res.status(503).json({
      success: false,
      error: 'Gemini AI 서비스 일시 장애',
      message: 'Lambda 엔드포인트가 설정되지 않았습니다. .env 파일을 확인해주세요'
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
// 1. 자기소개서 초안 생성 (Lambda 호출)
router.post('/resume', checkLambda, async (req, res) => {
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

    // Lambda 호출
    console.log('[AI] 자기소개서 생성 Lambda 호출...');
    const lambdaResponse = await axios.post(LAMBDA_RESUME_URL, {
      companyInfo,
      jobType,
      question,
      activityData
    }, axiosOptions);

    const lambdaData = typeof lambdaResponse.data === 'string'
      ? JSON.parse(lambdaResponse.data)
      : lambdaResponse.data;

    res.json({
      success: true,
      data: {
        ...lambdaData.data,
        usedRecords: usedRecords.map(r => ({ id: r.id, title: r.title }))
      }
    });

  } catch (error) {
    console.error('자기소개서 생성 오류:', formatAxiosError(error));
    res.status(500).json({
      success: false,
      error: 'AI 서비스 응답 실패',
      message: error.response?.data?.message || error.message
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
// 2. 면접 예상 질문 생성 (Lambda 호출)
router.post('/interview', checkLambda, async (req, res) => {
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

    // Lambda 호출
    console.log('[AI] 면접 질문 생성 Lambda 호출...');
    const lambdaResponse = await axios.post(LAMBDA_INTERVIEW_URL, {
      companyInfo,
      jobType,
      activityData
    }, axiosOptions);

    const lambdaData = typeof lambdaResponse.data === 'string'
      ? JSON.parse(lambdaResponse.data)
      : lambdaResponse.data;

    res.json({
      success: true,
      data: lambdaData.data
    });

  } catch (error) {
    console.error('면접 질문 생성 오류:', formatAxiosError(error));
    res.status(500).json({
      success: false,
      error: 'AI 서비스 응답 실패',
      message: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
