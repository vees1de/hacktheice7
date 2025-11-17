module.exports = {
  apps: [
    {
      name: 'my-nestjs-app', // Имя процесса в PM2
      script: 'npm', // Запускаем через npm
      args: 'run start:prod', // Аргумент: наш prod-скрипт
      // Альтернатива: script: 'dist/main.js' (прямой запуск Node.js)

      // Продакшен-настройки
      instances: 'max', // Кластер: используйте все CPU-ядра
      exec_mode: 'cluster', // Режим кластера для масштабирования
      env: {
        NODE_ENV: 'production',
        PORT: 8000 // Или ваша переменная
      },

      // Авто-рестарт
      max_memory_restart: '1G', // Рестарт при >1GB памяти
      watch: false, // Не мониторить файлы (для prod)
      ignore_watch: ['node_modules', 'dist'],

      // Логи
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true // Время в логах
    }
  ]
};
