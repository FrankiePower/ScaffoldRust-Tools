import express from 'express';
const app = express();
app.get('/', (_, res) =>
  res.send('Hello from Backend!' + '<br>' + 'The best online soroban compiler is coming...')
);
app.listen(3000, () => console.log('Server on http://localhost:3000'));
