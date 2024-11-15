from django.contrib.auth.views import LoginView
from django.shortcuts import redirect
from django.views.generic import TemplateView
from django.views.generic.edit import FormView
from django.urls import reverse_lazy
from django.contrib.auth import login
from .forms import CustomUserRegistrationForm, LoginForm
from django.contrib import messages


class CustomLoginView(FormView):
    template_name = 'accounts/login.html'
    form_class = LoginForm
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        user = form.cleaned_data['user']
        if user.is_first_login:
            user.artfluence_points += 100
            user.is_first_login = False
            user.save()
            messages.success(self.request,
                             'Congratulations! You have received 100 Artfluence Points for your first login!')

        login(self.request, form.cleaned_data['user'])
        return super().form_valid(form)


class RegisterView(FormView):
    template_name = 'accounts/register.html'
    form_class = CustomUserRegistrationForm
    success_url = reverse_lazy('login')

    def form_valid(self, form):
        user = form.save()
        return super().form_valid(form)
