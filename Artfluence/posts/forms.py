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
        help_text="Check this box if the post is part of a collection."
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
                'placeholder': 'Enter price if for sale',
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
            'image': 'Upload Image',
        }
        help_texts = {
            'title': 'The title should be short and descriptive (max 15 characters).',
            'for_sale': 'Check this box if the post is for sale.',
            'price': 'Set a price if the post is for sale.',
            'image': 'Upload an image for your post.',
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
            cleaned_data['for_sale'] = False  # Override the for_sale field if collection is selected
            cleaned_data['price'] = None  # Clear price if collection is selected
        return cleaned_data
