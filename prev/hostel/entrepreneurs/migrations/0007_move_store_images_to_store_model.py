# Generated migration to move logo and cover_photo from Commodity to Store model
# This fixes the incorrect placement of store images in the Commodity model

from django.db import migrations, models
import entrepreneurs.models


class Migration(migrations.Migration):

    dependencies = [
        ('entrepreneurs', '0006_add_monthly_fee_to_store'),
    ]

    operations = [
        # Add logo and cover_photo fields to Store model
        migrations.AddField(
            model_name='store',
            name='logo',
            field=models.ImageField(blank=True, help_text='Store logo image', null=True, upload_to=entrepreneurs.models.store_image_upload_path),
        ),
        migrations.AddField(
            model_name='store',
            name='cover_photo',
            field=models.ImageField(blank=True, help_text='Store cover photo/banner', null=True, upload_to=entrepreneurs.models.store_image_upload_path),
        ),
        # Remove logo and cover_photo fields from Commodity model
        migrations.RemoveField(
            model_name='commodity',
            name='logo',
        ),
        migrations.RemoveField(
            model_name='commodity',
            name='cover_photo',
        ),
        # Update Commodity image field to use the new upload path
        migrations.AlterField(
            model_name='commodity',
            name='image',
            field=models.ImageField(blank=True, help_text='Image of the commodity', null=True, upload_to=entrepreneurs.models.product_image_upload_path),
        ),
    ]

