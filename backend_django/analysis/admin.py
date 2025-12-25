from django.contrib import admin
from django import forms
from django.contrib import messages
from django.utils.html import format_html
from .models import AIPrompt, AIPromptVersion

class AIPromptForm(forms.ModelForm):
    class Meta:
        model = AIPrompt
        fields = '__all__'
        widgets = {
            'prompt_text': forms.Textarea(attrs={
                'rows': 15,
                'style': 'width: 100%; font-family: monospace;',
                'placeholder': 'Введите промт для ИИ...\nИспользуйте переменные: {text_data}, {file_type}, {file_name}'
            }),
            'description': forms.Textarea(attrs={'rows': 3}),
        }
    
    def clean_prompt_text(self):
        prompt_text = self.cleaned_data.get('prompt_text')
        if not prompt_text:
            raise forms.ValidationError("Текст промта не может быть пустым")
        
        required_vars = ['{text_data}', '{file_type}']
        for var in required_vars:
            if var not in prompt_text:
                raise forms.ValidationError(f"Промт должен содержать переменную {var}")
        
        return prompt_text

class AIPromptVersionInline(admin.TabularInline):
    model = AIPromptVersion
    readonly_fields = ['version', 'prompt_text', 'change_reason', 'created_at', 'created_by']
    extra = 0
    max_num = 10
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(AIPrompt)
class AIPromptAdmin(admin.ModelAdmin):
    form = AIPromptForm
    list_display = ['name', 'file_type_display', 'is_active_badge', 'preview', 'updated_at']
    list_filter = ['file_type', 'is_active', 'created_at']
    search_fields = ['name', 'prompt_text', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'version_count']
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'file_type', 'is_active')
        }),
        ('Промт ИИ', {
            'fields': ('prompt_text',),
            'description': 'Используйте переменные: {text_data} - текст из файла, {file_type} - тип файла, {file_name} - имя файла'
        }),
        ('Системная информация', {
            'fields': ('created_by', 'created_at', 'updated_at', 'version_count'),
            'classes': ('collapse',)
        }),
    )
    inlines = [AIPromptVersionInline]
    actions = ['activate_prompts', 'deactivate_prompts', 'load_from_file']
    
    
    
    def file_type_display(self, obj):
        icons = {
            'all': '🌐',
            'image': '🖼️',
            'pdf': '📄',
            'docx': '📝',
            'text': '📃',
            'dicom': '🏥',
        }
        return f"{icons.get(obj.file_type, '📁')} {obj.get_file_type_display()}"
    file_type_display.short_description = 'Тип файла'
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html('<span class="badge badge-success">✓ Активен</span>')
        return format_html('<span class="badge badge-secondary">✗ Неактивен</span>')
    is_active_badge.short_description = 'Статус'
    
    def preview(self, obj):
        """Превью промта"""
        preview_text = obj.prompt_text[:100] + '...' if len(obj.prompt_text) > 100 else obj.prompt_text
        return format_html('<code style="background:#f5f5f5;padding:2px 5px;border-radius:3px;">{}</code>', preview_text)
    preview.short_description = 'Превью промта'
    
    
    def version_count(self, obj):
        return obj.versions.count()
    version_count.short_description = 'Версий'
    
    def save_model(self, request, obj, form, change):
        if change:
            last_version = obj.versions.order_by('-version').first()
            new_version = (last_version.version + 1) if last_version else 1
            
            AIPromptVersion.objects.create(
                prompt=obj,
                prompt_text=form.cleaned_data['prompt_text'],
                version=new_version,
                change_reason=request.POST.get('change_reason', 'Изменено через админку'),
                created_by=request.user
            )
        
        if not obj.created_by:
            obj.created_by = request.user
        
        super().save_model(request, obj, form, change)
        
        if change:
            messages.success(request, f'Промт "{obj.name}" обновлен. Создана версия v{new_version}')
    
    def activate_prompts(self, request, queryset):
        """Активировать выбранные промты"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} промтов активировано')
    activate_prompts.short_description = "Активировать выбранные промты"
    
    def deactivate_prompts(self, request, queryset):
        """Деактивировать выбранные промты"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} промтов деактивировано')
    deactivate_prompts.short_description = "Деактивировать выбранные промты"

@admin.register(AIPromptVersion)
class AIPromptVersionAdmin(admin.ModelAdmin):
    """Админка для версий промтов"""
    list_display = ['prompt_name', 'version', 'preview', 'created_at', 'created_by']
    list_filter = ['created_at', 'created_by']
    search_fields = ['prompt__name', 'prompt_text']
    readonly_fields = ['prompt', 'version', 'prompt_text', 'change_reason', 'created_at', 'created_by']
    
    def prompt_name(self, obj):
        return obj.prompt.name
    prompt_name.short_description = 'Промт'
    
    def preview(self, obj):
        preview_text = obj.prompt_text[:80] + '...' if len(obj.prompt_text) > 80 else obj.prompt_text
        return format_html('<code>{}</code>', preview_text)
    preview.short_description = 'Превью'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False