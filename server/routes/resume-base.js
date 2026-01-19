const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * @swagger
 * /api/resume-base/{userId}:
 *   get:
 *     summary: 자기소개서 베이스 조회
 *     tags: [ResumeBase]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 베이스 목록
 */
// 1. 자기소개서 베이스 조회
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category } = req.query;

    let queryText = `
      SELECT id, category, title, content, keywords, 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM resume_base
      WHERE user_id = $1
    `;
    const params = [userId];

    if (category) {
      queryText += ` AND category = $2`;
      params.push(category);
    }

    queryText += ` ORDER BY updated_at DESC`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('자기소개서 베이스 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '자기소개서 베이스 조회 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/resume-base/{userId}:
 *   put:
 *     summary: 자기소개서 베이스 수정/추가
 *     tags: [ResumeBase]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category]
 *             properties:
 *               category: { type: string }
 *               title: { type: string }
 *               content: { type: string }
 *               keywords: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: 업데이트 결과
 */
// 2. 자기소개서 베이스 수정/추가 (UPSERT)
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, title, content, keywords } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'category는 필수입니다'
      });
    }

    // 기존 데이터 확인
    const checkResult = await query(
      'SELECT id FROM resume_base WHERE user_id = $1 AND category = $2',
      [userId, category]
    );

    let result;
    if (checkResult.rows.length > 0) {
      // 업데이트
      result = await query(
        `UPDATE resume_base 
         SET title = $1, content = $2, keywords = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4 AND category = $5
         RETURNING id, category`,
        [title, content, keywords, userId, category]
      );
    } else {
      // 신규 추가
      result = await query(
        `INSERT INTO resume_base (user_id, category, title, content, keywords)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, category`,
        [userId, category, title, content, keywords]
      );
    }

    res.json({
      success: true,
      message: '자기소개서 베이스가 업데이트되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('자기소개서 베이스 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '자기소개서 베이스 수정 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
