from django.urls import path
from .views import *


app_name = 'accounts'
urlpatterns = [
    path('logout/', logout), 
    path('friend/', friend), 
    path('get_token/', get_token), 
    path('send_message/', send_message), 
]
