from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage

class Command(BaseCommand):
    help = 'Prints the default storage backend class'

    def handle(self, *args, **options):
        print("Default storage backend:", default_storage.__class__)