"""
省级交通运行预警预测子系统 - URL路由配置
"""
from django.urls import path
from . import views

app_name = 'traffic_warning'

urlpatterns = [
    # 全省交通态势概览
    path('overview/', views.TrafficOverviewView.as_view(), name='overview'),
    
    # 车流量预测
    path('flow-prediction/', views.TrafficFlowPredictionView.as_view(), name='flow-prediction'),
    
    # 路网拥堵状态
    path('congestion/', views.RoadCongestionView.as_view(), name='congestion'),
    
    # 预警规则配置
    path('rules/', views.WarningRulesView.as_view(), name='rules'),
    path('rules/<int:rule_id>/', views.WarningRulesView.as_view(), name='rule-detail'),
    
    # 预警信息列表
    path('warnings/', views.WarningListView.as_view(), name='warnings'),
    
    # 运行报表
    path('report/', views.TrafficReportView.as_view(), name='report'),
    path('report/generate/', views.TrafficReportView.as_view(), name='report-generate'),
    
    # 地图数据
    path('map-data/', views.MapDataView.as_view(), name='map-data'),
]
