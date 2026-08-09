from django.db import models

# Create your models here.
class Location(models.Model):
    region = models.CharField(max_length=250)
    campus = models.CharField(max_length=250, unique=True) 
    abreviation = models.CharField(max_length=50, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.campus} ({self.abreviation})"