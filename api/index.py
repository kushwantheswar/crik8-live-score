import os
import sys

# Add backend directory to sys.path so we can import 'core'
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
