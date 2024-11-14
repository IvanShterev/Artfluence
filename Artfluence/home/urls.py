from django.urls import path
from Artfluence.home import views


urlpatterns = [
    path('', views.index, name='home'),
    path('what-is-ap/', views.what_is_ap_view, name='what-is-ap'),
]