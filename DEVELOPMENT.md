# Diner — first working local slice

Run with Python 3.10+: `python app.py`, then open http://127.0.0.1:8765.
No external packages or build step required. The existing Python architecture is retained.
Run tests: `python -m unittest discover -s tests -v`.

Implemented: Persian RTL responsive UI, ingredient registration with source and timestamp,
recipe composition, preparation yield, servings, per-serving packaging, sale price,
remaining amount and explicit margin, immutable recipe price snapshots, SQLite persistence.
Money is stored in integer rials and displayed/input in tomans; quantity arithmetic uses Decimal.

This is a single-restaurant **local development application**, not a hosted production service.
It binds only to loopback, checks Host and uses a per-process mutation token.
Authentication, multi-restaurant isolation, shared hosting, receipt imports, live Digikala prices,
assistant and remaining modules are not implemented yet. Do not expose this server publicly.
The source being public does not publish the SQLite database. No real data is seeded.

Database: private-data/diner.sqlite3 (gitignored). Back it up while the app is stopped.
Current foundation includes no editing/deletion of saved ingredients; a corrected entry can be added.
Each saved recipe is an independent immutable version; not an automatically updated current menu.
Packaging is per serving only in this slice. Shared order-level packaging belongs to the later order module.
Costs shown exclude delivery, commissions, rent, payroll and depreciation.

Full scope: [docs/PRODUCT.fa.md](docs/PRODUCT.fa.md).
