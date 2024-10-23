from django.urls import path
from .views import *


app_name = 'trips'
urlpatterns = [
    path('', create_trip), 
    path('list/', list), 
    path('detail/', detail), 
    path('budget/', budget), 
    path('save_image/', save_image), 
    path('invite/', invite), 
]
