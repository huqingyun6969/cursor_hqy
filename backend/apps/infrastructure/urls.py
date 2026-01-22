"""
省级基础设施监测预警子系统 - URL路由配置
"""
from django.urls import path
from . import views

app_name = 'infrastructure'

urlpatterns = [
    # 驾驶舱
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    
    # 设施档案
    path('facilities/', views.FacilityListView.as_view(), name='facilities'),
    path('facilities/<int:facility_id>/', views.FacilityDetailView.as_view(), name='facility-detail'),
    
    # 实时监测
    path('monitoring/<int:facility_id>/', views.RealtimeMonitoringView.as_view(), name='monitoring'),
    
    # 移动端一键查询
    path('mobile/query/', views.MobileQueryView.as_view(), name='mobile-query'),
    
    # 故障报警
    path('alerts/', views.FaultAlertView.as_view(), name='alerts'),
    path('alerts/<int:alert_id>/handle/', views.FaultAlertView.as_view(), name='alert-handle'),
    
    # 地图总览
    path('map/', views.MapOverviewView.as_view(), name='map'),
]
