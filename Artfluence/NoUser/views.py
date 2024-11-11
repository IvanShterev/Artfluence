from django.shortcuts import render


def index(request):
    return render(request, 'home.html')


def what_is_ap_view(request):
    return render(request, 'what-is-ap.html')