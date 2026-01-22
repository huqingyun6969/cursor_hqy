"""
省级综合交通运输信息平台 - URL配置
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # 子系统API路由
    path('api/traffic-warning/', include('apps.traffic_warning.urls')),
    path('api/emergency/', include('apps.emergency_command.urls')),
    path('api/infrastructure/', include('apps.infrastructure.urls')),
    path('api/travel/', include('apps.travel_service.urls')),
]
