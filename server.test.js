// server.test.js
const request = require('supertest');

// Mock modułu soap przed jakimkolwiek importem
const mockCreateClient = jest.fn();
jest.mock('soap', () => ({
    createClient: mockCreateClient
}));

describe('API Weather Endpoint', () => {
    let app;

    beforeEach(() => {
        // Importujemy app po każdym teście, aby uzyskać świeżą instancję
        jest.resetModules();
        app = require('./app');
        mockCreateClient.mockClear();
    });

    afterEach(() => {
        mockCreateClient.mockClear();
    });

    test('GET /api/weather bez parametru zip powinien zwrócić 400', async () => {
        const response = await request(app)
            .get('/api/weather')
            .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Brak kodu pocztowego (ZIP) w zapytaniu.');
    });

    test('GET /api/weather z poprawnym zip powinien zwrócić dane pogodowe', (done) => {
        // Mock SOAP client
        const mockClient = {
            GetCityWeatherByZIP: jest.fn((args, callback) => {
                callback(null, {
                    GetCityWeatherByZIPResult: {
                        City: 'Boston',
                        State: 'MA',
                        Temperature: '72',
                        Description: 'Partly Cloudy',
                        Success: true
                    }
                });
            })
        };

        mockCreateClient.mockImplementation((url, callback) => {
            callback(null, mockClient);
        });

        request(app)
            .get('/api/weather?zip=02110')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('City');
                expect(res.body).toHaveProperty('State');
                expect(res.body).toHaveProperty('Temperature');
                expect(res.body).toHaveProperty('Description');
                expect(res.body).toHaveProperty('Success');
                expect(res.body.City).toBe('Boston');
                expect(res.body.State).toBe('MA');
                expect(res.body.Success).toBe(true);
            })
            .end(done);
    }, 20000);

    test('GET /api/weather z nieprawidłowym zip powinien zwrócić 404', (done) => {
        const mockClient = {
            GetCityWeatherByZIP: jest.fn((args, callback) => {
                callback(null, {
                    GetCityWeatherByZIPResult: {
                        City: 'N/A',
                        State: 'N/A',
                        Temperature: 'N/A',
                        Description: 'N/A',
                        Success: false
                    }
                });
            })
        };

        mockCreateClient.mockImplementation((url, callback) => {
            callback(null, mockClient);
        });

        request(app)
            .get('/api/weather?zip=00000')
            .expect(404)
            .expect((res) => {
                expect(res.body).toHaveProperty('error');
                expect(res.body).toHaveProperty('Success');
                expect(res.body.Success).toBe(false);
            })
            .end(done);
    }, 20000);

    test('GET /api/weather z błędem SOAP powinien zwrócić 500', (done) => {
        mockCreateClient.mockImplementation((url, callback) => {
            callback(new Error('Błąd połączenia'), null);
        });

        request(app)
            .get('/api/weather?zip=02110')
            .expect(500)
            .expect((res) => {
                expect(res.body).toHaveProperty('error');
                expect(res.body.error).toBe('Błąd połączenia z usługą SOAP.');
            })
            .end(done);
    }, 20000);

    test('GET /api/weather z błędem metody SOAP powinien zwrócić 500', (done) => {
        const mockClient = {
            GetCityWeatherByZIP: jest.fn((args, callback) => {
                callback(new Error('Błąd metody SOAP'), null);
            })
        };

        mockCreateClient.mockImplementation((url, callback) => {
            callback(null, mockClient);
        });

        request(app)
            .get('/api/weather?zip=02110')
            .expect(500)
            .expect((res) => {
                expect(res.body).toHaveProperty('error');
                expect(res.body.error).toBe('Błąd wywołania metody w usłudze SOAP.');
            })
            .end(done);
    }, 20000);
});
