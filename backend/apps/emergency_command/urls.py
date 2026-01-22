"""
省级交通应急指挥调度管理子系统 - URL路由配置
"""
from django.urls import path
from . import views

app_name = 'emergency_command'

urlpatterns = [
    # 应急概览
    path('overview/', views.EmergencyOverviewView.as_view(), name='overview'),
    
    # 应急资源管理
    path('resources/', views.EmergencyResourceView.as_view(), name='resources'),
    path('resources/map/', views.EmergencyResourceView.as_view(), name='resources-map'),
    
    # 应急预案
    path('plans/', views.EmergencyPlanView.as_view(), name='plans'),
    path('plans/<int:plan_id>/', views.EmergencyPlanView.as_view(), name='plan-detail'),
    path('plans/invoke/', views.EmergencyPlanView.as_view(), name='plan-invoke'),
    
    # 应急事件
    path('events/', views.EmergencyEventView.as_view(), name='events'),
    path('events/<int:event_id>/', views.EmergencyEventView.as_view(), name='event-detail'),
    path('events/<int:event_id>/dispatch/', views.EmergencyEventView.as_view(), {'action': 'dispatch'}, name='event-dispatch'),
    path('events/<int:event_id>/complete/', views.EmergencyEventView.as_view(), {'action': 'complete'}, name='event-complete'),
    path('events/<int:event_id>/review/', views.EmergencyEventView.as_view(), {'action': 'review'}, name='event-review'),
    
    # 值班排班
    path('duty/', views.DutyScheduleView.as_view(), name='duty'),
    path('duty/<int:schedule_id>/', views.DutyScheduleView.as_view(), name='duty-detail'),
    
    # 分级叫应
    path('dispatch/call/', views.EventDispatchView.as_view(), name='dispatch-call'),
]
