from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialApp
from django.conf import settings
from django.contrib.sites.models import Site
from .models import CustomUser, Profile
from django.contrib.messages import get_messages
from urllib.parse import urlencode


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        email = sociallogin.user.email
        username = sociallogin.user.username or email.split('@')[0]
        print(f"Processing user with email: {email}, username: {username}")
        try:
            user = CustomUser.objects.get(email=email)
            print(f"Found existing user: {user.id}")
        except CustomUser.DoesNotExist:
            user = CustomUser.objects.create(
                email=email,
                username=username,
                is_active=True
            )
            user.set_unusable_password()
            user.save()
            print(f"Created new user: {user.id}")
        
        # ensure Profile exists and is verified
        profile, created = Profile.objects.get_or_create(user=user, defaults={'is_verified': True})
        if not created and not profile.is_verified:
            profile.is_verified = True
            profile.save()
            print(f"Updated profile for user {user.id} to is_verified=True")
        else:
            print(f"Profile for user {user.id} is {'created' if created else 'already verified'}")

        sociallogin.user = user
        sociallogin.save(request)
        print(f"Social login saved for user: {user.id}")

        # clear messages to prevent session-based redirects
        get_messages(request).used = True
        print("Cleared Django messages to prevent session interference")

        return user

    def get_login_redirect_url(self, request):
        """
        After successful social login, redirect to the frontend with the remember param.
        """
        state = request.GET.get('state', '')
        remember = 'true' if 'remember:true' in state else 'false'
        params = {
            'remember': remember,
        }
        redirect_url = f"http://localhost:5173/login/callback/?{urlencode(params)}"
        print(f"Redirecting to: {redirect_url}")
        return redirect_url

    # def get_app(self, request, provider):
    #     site_id = getattr(settings, 'SITE_ID', None)
    #     if not site_id:
    #         raise ValueError("SITE_ID is not defined in settings.py")

    #     try:
    #         site = Site.objects.get(id=site_id)
    #     except Site.DoesNotExist:
    #         raise ValueError(f"Site with ID {site_id} does not exist in the database")

    #     print(f"Fetching SocialApp for provider: {provider}, SITE_ID: {site_id}")
    #     apps = SocialApp.objects.filter(provider=provider, sites=site)
    #     print(f"Found apps: {list(apps)}")
    #     if len(apps) > 1:
    #         print(f"Multiple SocialApps found for provider {provider}: {list(apps)}")
    #         raise Exception(f"Multiple SocialApps found: {list(apps)}")
    #     elif len(apps) == 0:
    #         print(f"No SocialApp found for provider {provider} and site {site_id}")
    #         raise Exception(f"No SocialApp found for provider {provider}")
    #     return apps[0]