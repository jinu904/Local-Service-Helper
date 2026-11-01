# Local Service Helper

This project contains the React customer website and its no-cost local backend.

## Run it locally

1. Install dependencies with `npm install`.
2. Start the backend in one terminal: `npm run server`.
3. Start the website in another terminal: `npm run dev`.

The API runs at `http://localhost:4000`. It creates its SQLite database automatically in `server/data/` and seeds service-provider listings for each service category.

## Smart Match machine-learning model

When the backend starts, it trains a local **logistic-regression** provider-suitability classifier from the approved provider records in SQLite. The model uses normalised rating, review confidence, and years of experience to estimate provider suitability. Smart Match blends that trained prediction (45%) with live customer-issue and specialty keyword relevance (55%), then returns the top three providers.

The generated model artifact is saved at `server/data/provider-suitability-model.json`. It is retrained after a customer submits a completed-service review, so updated provider performance is used by later recommendations. The dataset in this project is a demo dataset; it is appropriate for demonstrating the pipeline but not for claiming production-grade evaluation results.

## Accounts and approval

- Customers can register, view approved providers, and create bookings.
- Service providers can register and submit a profile. New or edited provider profiles are marked **pending**.
- An admin approves or rejects provider profiles through the admin API.

For local development, the seeded admin login is configured in `.env.example` (`admin@localservicehelper.test` / `ChangeMe123!`). Copy it to `.env` and change the secret and password before any real deployment.

## Main API routes

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/providers`, `GET /api/providers/:id`
- `GET` / `PUT /api/providers/me/profile`
- `POST /api/bookings`, `GET /api/bookings/me`
- `POST /api/recommendations`, `GET /api/ml/model-info`
- `GET /api/admin/providers?status=pending`
- `PATCH /api/admin/providers/:id/status`
