# Certificate Verifier

University of Swabi certificate verifier dApp for Sepolia.

## Features

- Issue certificates from approved wallets on Sepolia
- Verify certificates by on-chain certificate ID
- Save issued records to Supabase
- Download certificates as PDF
- Scan QR codes to open verification
- Browse a certificate history page

## Tech

- Solidity 0.8.20
- Hardhat
- React + TanStack Start
- ethers.js v6
- Supabase
- Tailwind CSS

## Setup

1. Install dependencies in `cert-verifier` and `cert-verifier/frontend`.
2. Copy `.env.example` to `.env` in `cert-verifier`.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Fill in local-only values in the `.env` files.

## Run

```sh
npm run compile
npm test
npm run deploy:sepolia
npm run dev --prefix frontend
```

## Security Notes

- Keep `cert-verifier/.env` and `cert-verifier/frontend/.env` local only.
- Do not commit `PRIVATE_KEY`.
- The Supabase anon key and Sepolia RPC URL are public client values, but they still belong only in `.env` files.
