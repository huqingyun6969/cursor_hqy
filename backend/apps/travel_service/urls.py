"""
省级一张网出行服务子系统 - URL路由配置
"""
from django.urls import path
from . import views

app_name = 'travel_service'

urlpatterns = [
    # 出行地图
    path('map/', views.TravelMapView.as_view(), name='map'),
    
    # 路况查询
    path('road-condition/', views.RoadConditionView.as_view(), name='road-condition'),
    
    # 气象信息
    path('weather/', views.WeatherView.as_view(), name='weather'),
    
    # 服务区
    path('service-areas/', views.ServiceAreaView.as_view(), name='service-areas'),
    path('service-areas/<int:area_id>/', views.ServiceAreaView.as_view(), name='service-area-detail'),
    
    # 预约
    path('reservations/', views.ReservationView.as_view(), name='reservations'),
    path('reservations/<int:reservation_id>/cancel/', views.ReservationView.as_view(), name='reservation-cancel'),
    
    # 一键救援
    path('rescue/', views.RescueView.as_view(), name='rescue'),
    path('rescue/<int:rescue_id>/status/', views.RescueView.as_view(), name='rescue-status'),
    
    # 交旅融合推荐
    path('recommendations/', views.TravelRecommendationView.as_view(), name='recommendations'),
    path('recommendations/<int:route_id>/', views.TravelRecommendationView.as_view(), name='recommendation-detail'),
    
    # POI搜索
    path('poi/search/', views.POISearchView.as_view(), name='poi-search'),
]
