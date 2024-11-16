from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from .models import ArtfluenceUser, DebitCard


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
                'type': 'date',
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
        help_texts = {
            'card_number': 'Enter the 16-digit card number without spaces.',
            'expiration_date': 'Enter the expiration date in MM/YYYY format.',
            'cvv': 'The 3-digit number on the back of your card.',
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