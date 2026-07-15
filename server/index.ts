import app from './app.js';

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Pop Hub API listening on http://127.0.0.1:${PORT}`);
});
