from .models import Hostel

from django import forms

class Views_addHostel(forms.ModelForm): 
    class Meta: 
        model = Hostel 
        fields = ["name", "campus", "category", "image", "checkout"]

    checkout = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        required=False,
        label="Checkout Date"
    )
