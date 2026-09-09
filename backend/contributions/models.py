from django.db import models


class MonthlyContribution(models.Model):

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    effective_from = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-effective_from"]

    def __str__(self):
        return (
            f"{self.effective_from.strftime('%B %Y')} "
            f"- {self.amount}"
        )