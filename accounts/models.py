from django.contrib.auth.models import AbstractUser
from django.db import models
    

class User(AbstractUser):
    user_key = models.CharField(max_length=50, null=True, blank=True)
    user_id = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField()
