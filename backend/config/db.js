module.exports = {
  development: {
    username: 'w40XvS5PjP',
    password: 'soc8g5uNK1',
    database: 'w40XvS5PjP',
    host: 'remotemysql.com',
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    },
    connectionTimeout: 300000,
    requestTimeout: 300000,
    pool: {
      max: 50,
      acquire: 300000,
      idleTimeoutMillis: 300000,
      idle: 300000
    },
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_general_ci'
      }
    }
  }
};
