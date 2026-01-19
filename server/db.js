const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 시간 제한
  connectionTimeoutMillis: 2000, // 연결 타임아웃
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
  process.exit(-1);
});

// 데이터베이스 테이블 초기화
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('📊 데이터베이스 테이블 초기화 시작...');

    // Users 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        major VARCHAR(100),
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        max_exp INTEGER DEFAULT 1000,
        character_title VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Records 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) CHECK (type IN ('PROJECT', 'CLASS', 'EXTRACURRICULAR', 'TEAMWORK')),
        date DATE,
        description TEXT,
        content TEXT,
        tags TEXT[],
        year VARCHAR(4),
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Community 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS community (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        major VARCHAR(100),
        level INTEGER,
        job VARCHAR(200),
        tags TEXT[],
        type VARCHAR(20) CHECK (type IN ('senior', 'friend')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Resume Base 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS resume_base (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(200),
        content TEXT,
        keywords TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Company Profiles 테이블 (JSONB 메타데이터 포함)
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_profiles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        year TEXT,
        half TEXT CHECK (half IN ('H1','H2')),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
      CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);
      CREATE INDEX IF NOT EXISTS idx_records_year ON records(year);
      CREATE INDEX IF NOT EXISTS idx_community_type ON community(type);
      CREATE INDEX IF NOT EXISTS idx_resume_base_user_id ON resume_base(user_id);
      CREATE INDEX IF NOT EXISTS idx_resume_base_category ON resume_base(category);
      CREATE INDEX IF NOT EXISTS idx_company_year_half ON company_profiles(year, half);
      CREATE INDEX IF NOT EXISTS idx_company_name_tsv ON company_profiles USING gin (to_tsvector('simple', name));
      CREATE INDEX IF NOT EXISTS idx_company_metadata_gin ON company_profiles USING gin (metadata jsonb_path_ops);
    `);

    console.log('✅ 테이블 초기화 완료');

    // 기본 사용자 데이터 존재 확인
    const userCheck = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log('📝 초기 사용자 데이터 생성 중...');
      await client.query(`
        INSERT INTO users (name, major, level, exp, max_exp, character_title)
        VALUES ('배혜진', '컴퓨터공학', 7, 420, 1000, '코드 숲의 탐험가')
      `);
      console.log('✅ 초기 사용자 생성 완료');
    }

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error);
    throw error;
  } finally {
    client.release();
  }
};

// 쿼리 헬퍼 함수
const query = (text, params) => pool.query(text, params);

// 트랜잭션 헬퍼
const getClient = () => pool.connect();

module.exports = {
  query,
  pool,
  getClient,
  initDatabase,
};
