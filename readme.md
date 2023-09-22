# Quantum Lux Hotel Booking System

## Beskrivning

Quantum Lux Hotel Booking System är ett avancerat bokningssystem för Quantum Lux Hotel, en lyxig hotellkedja. Det här systemet är utvecklat med hjälp av AWS (Amazon Web Services), Serverless Framework, DynamoDB, AWS Lambda, S3 Bucket, Middy, Bcrypt för kryptering och JsonWebToken för autentisering.

Projektet har skapats som en del av en inlärningsprocess för att förstå och behärska AWS och dess olika tjänster. Syftet med projektet är att lära sig och utforska AWS-ekosystemet och serverlös arkitektur.

## Funktioner

- **Bokning av rum:** Gäster kan enkelt söka och boka tillgängliga rum för sina resedatum.
- **Autentisering:** Användare kan skapa konton, logga in och hantera sina bokningar.
- **Säkerhet:** Känslig användardata skyddas med kryptering.
- **Hantering av tillgänglighet:** Systemet uppdaterar automatiskt rumstillgänglighet baserat på bokningar, avbokningar och datum.

## Teknisk Arkitektur

Projektet är uppbyggt med en serverlös arkitektur med hjälp av AWS-tjänster som Lambda, DynamoDB och S3 Bucket. Middleware-hanteringen och autentiseringen hanteras med hjälp av Middy. Användare autentiseras med JsonWebToken (JWT), och lösenord lagras säkert med hjälp av Bcrypt.

## Kom igång

För att komma igång med Quantum Lux Hotel Booking System, följ de här stegen:

1. **Klona projektet:** `git clone https://github.com/joakimtrulsson/quantum-lux-hotel-backend`
2. **Installera beroenden:** `npm install`
3. **Konfigurera miljövariabler:** Skapa en `.env`-fil med nödvändiga miljövariabler.
4. **Lokal utveckling:** Kör `npm run dev` för att starta projektet i lokal utvecklingsläge.
5. **Deploy till AWS:** Använd Serverless Framework för att distribuera projektet till AWS.

## Miljövariabler

Projektet kräver följande miljövariabler:

- `PROFILE`: Din AWS profil.
- `LAMBDA_ROLE`: Din AWS Lambda roll.
- `JWTSECRET`: En hemlig nyckel för att signera JWT-token.
- `JWTEXPIRATION`: Giltigthetstiden för JWT-Token.
