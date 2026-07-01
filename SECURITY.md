# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | ✅ Active support  |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Please report security issues directly to the project maintainer:

📧 **Email:** Create an issue with the title `[SECURITY]` and we will respond privately.

You will receive a response within **48 hours**. If the issue is confirmed, we will:

1. Acknowledge receipt
2. Investigate and determine impact
3. Release a patch as soon as possible
4. Credit you (if desired) in the release notes

## Security Best Practices for Deploying TyON

1. **API Keys:** Store `FIRECRAWL_API_KEY` and `DEEPSEEK_API_KEY` as environment variables, never in code or version control
2. **Database:** Use strong passwords for MySQL and Redis, avoid default credentials in production
3. **CORS:** The default CORS configuration allows `localhost:3000` only — update this for production deployments
4. **Environment:** Never commit `.env` files — they are already in `.gitignore`
5. **Dependencies:** Keep Python and Node.js dependencies updated — run `pip list --outdated` and `npm outdated` periodically
6. **Redis:** In production, configure Redis authentication (`requirepass`) instead of running without a password

## Dependencies We Monitor

- FastAPI / Uvicorn
- SQLAlchemy / aiomysql
- Next.js / React
- httpx (backend HTTP client)

---

**Found a vulnerability?** We take all security reports seriously. Thank you for helping keep TyON secure.
