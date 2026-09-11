"""Versioned recipe costing for the local single-restaurant development app."""
import json
import sqlite3
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

def number(value, positive=False):
    try:
        result = Decimal(str(value).translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹٬", "0123456789," )).replace(",", ""))
    except InvalidOperation:
        raise ValueError("عدد معتبر وارد کنید")
    if not result.is_finite() or result < 0 or (positive and result == 0) or result > 10**12:
        raise ValueError("مقدار خارج از محدوده است")
    return result

def rial(toman):
    amount = number(toman) * 10
    if amount != amount.to_integral_value():
        raise ValueError("مبلغ باید به ریال قابل تبدیل باشد")
    return int(amount)

def text(value):
    value = str(value).strip()
    if not value or len(value) > 200:
        raise ValueError("نام و منبع باید بین ۱ تا ۲۰۰ حرف باشند")
    return value

class Catalog:
    def __init__(self, path):
        self.db = sqlite3.connect(path)
        self.db.row_factory = sqlite3.Row
        self.db.executescript("""
        CREATE TABLE IF NOT EXISTS ingredients(
          id INTEGER PRIMARY KEY, name TEXT NOT NULL, unit TEXT NOT NULL,
          price INTEGER NOT NULL, source TEXT NOT NULL, recorded_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS recipes(
          id INTEGER PRIMARY KEY, name TEXT NOT NULL, snapshot TEXT NOT NULL,
          created_at TEXT NOT NULL);
        """)
    def close(self):
        self.db.close()
    def ingredients(self):
        return [dict(r) for r in self.db.execute("SELECT * FROM ingredients ORDER BY id DESC")]
    def recipes(self):
        return [dict(r) | {"snapshot": json.loads(r["snapshot"])}
                for r in self.db.execute("SELECT * FROM recipes ORDER BY id DESC")]
    def add_ingredient(self, data):
        unit = data["unit"]
        if unit not in ("g", "ml", "piece"):
            raise ValueError("واحد معتبر نیست")
        values = (text(data["name"]), unit, rial(data["price"]), text(data["source"]),
                  datetime.now(timezone.utc).isoformat())
        with self.db:
            self.db.execute("INSERT INTO ingredients(name,unit,price,source,recorded_at) VALUES(?,?,?,?,?)", values)
    def save_recipe(self, data):
        lines = data["lines"]
        if not isinstance(lines, list) or not 1 <= len(lines) <= 100:
            raise ValueError("حداقل یک ماده برای رسپی لازم است")
        details = []
        total = Decimal(0)
        for line in lines:
            row = self.db.execute("SELECT * FROM ingredients WHERE id=?", (int(line["ingredient_id"]),)).fetchone()
            if row is None:
                raise ValueError("ماده اولیه پیدا نشد")
            quantity = number(line["quantity"], True)
            yield_percent = number(line.get("yield_percent", 100), True)
            if yield_percent > 100:
                raise ValueError("بازده باید حداکثر ۱۰۰ درصد باشد")
            cost = Decimal(row["price"]) * quantity * 100 / yield_percent
            total += cost
            details.append(dict(row) | {"quantity":str(quantity), "yield_percent":str(yield_percent), "cost_rial":str(cost)})
        servings = number(data["servings"], True)
        packaging = rial(data["packaging"])
        sale = rial(data["sale"])
        food = int((total / servings).quantize(Decimal(1), rounding=ROUND_HALF_UP))
        remaining = sale - food - packaging
        snapshot = {"lines":details, "servings":str(servings), "food_rial":food,
                    "packaging_rial":packaging, "sale_rial":sale, "remaining_rial":remaining,
                    "margin":remaining / sale if sale else None}
        with self.db:
            self.db.execute("INSERT INTO recipes(name,snapshot,created_at) VALUES(?,?,?)",
                            (text(data["name"]),json.dumps(snapshot,ensure_ascii=False),datetime.now(timezone.utc).isoformat()))
        return snapshot
