# IP Geo backend + frontend

## Co to robi
- Backend bierze publiczne IP użytkownika.
- Sprawdza je w GeoLite2 City.
- Zwraca `country` i `region` w JSON.
- Frontend pobiera wynik z Twojego API i wyświetla go.

## Ważne
Żeby wynik był możliwie wiarygodny, używaj lokalnej bazy GeoLite2 City, a nie losowego publicznego API.

MaxMind podaje, że GeoLite wymaga darmowego konta do pobrania bazy i że dane geolokalizacji IP są mniej dokładne niż płatne produkty. Railway pozwala ustawiać zmienne środowiskowe jako config dla deploymentu.

## Struktura
- `server.js` — API
- `index.html` — frontend
- `package.json` — zależności

## Endpoint
`GET /api/ip-location`

Opcjonalnie:
- `?ip=1.2.3.4`

Odpowiedź:
```json
{
  "ok": true,
  "ip": "1.2.3.4",
  "country": "Poland",
  "countryCode": "PL",
  "region": "Kujawsko-Pomorskie",
  "regionCode": "KP"
}
```

## Jak to uruchomić na Railway
1. Wgraj pliki backendu.
2. Ustaw zmienną środowiskową `GEOIP_DB_PATH` na ścieżkę do pliku `GeoLite2-City.mmdb`.
3. Zapewnij, żeby baza była dostępna na serwerze.
4. Ustaw frontendowi `API_BASE` na adres Twojego API.

Jeśli chcesz, możesz też trzymać bazę w osobnym volume i wskazać ją przez `GEOIP_DB_PATH`.
