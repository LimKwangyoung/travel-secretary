from django.urls import path
from .views import *


app_name = 'bank_accounts'
urlpatterns = [
    path('', index),
]
