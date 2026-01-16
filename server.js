// server.js
const app = require('./app');
const port = 3000;

// Uruchomienie serwera
app.listen(port, () => {
    console.log(`\n🚀 Serwer działa na http://localhost:${port}`);
    console.log(`Otwórz http://localhost:${port}/index.html w przeglądarce.`);
});