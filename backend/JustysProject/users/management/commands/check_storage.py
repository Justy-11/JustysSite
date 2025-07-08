from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from django.conf import settings

class Command(BaseCommand):
    help = 'Prints the default storage backend class and storage-related settings'

    def handle(self, *args, **options):
        print("Default storage backend:", default_storage.__class__)
        # print("DEFAULT_FILE_STORAGE:", getattr(settings, "DEFAULT_FILE_STORAGE", None))
        # print("AWS_ACCESS_KEY_ID:", getattr(settings, "AWS_ACCESS_KEY_ID", None))
        # print("AWS_SECRET_ACCESS_KEY:", getattr(settings, "AWS_SECRET_ACCESS_KEY", None))
        # print("AWS_STORAGE_BUCKET_NAME:", getattr(settings, "AWS_STORAGE_BUCKET_NAME", None))
        # print("AWS_S3_ENDPOINT_URL:", getattr(settings, "AWS_S3_ENDPOINT_URL", None))
        # print("AWS_S3_REGION_NAME:", getattr(settings, "AWS_S3_REGION_NAME", None))
        # print("AWS_S3_SIGNATURE_VERSION:", getattr(settings, "AWS_S3_SIGNATURE_VERSION", None))
        # print("AWS_S3_ADDRESSING_STYLE:", getattr(settings, "AWS_S3_ADDRESSING_STYLE", None))