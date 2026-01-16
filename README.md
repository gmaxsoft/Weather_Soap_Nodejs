# 🌩️ SOAP Client Demo: Node.js (Express) + Publiczne API Pogodowe

Ten projekt jest edukacyjnym demo, demonstrującym, jak stworzyć klienta **SOAP** w środowisku **Node.js** (wykorzystując framework **Express.js**) i opakować go, aby mógł być łatwo wywoływany przez prosty formularz **HTML5** w przeglądarce.

Użyta usługa SOAP to publiczne, darmowe API pogodowe (Global Weather by CDYNE).

---

## ⚙️ Technologia

### Backend
* **Node.js** - środowisko uruchomieniowe JavaScript
* **Express.js** (v5.1.0) - framework webowy do tworzenia API REST
* **soap** (v1.6.0) - biblioteka do komunikacji z usługami SOAP/WSDL

### Frontend
* **HTML5** - struktura strony internetowej
* **CSS** - style wizualne interfejsu
* **Vanilla JavaScript** - logika kliencka z wykorzystaniem Fetch API do komunikacji z backendem

### API
* **Publiczne API SOAP:** Global Weather by CDYNE (`http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL`)

---

## 📂 Struktura Projektu

Projekt składa się z dwóch głównych plików:

1.  **`server.js`**: Główny plik serwera Express. Używa biblioteki `soap` do komunikacji z API pogodowym i udostępnia endpoint REST (`/api/weather`) dla frontendu.
2.  **`index.html`**: Prosty formularz HTML5 z kodem JavaScript, który pobiera kod pocztowy od użytkownika i wysyła zapytanie do serwera Express.

---

## 🚀 Uruchomienie Projektu

Aby uruchomić projekt lokalnie, wykonaj poniższe kroki.

### 1. Wymagania

Upewnij się, że masz zainstalowane środowisko **Node.js**.

### 2. Instalacja zależności

Przejdź do katalogu projektu i zainstaluj wymagane pakiety:

```bash
npm install express soap
```

### 3\. Uruchomienie Serwera

Uruchom serwer Express za pomocą Node.js:

```bash
node server.js
```

Po uruchomieniu serwer powinien wyświetlić komunikat:

```
🚀 Serwer działa na http://localhost:3000
Otwórz http://localhost:3000/index.html w przeglądarce.
```

### 4\. Testowanie

Otwórz podany adres w przeglądarce i:

1.  Wpisz kod pocztowy USA (np. **02110** dla Bostonu).
2.  Naciśnij przycisk **"Pobierz Pogodę"**.
3.  Front-end wyśle żądanie do Express, Express wykona żądanie **SOAP** do zewnętrznego API, przetworzy odpowiedź i zwróci dane do przeglądarki.

-----

## 💡 Opis Działania Klienta SOAP (`server.js`)

Kluczowy fragment kodu znajduje się w pliku `server.js` wewnątrz endpointu `/api/weather`:

```javascript
// Krok 1: Tworzenie instancji klienta SOAP na podstawie WSDL
soap.createClient(wsdlUrl, (err, client) => {
    // ... obsługa błędów ...

    // Krok 2: Definicja argumentów dla metody SOAP
    const args = { ZIP: zipCode };

    // Krok 3: Wywołanie konkretnej metody (np. GetCityWeatherByZIP)
    client.GetCityWeatherByZIP(args, (err, result) => {
        // ... obsługa odpowiedzi i mapowanie na JSON ...
    });
});
```

Ten mechanizm skutecznie ukrywa złożoność komunikacji SOAP i XML przed front-endem, czyniąc go łatwym w użyciu przez standardowe żądanie **REST/Fetch API**.