from django import forms 

class View_user_signup(forms.Form): 
    email   = forms.EmailField(widget=forms.EmailInput(
        attrs = {
            'type' : 'email',
            'autofocus': '',
        }
    ))
    name    = forms.CharField(max_length=244, required=False, widget=forms.TextInput(
        attrs = {
            'type' : 'text',
            'placeholder': 'Optional display name',
        }
    ))
    password = forms.CharField(widget=forms.PasswordInput(
        attrs = {
            'type' : 'password'
        }
    ))
    confirm_password = forms.CharField(widget=forms.PasswordInput(
        attrs = {
            'type' : 'password',
            'required': '',
        }
    ))
    gender = forms.ChoiceField(
        choices=[('', 'Select Gender'), ('male', 'Male'), ('female', 'Female')],
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    ) 

class View_user_login(forms.Form): 
    email   = forms.EmailField(widget=forms.EmailInput(
        attrs = {
            'type' : 'email',
            'autofocus': '',
        }
    ))
    password = forms.CharField(widget=forms.PasswordInput(
        attrs = {
            'type' : 'password'
        }
    ))