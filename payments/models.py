from django.db import models
from trips.models import Member

# Create your models here.
class Payment(models.Model):
    amount = models.IntegerField()
    pay_date = models.DateField(auto_now=False, auto_now_add=False)
    pay_time = models.TimeField(auto_now=False, auto_now_add=False)
    brand_name = models.CharField(max_length=30)
    category = models.CharField(max_length=10, default="")
    bank_account = models.CharField(max_length=30)


class Calculate(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    cost = models.IntegerField()
    remain_cost = models.IntegerField(default=0)