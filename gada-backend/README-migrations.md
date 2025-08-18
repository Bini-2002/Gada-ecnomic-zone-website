# Database Migrations

Alembic is configured for schema migrations.

## Quick Start

1. (Optional) Remove automatic table creation by setting environment variable:
   Windows PowerShell:

   ```powershell
   $env:AUTO_CREATE='0'
   ```

2. Generate a revision after changing `models.py`:

   ```bash
   alembic revision --autogenerate -m "describe changes"
   ```

3. Apply migrations:

   ```bash
   alembic upgrade head
   ```

## Recreating Development DB (SQLite)

If your existing `gada.db` lacks new columns (e.g., `approved`), you can either:

- Run migrations as above, or
- Delete `gada.db` and let the app recreate it (only for dev):

   ```powershell
   Remove-Item .\gada.db
   $env:AUTO_CREATE='1'
   uvicorn main:app --reload
   ```

## Notes

- Keep `models.py` as the single source of truth.
- Always autogenerate then inspect migrations before applying.
- Commit migration scripts alongside model changes.
- Define a strong `SECRET_KEY` in a `.env` file (see `.env.example`) before running the app; the server will fail fast if it's missing.
