
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({status: "OK"});
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
