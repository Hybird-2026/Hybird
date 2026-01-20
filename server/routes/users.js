const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 사용자 정보 조회
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 사용자 정보
 */
// 1. 사용자 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT id, name, major, level, exp, max_exp as "maxExp", character_title as "characterTitle", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 조회 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: 사용자 프로필 수정
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               major:
 *                 type: string
 *               characterTitle:
 *                 type: string
 *     responses:
 *       200:
 *         description: 업데이트 결과
 */
// 2. 사용자 프로필 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, major, characterTitle } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (major !== undefined) {
      updates.push(`major = $${paramCount++}`);
      values.push(major);
    }
    if (characterTitle !== undefined) {
      updates.push(`character_title = $${paramCount++}`);
      values.push(characterTitle);
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
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, major, character_title as "characterTitle"`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('프로필 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '프로필 수정 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/exp:
 *   post:
 *     summary: 경험치 추가 및 레벨업 처리
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expAmount:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 추가된 경험치 결과
 */
// 3. 경험치 추가 (레벨업 처리)
router.post('/:id/exp', async (req, res) => {
  try {
    const { id } = req.params;
    const { expAmount, reason } = req.body;

    if (!expAmount || expAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: '유효한 경험치 값을 입력해주세요'
      });
    }

    // 현재 사용자 정보 조회
    const userResult = await query(
      'SELECT level, exp, max_exp FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다'
      });
    }

    let { level, exp, max_exp } = userResult.rows[0];
    exp += expAmount;
    let leveledUp = false;
    let previousLevel = level;

    // 레벨업 처리
    while (exp >= max_exp) {
      exp -= max_exp;
      level += 1;
      max_exp = Math.floor(max_exp * 1.2); // 레벨당 필요 경험치 20% 증가
      leveledUp = true;
    }

    // 업데이트
    await query(
      'UPDATE users SET level = $1, exp = $2, max_exp = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
      [level, exp, max_exp, id]
    );

    const message = leveledUp 
      ? `🎉 레벨 업! Lv.${previousLevel} → Lv.${level}`
      : `+${expAmount} EXP 획득!`;

    res.json({
      success: true,
      message,
      data: {
        level,
        exp,
        maxExp: max_exp,
        leveledUp,
        previousLevel: leveledUp ? previousLevel : undefined,
        remainingExp: max_exp - exp,
        reason
      }
    });
  } catch (error) {
    console.error('경험치 추가 오류:', error);
    res.status(500).json({
      success: false,
      error: '경험치 추가 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
