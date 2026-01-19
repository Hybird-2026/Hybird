const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * @swagger
 * /api/community:
 *   get:
 *     summary: 선배/친구 목록 조회
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [senior, friend] }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 커뮤니티 목록
 */
// 1. 선배/친구 목록 조회
router.get('/', async (req, res) => {
  try {
    const { type, tag, limit = 100 } = req.query;

    let queryText = `
      SELECT id, name, major, level, job, tags, type, created_at as "createdAt"
      FROM community
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (type) {
      queryText += ` AND type = $${paramCount++}`;
      params.push(type);
    }

    if (tag) {
      queryText += ` AND $${paramCount++} = ANY(tags)`;
      params.push(tag);
    }

    queryText += ` ORDER BY level DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('커뮤니티 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '커뮤니티 목록 조회 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/community:
 *   post:
 *     summary: 커뮤니티 멤버 추가
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string }
 *               major: { type: string }
 *               level: { type: integer }
 *               job: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               type: { type: string, enum: [senior, friend] }
 *     responses:
 *       201:
 *         description: 생성됨
 */
// 2. 커뮤니티 멤버 추가
router.post('/', async (req, res) => {
  try {
    const { name, major, level, job, tags, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'name과 type은 필수입니다'
      });
    }

    const result = await query(
      `INSERT INTO community (name, major, level, job, tags, type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name`,
      [name, major, level, job, tags, type]
    );

    res.status(201).json({
      success: true,
      message: '커뮤니티 멤버가 추가되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('커뮤니티 멤버 추가 오류:', error);
    res.status(500).json({
      success: false,
      error: '커뮤니티 멤버 추가 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
