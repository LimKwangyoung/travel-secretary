from django.urls import path
from .views import *


app_name = 'payments'
urlpatterns = [
    path('', pay),
    path('list/', pay_list),
    path('adjustment/', adjustment), 
    path('objection/', objection), 
    path('delete/', delete), 
    path('prepare/', prepare), 
    path('zero/', zero), 
    path('rich/', rich), 
]
