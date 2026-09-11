"""Deterministic managerial costing. All money inputs are integer rials."""
from dataclasses import dataclass

@dataclass(frozen=True)
class OrderCost:
    net_food_sales: int
    delivery_collected: int = 0
    ingredients: int = 0
    packaging: int = 0
    commission: int = 0
    variable_delivery: int = 0
    other_variable: int = 0

    def __post_init__(self):
        for value in self.__dict__.values():
            if type(value) is not int or value < 0:
                raise ValueError("Amounts must be non-negative integer rials")

    @property
    def revenue(self):
        return self.net_food_sales + self.delivery_collected

    @property
    def contribution(self):
        return self.revenue - sum((self.ingredients, self.packaging,
            self.commission, self.variable_delivery, self.other_variable))

    @property
    def contribution_margin(self):
        return self.contribution / self.revenue if self.revenue else None

def operating_profit(orders, period_expenses, depreciation):
    """Period expenses include fixed courier pay; do not allocate it again above."""
    for value in (period_expenses, depreciation):
        if type(value) is not int or value < 0:
            raise ValueError("Amounts must be non-negative integer rials")
    return sum(order.contribution for order in orders) - period_expenses - depreciation
