# Generated manually to update upload paths

from django.db import migrations, models
import users.models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_page_is_published'),
    ]

    operations = [
        migrations.AlterField(
            model_name='page',
            name='profile_image',
            field=models.ImageField(blank=True, null=True, upload_to=users.models.Page.upload_to_profile_image),
        ),
        migrations.AlterField(
            model_name='page',
            name='banner_image',
            field=models.ImageField(blank=True, null=True, upload_to=users.models.Page.upload_to_banner_image),
        ),
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to=users.models.Product.upload_to_product_image),
        ),
    ] 