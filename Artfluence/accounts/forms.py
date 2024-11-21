from datetime import datetime

from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from .models import ArtfluenceUser, DebitCard
from django.contrib.auth.hashers import check_password


class CustomUserRegistrationForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = ArtfluenceUser
        fields = ['username', 'email', 'password1', 'password2']

    def __init__(self, *args, **kwargs):
        super(CustomUserRegistrationForm, self).__init__(*args, **kwargs)

        self.fields['username'].widget.attrs.update({'placeholder': 'Username'})
        self.fields['email'].widget.attrs.update({'placeholder': 'Email'})
        self.fields['password1'].widget.attrs.update({'placeholder': 'Password'})
        self.fields['password2'].widget.attrs.update({'placeholder': 'Repeat Password'})

        for field_name, field in self.fields.items():
            field.label = ""

        self.fields['password1'].help_text = ""
        self.fields['password2'].help_text = ""

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if ArtfluenceUser.objects.filter(email=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email


class LoginForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'placeholder': 'Email'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')

        user = authenticate(email=email, password=password)
        if not user:
            raise forms.ValidationError("Invalid email or password.")

        cleaned_data['user'] = user
        return cleaned_data


class EditProfileForm(forms.ModelForm):
    old_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Old Password'}),
        required=False,
        label="Old Password",
    )
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'New Password'}),
        required=False,
        label="New Password",
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm New Password'}),
        required=False,
        label="Confirm New Password",
    )

    class Meta:
        model = ArtfluenceUser
        fields = ['username', 'email', 'profile_picture']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'profile_picture': forms.FileInput(attrs={'class': 'form-control'}),
        }
        labels = {
            'username': 'Username',
            'email': 'Email Address',
            'profile_picture': 'Profile Picture',
        }

    def clean(self):
        cleaned_data = super().clean()
        old_password = cleaned_data.get("old_password")
        new_password1 = cleaned_data.get("new_password1")
        new_password2 = cleaned_data.get("new_password2")

        if new_password1 or new_password2:
            if not old_password:
                self.add_error('old_password', "Old password is required to set a new password.")
            elif not check_password(old_password, self.instance.password):
                self.add_error('old_password', "The old password is incorrect.")
            if new_password1 != new_password2:
                self.add_error('new_password2', "The new passwords do not match.")

        return cleaned_data


class DebitCardForm(forms.ModelForm):
    class Meta:
        model = DebitCard
        fields = ['card_number', 'holder_name', 'expiration_date', 'cvv']
        widgets = {
            'card_number': forms.TextInput(attrs={
                'maxlength': 16,
                'placeholder': 'ex. 1234 5678 1234 5678',
                'class': 'form-control',
            }),
            'holder_name': forms.TextInput(attrs={
                'placeholder': 'Cardholder Name',
                'class': 'form-control',
            }),
            'expiration_date': forms.DateInput(attrs={
                'type': 'month',
                'class': 'form-control',
            }),
            'cvv': forms.PasswordInput(attrs={
                'maxlength': 3,
                'placeholder': 'ex. 123',
                'class': 'form-control',
            }),
        }
        labels = {
            'card_number': 'Card Number',
            'holder_name': 'Cardholder Name',
            'expiration_date': 'Expiration Date',
            'cvv': 'CVV',
        }

        def clean_card_number(self):
            card_number = self.cleaned_data.get('card_number')
            if len(card_number) != 16:
                raise forms.ValidationError("Card number must contain exactly 16 digits.")
            return card_number

        def clean_cvv(self):
            cvv = self.cleaned_data.get('cvv')
            if len(cvv) != 3:
                raise forms.ValidationError("CVV must contain exactly 3 digits.")
            return cvv

