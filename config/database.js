module.exports = ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'lavorar'),
      user: env('DATABASE_USERNAME', 'root'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});

// module.exports = {
//   apps: [
//     {
//       name: 'your-app-name', // Your project name
//       cwd: '/var/www/html/laborar/backend', // Path to your project
//       script: 'npm', // For this example we're using npm, could also be yarn
//       args: 'start', // Script to start the Strapi server, `start` by default
//       env: {
//         APP_KEYS: '4bpvkAf3VMKnTlZp8wSRxQ==,p2eQVUEo1q7KUbQ9aEV/lQ==,yJ/bBc8sUmlUvFNwNnTK+Q==,HiJSKJHwQ6H6larxauSLyw==',
//         API_TOKEN_SALT: 'yy8XLuhxs8V9AjXixU29IQ==',
//         ADMIN_JWT_SECRET: 'MIQqMAjr7V6fnw+/zo2MMw==',
//         JWT_SECRET: 'KMYyel6Rvix20/CuHQIx8g==',
//         NODE_ENV: 'production',
//         TRANSEFER_SALT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic2FudGlhZ28gYXZpbGV6In0.pCF_ZSNyPv_lg7ZMnEGqdtHfvYM_sZ6lien0kkLco10',
//         DATABASE_HOST: 'laborar.ckaj9lvkfaf2.sa-east-1.rds.amazonaws.com', // database Endpoint under 'Connectivity & Security' tab
//         DATABASE_PORT: '3306',
//         DATABASE_NAME: 'laborar', // DB name under 'Configuration' tab
//         DATABASE_USERNAME: 'root', // default username
//         DATABASE_PASSWORD: '123456789',
//       },
//     },
//   ],
// };