module.exports = {
  apps: [
    {
      name: 'my-nestjs-app',
      script: 'npm',
      args: 'run start:prod',

      instances: 1,
      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        PORT: 8000
      }
    }
  ]
};
