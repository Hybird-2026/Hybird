const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: 활동 기록 목록 조회
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 기록 목록
 */
// 1. 활동 기록 목록 조회
router.get('/', async (req, res) => {
  try {
    const { userId, year, type, status, limit = 100, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId는 필수입니다'
      });
    }

    let queryText = `
      SELECT id, user_id as "userId", title, type, date, description, content, 
             tags, year, status, created_at as "createdAt", updated_at as "updatedAt"
      FROM records 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramCount = 2;

    if (year) {
      queryText += ` AND year = $${paramCount++}`;
      params.push(year);
    }
    if (type) {
      queryText += ` AND type = $${paramCount++}`;
      params.push(type);
    }
    if (status) {
      queryText += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // 전체 개수 조회
    const countQuery = await query(
      'SELECT COUNT(*) FROM records WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countQuery.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('활동 기록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '활동 기록 조회 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: 활동 기록 상세 조회
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 기록 상세
 */
// 2. 활동 기록 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, user_id as "userId", title, type, date, description, content, 
              tags, year, status, created_at as "createdAt", updated_at as "updatedAt"
       FROM records WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '활동 기록을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('활동 기록 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '활동 기록 조회 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: 활동 기록 추가
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, type]
 *             properties:
 *               userId: { type: integer }
 *               title: { type: string }
 *               type: { type: string }
 *               date: { type: string, format: date }
 *               description: { type: string }
 *               content: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               status: { type: string }
 *     responses:
 *       201:
 *         description: 생성됨
 */
// 3. 활동 기록 추가
router.post('/', async (req, res) => {
  try {
    const { userId, title, type, date, description, content, tags, status } = req.body;

    if (!userId || !title || !type) {
      return res.status(400).json({
        success: false,
        error: 'userId, title, type은 필수입니다'
      });
    }

    // 연도 추출
    const year = date ? new Date(date).getFullYear().toString() : new Date().getFullYear().toString();

    const result = await query(
      `INSERT INTO records (user_id, title, type, date, description, content, tags, year, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title`,
      [userId, title, type, date, description, content, tags, year, status]
    );

    // 경험치 추가 (15 EXP)
    await query(
      'UPDATE users SET exp = exp + 15, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: '활동 기록이 추가되었습니다 (+15 EXP)',
      data: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        expGained: 15
      }
    });
  } catch (error) {
    console.error('활동 기록 추가 오류:', error);
    res.status(500).json({
      success: false,
      error: '활동 기록 추가 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: 활동 기록 수정
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 수정 완료
 */
// 4. 활동 기록 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, date, description, content, tags, status } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      values.push(type);
    }
    if (date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(date);
      const year = new Date(date).getFullYear().toString();
      updates.push(`year = $${paramCount++}`);
      values.push(year);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramCount++}`);
      values.push(tags);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: '수정할 데이터가 없습니다'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE records SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, title`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '활동 기록을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '활동 기록이 수정되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('활동 기록 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '활동 기록 수정 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: 활동 기록 삭제
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 삭제 완료
 */
// 5. 활동 기록 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM records WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '활동 기록을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '활동 기록이 삭제되었습니다'
    });
  } catch (error) {
    console.error('활동 기록 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '활동 기록 삭제 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
