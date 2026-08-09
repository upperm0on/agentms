# Generated migration for adding monthly fee fields to Store model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('entrepreneurs', '0005_deliverer_and_delivery_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='store',
            name='monthly_fee_percentage',
            field=models.DecimalField(decimal_places=2, default=5.00, help_text='Monthly fee percentage (5% default)', max_digits=5),
        ),
        migrations.AddField(
            model_name='store',
            name='last_monthly_fee_date',
            field=models.DateTimeField(blank=True, help_text='Last date monthly fee was calculated', null=True),
        ),
    ]


