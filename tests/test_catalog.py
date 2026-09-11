import tempfile
import unittest
from pathlib import Path
from diner_core.catalog import Catalog

class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.path=Path(self.tmp.name)/"test.sqlite3"
        self.catalog=Catalog(self.path)
        self.catalog.add_ingredient({"name":"پنیر","unit":"g","price":"۴۵۰","source":"فاکتور آزمایشی"})
    def tearDown(self):
        self.catalog.close()
        self.tmp.cleanup()
    def recipe(self):
        return {"name":"برگر","lines":[{"ingredient_id":1,"quantity":"40","yield_percent":"80"}],
                "servings":"2","packaging":"1000","sale":"20000"}
    def test_yield_servings_currency(self):
        result=self.catalog.save_recipe(self.recipe())
        self.assertEqual(result["food_rial"],112500)
        self.assertEqual(result["remaining_rial"],77500)
    def test_persists_and_snapshot_does_not_change(self):
        self.catalog.save_recipe(self.recipe())
        with self.catalog.db:
            self.catalog.db.execute("UPDATE ingredients SET price=1 WHERE id=1")
        self.catalog.close()
        self.catalog=Catalog(self.path)
        self.assertEqual(self.catalog.recipes()[0]["snapshot"]["lines"][0]["price"],4500)
    def test_reject_invalid_yield_and_missing_material(self):
        data=self.recipe()
        for value in ("0","101","NaN"):
            data["lines"][0]["yield_percent"]=value
            with self.assertRaises(ValueError):self.catalog.save_recipe(data)
        data=self.recipe();data["lines"][0]["ingredient_id"]=999
        with self.assertRaises(ValueError):self.catalog.save_recipe(data)
    def test_zero_sale(self):
        data=self.recipe();data["sale"]="0"
        self.assertIsNone(self.catalog.save_recipe(data)["margin"])
