# Test suite

Run backend tests from the repository root:

```powershell
cd server
..\server\venv\Scripts\python.exe -m pytest
```

The suite uses an in-memory SQLite database for model-level tests, so it does not modify the Neon database.
