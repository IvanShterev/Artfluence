from django.urls import path
from Artfluence.NoUser import views


urlpatterns = [
    path('', views.index, name='home'),
    path('login/', views.login_view, name='login'),
    path('what-is-ap/', views.what_is_ap_view, name='what-is-ap')
]