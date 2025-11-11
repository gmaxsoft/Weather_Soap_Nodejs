// server.js
const express = require('express');
const soap = require('soap');
const path = require('path');
const app = express();
const port = 3000;

// URL pliku WSDL dla serwisu pogodowego CDYNE
const wsdlUrl = 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL';

// Ustawienie folderu statycznego, aby obsłużyć index.html
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Endpoint API do pobierania pogody
app.get('/api/weather', (req, res) => {
    const zipCode = req.query.zip;

    if (!zipCode) {
        return res.status(400).json({ error: 'Brak kodu pocztowego (ZIP) w zapytaniu.' });
    }

    // Krok 1: Utworzenie klienta SOAP
    soap.createClient(wsdlUrl, (err, client) => {
        if (err) {
            console.error('Błąd tworzenia klienta SOAP:', err);
            // Zwrócenie błędu serwera do klienta
            return res.status(500).json({ error: 'Błąd połączenia z usługą SOAP.' });
        }

        // Krok 2: Przygotowanie argumentów dla metody SOAP
        const args = {
            ZIP: zipCode 
        };

        // Krok 3: Wywołanie metody SOAP
        client.GetCityWeatherByZIP(args, (err, result) => {
            if (err) {
                console.error('Błąd wywołania metody SOAP:', err.body || err);
                return res.status(500).json({ error: 'Błąd wywołania metody w usłudze SOAP.', details: err.body });
            }

            // Mapowanie wyniku z SOAP na prostą odpowiedź JSON
            const weatherResult = result.GetCityWeatherByZIPResult;
            
            // Prosta walidacja, czy dane zostały zwrócone
            if (weatherResult.City === 'N/A' || weatherResult.Success === false) {
                 return res.status(404).json({ error: 'Nie znaleziono danych dla podanego kodu pocztowego.', Success: false });
            }

            // Krok 4: Wysłanie przetworzonej odpowiedzi do klienta front-end
            res.json({
                City: weatherResult.City,
                State: weatherResult.State,
                Temperature: weatherResult.Temperature,
                Description: weatherResult.Description,
                Success: weatherResult.Success
            });
        });
        
        // Opcjonalne: Logowanie surowego żądania XML (odkomentuj, jeśli potrzebujesz debugowania)
        // console.log('Ostatnie żądanie XML:', client.lastRequest);
    });
});

// Uruchomienie serwera
app.listen(port, () => {
    console.log(`\n🚀 Serwer działa na http://localhost:${port}`);
    console.log(`Otwórz http://localhost:${port}/index.html w przeglądarce.`);
});