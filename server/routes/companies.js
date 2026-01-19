const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: 회사 정보 (연도/반기 + JSONB 메타데이터)
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: 회사 목록 조회
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: string }
 *       - in: query
 *         name: half
 *         schema: { type: string, enum: [H1, H2] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: 이름/메타데이터 텍스트 검색
 *     responses:
 *       200:
 *         description: 회사 목록
 */
router.get('/', async (req, res) => {
  try {
    const { year, half, q } = req.query;

    let sql = `
      SELECT id, name, year, half, metadata, created_at as "createdAt", updated_at as "updatedAt"
      FROM company_profiles
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (year) {
      sql += ` AND year = $${idx++}`;
      params.push(year);
    }
    if (half) {
      sql += ` AND half = $${idx++}`;
      params.push(half);
    }
    if (q) {
      // 이름 + 메타데이터 풀텍스트 검색
      sql += ` AND to_tsvector('simple', name || ' ' || coalesce(metadata::text,'')) @@ plainto_tsquery($${idx++})`;
      params.push(q);
    }

    sql += ' ORDER BY created_at DESC LIMIT 200';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('회사 목록 조회 오류:', error);
    res.status(500).json({ success: false, error: '회사 목록 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: 회사 상세 조회
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 회사 상세
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT id, name, year, half, metadata, created_at as "createdAt", updated_at as "updatedAt"
       FROM company_profiles WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '회사를 찾을 수 없습니다' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('회사 상세 조회 오류:', error);
    res.status(500).json({ success: false, error: '회사 상세 조회 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: 회사 정보 추가
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               year: { type: string }
 *               half: { type: string, enum: [H1, H2] }
 *               metadata: { type: object }
 *     responses:
 *       201:
 *         description: 생성됨
 */
router.post('/', async (req, res) => {
  try {
    const { name, year, half, metadata } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'name은 필수입니다' });
    }

    const result = await query(
      `INSERT INTO company_profiles (name, year, half, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, year, half, metadata`,
      [name, year, half, metadata]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('회사 추가 오류:', error);
    res.status(500).json({ success: false, error: '회사 추가 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: 회사 정보 수정
 *     tags: [Companies]
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
 *             properties:
 *               name: { type: string }
 *               year: { type: string }
 *               half: { type: string, enum: [H1, H2] }
 *               metadata: { type: object }
 *     responses:
 *       200:
 *         description: 수정 완료
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year, half, metadata } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) { updates.push(`name = $${idx++}`); params.push(name); }
    if (year !== undefined) { updates.push(`year = $${idx++}`); params.push(year); }
    if (half !== undefined) { updates.push(`half = $${idx++}`); params.push(half); }
    if (metadata !== undefined) { updates.push(`metadata = $${idx++}`); params.push(metadata); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: '수정할 데이터가 없습니다' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const result = await query(
      `UPDATE company_profiles SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, year, half, metadata`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '회사를 찾을 수 없습니다' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('회사 수정 오류:', error);
    res.status(500).json({ success: false, error: '회사 수정 중 오류가 발생했습니다' });
  }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: 회사 정보 삭제
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 삭제 완료
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM company_profiles WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '회사를 찾을 수 없습니다' });
    }
    res.json({ success: true, message: '회사 정보가 삭제되었습니다' });
  } catch (error) {
    console.error('회사 삭제 오류:', error);
    res.status(500).json({ success: false, error: '회사 삭제 중 오류가 발생했습니다' });
  }
});

module.exports = router;
