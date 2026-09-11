import unittest
from diner_core.costing import OrderCost, operating_profit

class CostingTests(unittest.TestCase):
    def test_shared_delivery(self):
        order = OrderCost(3000000, 200000, 1200000, variable_delivery=500000)
        self.assertEqual(order.contribution, 1500000)
        self.assertAlmostEqual(order.contribution_margin, 1500000 / 3200000)

    def test_zero_revenue(self):
        self.assertIsNone(OrderCost(0, ingredients=100).contribution_margin)
        self.assertEqual(OrderCost(0, ingredients=100).contribution, -100)

    def test_fixed_courier_is_period_expense(self):
        self.assertEqual(operating_profit([OrderCost(1000), OrderCost(1000)], 500, 100), 1400)

    def test_invalid_money(self):
        for amount in (-1, 1.5, True):
            with self.assertRaises(ValueError):
                OrderCost(amount)

if __name__ == "__main__":
    unittest.main()
