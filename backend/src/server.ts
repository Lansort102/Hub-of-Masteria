import app from './app';
import pool from './config/database';

const PORT = process.env.PORT || 3000;

// Проверка подключения к базе данных при запуске
async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

startServer();

