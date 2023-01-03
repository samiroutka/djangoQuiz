from django.urls import path
from .views import *

urlpatterns = [
  path('', clientView.as_view()),
  path('manager/', managerView.as_view()),
]
