const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * @swagger
 * /api/analytics/stats/{userId}:
 *   get:
 *     summary: 사용자 통계 조회
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 통계 데이터
 */
// 1. 사용자 통계 조회
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 전체 기록 수
    const totalRecordsResult = await query(
      'SELECT COUNT(*) as total FROM records WHERE user_id = $1',
      [userId]
    );

    // 타입별 기록 수
    const recordsByTypeResult = await query(
      `SELECT type, COUNT(*) as count 
       FROM records 
       WHERE user_id = $1 
       GROUP BY type`,
      [userId]
    );

    const recordsByType = {};
    recordsByTypeResult.rows.forEach(row => {
      recordsByType[row.type] = parseInt(row.count);
    });

    // 연도별 기록 수
    const recordsByYearResult = await query(
      `SELECT year, COUNT(*) as count 
       FROM records 
       WHERE user_id = $1 
       GROUP BY year 
       ORDER BY year DESC`,
      [userId]
    );

    const recordsByYear = {};
    recordsByYearResult.rows.forEach(row => {
      recordsByYear[row.year] = parseInt(row.count);
    });

    // 최근 활동
    const recentActivityResult = await query(
      `SELECT date as "lastRecordDate"
       FROM records 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT 1`,
      [userId]
    );

    // 이번 달 기록 수
    const thisMonthResult = await query(
      `SELECT COUNT(*) as count 
       FROM records 
       WHERE user_id = $1 
       AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [userId]
    );

    // 사용자 레벨 정보
    const userResult = await query(
      'SELECT level, exp, max_exp FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];
    const progressPercentage = user ? Math.round((user.exp / user.max_exp) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalRecords: parseInt(totalRecordsResult.rows[0].total),
        recordsByType,
        recordsByYear,
        recentActivity: {
          lastRecordDate: recentActivityResult.rows[0]?.lastRecordDate || null,
          recordsThisMonth: parseInt(thisMonthResult.rows[0].count)
        },
        levelInfo: {
          currentLevel: user?.level || 1,
          progressPercentage,
          rank: progressPercentage >= 95 ? '상위 5%' : progressPercentage >= 90 ? '상위 10%' : '성장 중'
        }
      }
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '통계 조회 중 오류가 발생했습니다'
    });
  }
});

/**
 * @swagger
 * /api/analytics/dashboard/{userId}:
 *   get:
 *     summary: 대시보드 데이터 조회
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 대시보드 데이터
 */
// 2. 대시보드 데이터 조회
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { year = new Date().getFullYear().toString() } = req.query;

    // 사용자 정보
    const userResult = await query(
      'SELECT name, level, exp, max_exp as "maxExp" FROM users WHERE id = $1',
      [userId]
    );

    // 통계 정보
    const statsResult = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE type = 'PROJECT') as total_projects,
        COUNT(*) as total_records
       FROM records 
       WHERE user_id = $1`,
      [userId]
    );

    // 최근 기록 (최대 5개)
    const recentRecordsResult = await query(
      `SELECT id, title, type, date 
       FROM records 
       WHERE user_id = $1 AND year = $2
       ORDER BY date DESC 
       LIMIT 5`,
      [userId, year]
    );

    const stats = statsResult.rows[0];
    const competencyIndex = Math.min(stats.total_records * 7.7, 100).toFixed(1);
    const collaborationLevel = Math.min(Math.floor(stats.total_records / 3), 10);

    res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        stats: {
          totalProjects: parseInt(stats.total_projects),
          competencyIndex: parseFloat(competencyIndex),
          collaborationLevel
        },
        recentRecords: recentRecordsResult.rows
      }
    });
  } catch (error) {
    console.error('대시보드 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '대시보드 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
