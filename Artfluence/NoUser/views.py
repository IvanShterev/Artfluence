from django.shortcuts import render


def index(request):
    return render(request, 'base.html')


def login_view(request):
    return render(request, 'login.html')


def what_is_ap_view(request):
    return render(request, 'what-is-ap.html')