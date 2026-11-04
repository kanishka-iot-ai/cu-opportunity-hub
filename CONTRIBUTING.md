# Contributing to CU OPPORTUNITY HUB
### Chandigarh University Academic Technology Network

We welcome contributions from Chandigarh University students, alumni, faculty, and academic coordinators!

---

## 🛠️ Contribution Guidelines

1. **Fork the Repository:** Create your own branch (`git checkout -b feature/opportunity-crawler`).
2. **Follow Code Standards:**
   - Keep backend routes modular in `backend/app/routes/`.
   - Maintain clean React functional components with Tailwind CSS in `frontend/src/`.
   - Ensure all database queries leverage SQLAlchemy ORM with foreign key integrity.
3. **Database Migrations:** If adding new entities, update `database/schema.sql` and `database/er_diagram.md`.
4. **Testing:** Run backend tests before submitting a PR:
   ```bash
   $env:PYTHONPATH='backend'; pytest backend/tests
   ```
5. **Submit a Pull Request:** Provide a clear description of the feature or bugfix.
