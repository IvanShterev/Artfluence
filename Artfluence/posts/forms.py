from django import forms
from .models import Post


class PostForm(forms.ModelForm):
    collection = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input',
            'id': 'collection_checkbox',
        }),
        label="Collection",
    )

    class Meta:
        model = Post
        fields = ['title', 'for_sale', 'price', 'image']
        widgets = {
            'title': forms.TextInput(attrs={
                'placeholder': 'Enter the title of your post',
                'class': 'form-control',
            }),
            'for_sale': forms.CheckboxInput(attrs={
                'class': 'form-check-input',
                'id': 'for_sale_checkbox',
            }),
            'price': forms.NumberInput(attrs={
                'placeholder': 'Enter a price',
                'class': 'form-control',
                'id': 'price_input',
            }),
            'image': forms.ClearableFileInput(attrs={
                'class': 'form-control',
            }),
        }
        labels = {
            'title': 'Post Title',
            'for_sale': 'For Sale',
            'price': 'Price',
        }

    def clean(self):
        cleaned_data = super().clean()
        for_sale = cleaned_data.get('for_sale')
        collection = cleaned_data.get('collection')
        price = cleaned_data.get('price')

        if for_sale and collection:
            raise forms.ValidationError("A post cannot be both 'For Sale' and 'Collection'.")
        if for_sale and (price is None or price <= 0):
            self.add_error('price', "Price must be set and greater than 0 if the post is for sale.")
        if collection:
            cleaned_data['for_sale'] = False
            cleaned_data['price'] = None
        if collection and price:
            self.add_error('price', "Collection posts don't have a price.")
        return cleaned_data


class EditForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'for_sale', 'price', 'image']
