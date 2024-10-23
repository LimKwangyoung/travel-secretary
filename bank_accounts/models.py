from django.db import models
from django.conf import settings


class BankAccount(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    account_number = models.CharField(max_length=25, null=False, blank=False)
    balance = models.IntegerField()
    fixed_balance = models.IntegerField()
    bank = models.CharField(max_length=15)