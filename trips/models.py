from django.db import models
from django.conf import settings


class Trip(models.Model):
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField()
    trip_name = models.CharField(max_length=30)
    image_url = models.TextField()
    
    
class Member(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    budget = models.IntegerField(default=0)
    bank_account = models.CharField(max_length=30, default="")
    bank_name = models.CharField(max_length=15, default="")
    is_participate = models.BooleanField(default=False)
    
    
class Location(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    country = models.CharField(max_length=30, null=False, blank=False)
    city = models.CharField(max_length=30, null=True, blank=True)