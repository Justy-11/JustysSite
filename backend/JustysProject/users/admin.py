from django.contrib import admin
from .models import CustomUser, Profile, Page, Product, Collection

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'

class PageInline(admin.StackedInline):
    model = Page
    can_delete = False
    verbose_name_plural = 'Page'

class ProductInline(admin.StackedInline):
    model = Product
    can_delete = True
    verbose_name_plural = 'Products'
    extra = 0  # No extra empty forms by default

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    inlines = (ProfileInline, PageInline)  # <<< This makes Profile show inside User page

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'is_verified', 'otp', 'otp_created_at', 'phone_number', 'street', 'city', 'state', 'zip_code', 'social_links')
    search_fields = ('user__username', 'user__email', 'phone_number')
    list_filter = ('is_verified',)

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'about', 'tagline','banner_image','profile_image', 'product_name', 'email', 'phone', 'created_at', 'updated_at')
    search_fields = ('user__username', 'product_name', 'email')
    list_filter = ('created_at', 'updated_at')

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'created_at', 'updated_at')
    search_fields = ('name', 'user__username')
    list_filter = ('created_at', 'updated_at')
    inlines = (ProductInline,)  # Show Products within Collection

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description', 'user', 'collection', 'price', 'stock', 'image','created_at', 'updated_at')
    search_fields = ('title', 'user__username', 'collection__name')
    list_filter = ('created_at', 'updated_at', 'collection')