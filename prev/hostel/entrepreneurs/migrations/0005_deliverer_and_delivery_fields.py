# Generated manually for delivery system
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('entrepreneurs', '0004_commodity_category_slug'),
    ]

    operations = [
        # Create Deliverer model
        migrations.CreateModel(
            name='Deliverer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('location', models.CharField(blank=True, help_text="Deliverer's hostel/campus location", max_length=255, null=True)),
                ('phone_number', models.CharField(blank=True, help_text='Contact phone number for delivery coordination', max_length=20, null=True)),
                ('is_active', models.BooleanField(default=True, help_text='Whether deliverer is actively accepting deliveries')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='deliverer_profile', to=settings.AUTH_USER_MODEL, help_text='User who is a deliverer')),
            ],
            options={
                'verbose_name': 'Deliverer',
                'verbose_name_plural': 'Deliverers',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='deliverer',
            constraint=models.UniqueConstraint(fields=['user'], name='unique_deliverer_user'),
        ),
        # Update Transaction model with delivery fields
        migrations.AddField(
            model_name='transaction',
            name='delivery_fee',
            field=models.DecimalField(decimal_places=2, default=0.0, help_text='Delivery fee (8.5% of price)', max_digits=10),
        ),
        migrations.AddField(
            model_name='transaction',
            name='deliverer',
            field=models.ForeignKey(blank=True, help_text='Deliverer assigned to this transaction', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='deliveries', to='entrepreneurs.deliverer'),
        ),
        migrations.AddField(
            model_name='transaction',
            name='delivery_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('assigned', 'Assigned'), ('in_transit', 'In Transit'), ('delivered', 'Delivered'), ('completed', 'Completed')], default='pending', help_text='Delivery status', max_length=20),
        ),
        migrations.AddField(
            model_name='transaction',
            name='deliverer_confirmed',
            field=models.BooleanField(default=False, help_text='Deliverer confirmed delivery'),
        ),
        migrations.AddField(
            model_name='transaction',
            name='buyer_confirmed',
            field=models.BooleanField(default=False, help_text='Buyer confirmed delivery'),
        ),
        migrations.AddField(
            model_name='transaction',
            name='seller_confirmed',
            field=models.BooleanField(default=False, help_text='Seller confirmed delivery'),
        ),
        migrations.AddField(
            model_name='transaction',
            name='buyer_location',
            field=models.CharField(blank=True, help_text="Buyer's hostel/location", max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='seller_location',
            field=models.CharField(blank=True, help_text="Seller's store location", max_length=255, null=True),
        ),
        # Update status choices
        migrations.AlterField(
            model_name='transaction',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('delivery_assigned', 'Delivery Assigned'), ('delivery_confirmed', 'Delivery Confirmed'), ('buyer_confirmed', 'Buyer Confirmed'), ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('refunded', 'Refunded')], default='pending', help_text='Transaction status', max_length=20),
        ),
        # Add indexes
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['deliverer', '-transaction_date'], name='entrepreneu_deliver_trans_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['status', 'delivery_status'], name='entrepreneu_status_del_idx'),
        ),
    ]

