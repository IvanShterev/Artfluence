from django.shortcuts import render


def index(request):
    return render(request, 'home/home.html')


def what_is_ap_view(request):
    return render(request, 'home/what-is-ap.html')


def login(request):
    return render(request, 'accounts/login.html')
