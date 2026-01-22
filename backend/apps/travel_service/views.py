"""
省级一张网出行服务子系统 - 视图层
提供出行地图查询、服务区/绿通预约、一键救援、交旅融合资源推荐
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import random

from utils.mock_data import TravelServiceDataGenerator


class TravelMapView(APIView):
    """
    出行地图查询（路况/气象/服务设施）
    GET /api/travel/map/
    """
    def get(self, request):
        # 获取查询参数
        layer = request.query_params.get('layer', 'all')  # road/weather/service/all
        
        map_data = TravelServiceDataGenerator.generate_map_data()
        
        data = {
            'center': {'lng': 120.15, 'lat': 30.25},
            'zoom': 8,
            'update_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        if layer == 'all' or layer == 'road':
            data['roads'] = map_data['roads']
        if layer == 'all' or layer == 'weather':
            data['weather'] = map_data['weather']
        if layer == 'all' or layer == 'service':
            data['services'] = map_data['services']
        if layer == 'all':
            data['pois'] = map_data['pois']
        
        # 添加图层统计
        data['layer_stats'] = {
            'smooth_roads': len([r for r in map_data['roads'] if r['condition'] == '畅通']),
            'congested_roads': len([r for r in map_data['roads'] if r['condition'] in ['拥堵', '管制']]),
            'service_areas': len(map_data['services']),
            'weather_stations': len(map_data['weather'])
        }
        
        return Response({'code': 200, 'message': 'success', 'data': data})


class RoadConditionView(APIView):
    """
    路况查询
    GET /api/travel/road-condition/
    """
    def get(self, request):
        highway = request.query_params.get('highway', None)
        
        roads = TravelServiceDataGenerator.generate_road_conditions(50)
        
        if highway:
            roads = [r for r in roads if highway in r['road']]
        
        # 按状态统计
        stats = {
            'total': len(roads),
            'smooth': len([r for r in roads if r['condition'] == '畅通']),
            'slow': len([r for r in roads if r['condition'] == '缓行']),
            'congested': len([r for r in roads if r['condition'] == '拥堵']),
            'blocked': len([r for r in roads if r['condition'] == '管制'])
        }
        
        data = {
            'roads': roads,
            'stats': stats,
            'highways': TravelServiceDataGenerator.HIGHWAYS,
            'update_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class WeatherView(APIView):
    """
    气象信息查询
    GET /api/travel/weather/
    """
    def get(self, request):
        weather_data = TravelServiceDataGenerator.generate_weather_stations(20)
        
        # 天气预警
        warnings = []
        for w in weather_data:
            if w['weather'] in ['大雨', '雾']:
                warnings.append({
                    'station': w['station'],
                    'type': '气象预警',
                    'level': '黄色' if w['weather'] == '大雨' else '橙色',
                    'content': f'{w["station"]}附近{w["weather"]}，能见度{w["visibility"]}km，请注意行车安全'
                })
        
        data = {
            'stations': weather_data,
            'warnings': warnings,
            'update_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class ServiceAreaView(APIView):
    """
    服务区查询与预约
    GET /api/travel/service-areas/ - 查询服务区
    GET /api/travel/service-areas/<id>/ - 服务区详情
    """
    def get(self, request, area_id=None):
        services = TravelServiceDataGenerator.generate_service_facilities(20)
        
        if area_id:
            area = next((s for s in services if s['id'] == area_id), None)
            if area:
                # 添加详情
                area['detail'] = {
                    'facilities': [
                        {'name': '加油站', 'status': '营业中', 'oil_types': ['92#', '95#', '98#', '柴油']},
                        {'name': '餐饮区', 'status': '营业中', 'restaurants': ['快餐', '面食', '小吃']},
                        {'name': '超市', 'status': '营业中', 'area': '200㎡'},
                        {'name': '充电桩', 'status': '可用', 'count': random.randint(4, 12), 'available': random.randint(1, 8)},
                        {'name': '卫生间', 'status': '正常', 'count': 20},
                    ],
                    'parking_detail': {
                        'car': {'total': random.randint(100, 200), 'available': random.randint(30, 100)},
                        'truck': {'total': random.randint(50, 100), 'available': random.randint(10, 50)},
                        'bus': {'total': random.randint(10, 30), 'available': random.randint(5, 15)}
                    },
                    'busy_hours': ['10:00-12:00', '17:00-19:00'],
                    'contact': f'0571-{random.randint(80000000, 89999999)}'
                }
                return Response({'code': 200, 'message': 'success', 'data': area})
            return Response({'code': 404, 'message': '服务区不存在'}, status=404)
        
        # 筛选参数
        highway = request.query_params.get('highway', None)
        
        if highway:
            services = [s for s in services if highway in s['highway']]
        
        data = {
            'list': services,
            'total': len(services),
            'highways': TravelServiceDataGenerator.HIGHWAYS
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class ReservationView(APIView):
    """
    服务区/绿通预约
    GET /api/travel/reservations/ - 预约列表
    POST /api/travel/reservations/ - 创建预约
    PUT /api/travel/reservations/<id>/cancel/ - 取消预约
    """
    def get(self, request):
        reservations = TravelServiceDataGenerator.generate_reservations(30)
        
        # 筛选
        res_type = request.query_params.get('type', None)
        status_filter = request.query_params.get('status', None)
        
        if res_type:
            reservations = [r for r in reservations if r['type'] == res_type]
        if status_filter:
            reservations = [r for r in reservations if r['status'] == status_filter]
        
        data = {
            'list': reservations[:20],
            'total': len(reservations),
            'stats': {
                'pending': len([r for r in reservations if r['status'] == '待确认']),
                'confirmed': len([r for r in reservations if r['status'] == '已确认']),
                'completed': len([r for r in reservations if r['status'] == '已完成']),
                'cancelled': len([r for r in reservations if r['status'] == '已取消'])
            }
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
    
    def post(self, request):
        data = request.data
        
        new_reservation = {
            'id': random.randint(100, 999),
            'reservation_no': f'RES{timezone.now().strftime("%Y%m%d%H%M%S")}',
            'type': data.get('type', '服务区预约'),
            'user_name': data.get('user_name'),
            'phone': data.get('phone'),
            'vehicle_no': data.get('vehicle_no'),
            'service_area': data.get('service_area'),
            'appointment_time': data.get('appointment_time'),
            'status': '待确认',
            'create_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # 模拟自动确认
        if data.get('type') == '绿通预约':
            new_reservation['status'] = '已确认'
            new_reservation['green_pass_info'] = {
                'pass_no': f'GT{timezone.now().strftime("%Y%m%d")}{random.randint(1000, 9999)}',
                'valid_time': '24小时',
                'entry_points': ['G1高速入口', 'G2高速入口'],
                'notes': '请携带绿通证明材料'
            }
        
        return Response({'code': 200, 'message': '预约成功', 'data': new_reservation})
    
    def put(self, request, reservation_id=None):
        result = {
            'id': reservation_id,
            'status': '已取消',
            'cancel_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'cancel_reason': request.data.get('reason', '用户取消')
        }
        return Response({'code': 200, 'message': '预约已取消', 'data': result})


class RescueView(APIView):
    """
    一键救援
    GET /api/travel/rescue/ - 救援记录
    POST /api/travel/rescue/ - 发起救援
    GET /api/travel/rescue/<id>/status/ - 查询救援状态
    """
    def get(self, request, rescue_id=None):
        if rescue_id:
            # 查询救援状态
            requests = TravelServiceDataGenerator.generate_rescue_requests(20)
            rescue = next((r for r in requests if r['id'] == rescue_id), None)
            
            if rescue:
                # 添加救援进度
                rescue['progress'] = [
                    {'time': rescue['create_time'], 'status': '已提交', 'description': '救援请求已提交'},
                ]
                if rescue['status'] in ['已派单', '救援中', '已完成']:
                    rescue['progress'].append({
                        'time': TravelServiceDataGenerator.random_datetime(0),
                        'status': '已派单',
                        'description': f'已安排救援人员，预计{random.randint(15, 30)}分钟到达'
                    })
                    rescue['rescuer'] = f'救援员{random.randint(1, 20):02d}'
                    rescue['rescuer_phone'] = f'1{random.randint(30, 99)}{random.randint(10000000, 99999999)}'
                    rescue['eta'] = random.randint(10, 25)
                if rescue['status'] in ['救援中', '已完成']:
                    rescue['progress'].append({
                        'time': TravelServiceDataGenerator.random_datetime(0),
                        'status': '救援中',
                        'description': '救援人员已到达现场'
                    })
                if rescue['status'] == '已完成':
                    rescue['progress'].append({
                        'time': TravelServiceDataGenerator.random_datetime(0),
                        'status': '已完成',
                        'description': '救援完成，祝您一路平安'
                    })
                return Response({'code': 200, 'message': 'success', 'data': rescue})
            return Response({'code': 404, 'message': '救援记录不存在'}, status=404)
        
        # 救援记录列表
        requests = TravelServiceDataGenerator.generate_rescue_requests(20)
        
        data = {
            'list': requests,
            'stats': {
                'pending': len([r for r in requests if r['status'] == '待接单']),
                'assigned': len([r for r in requests if r['status'] == '已派单']),
                'rescuing': len([r for r in requests if r['status'] == '救援中']),
                'completed': len([r for r in requests if r['status'] == '已完成'])
            }
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
    
    def post(self, request):
        data = request.data
        
        new_rescue = {
            'id': random.randint(100, 999),
            'request_no': f'SOS{timezone.now().strftime("%Y%m%d%H%M%S")}',
            'type': data.get('type', '车辆故障'),
            'location': data.get('location'),
            'coordinates': data.get('coordinates', TravelServiceDataGenerator.random_location()),
            'user_name': data.get('user_name'),
            'phone': data.get('phone'),
            'vehicle_no': data.get('vehicle_no'),
            'description': data.get('description', ''),
            'status': '待接单',
            'create_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'message': '救援请求已提交，正在为您匹配最近的救援力量',
            'estimated_response': '5-10分钟内派单'
        }
        
        return Response({'code': 200, 'message': '救援请求已提交', 'data': new_rescue})


class TravelRecommendationView(APIView):
    """
    交旅融合资源推荐
    GET /api/travel/recommendations/ - 推荐列表
    GET /api/travel/recommendations/<id>/ - 路线详情
    """
    def get(self, request, route_id=None):
        recommendations = TravelServiceDataGenerator.generate_travel_recommendations(15)
        
        if route_id:
            route = next((r for r in recommendations if r['id'] == route_id), None)
            if route:
                # 添加详情
                route['detail'] = {
                    'itinerary': [
                        {'day': 1, 'title': '启程', 
                         'activities': ['集合出发', '途经服务区休息', '抵达第一站', '入住酒店']},
                        {'day': 2, 'title': '深度游览',
                         'activities': ['早餐后出发', '游览主景点', '品尝当地美食', '返程或续住']}
                    ],
                    'included': ['高速通行费', '景点门票', '导游服务', '旅游保险'],
                    'excluded': ['个人消费', '餐饮自理部分', '住宿升级差价'],
                    'tips': [
                        '建议提前3天预约',
                        '请携带有效身份证件',
                        '关注天气预报，备好防雨用具'
                    ],
                    'related_services': [
                        {'name': '沿途服务区', 'count': random.randint(3, 8)},
                        {'name': '加油站', 'count': random.randint(5, 15)},
                        {'name': '充电桩', 'count': random.randint(10, 30)}
                    ]
                }
                return Response({'code': 200, 'message': 'success', 'data': route})
            return Response({'code': 404, 'message': '路线不存在'}, status=404)
        
        # 获取筛选参数
        theme = request.query_params.get('theme', None)
        
        if theme:
            recommendations = [r for r in recommendations if r['theme'] == theme]
        
        # 主题列表
        themes = list(set(r['theme'] for r in recommendations))
        
        data = {
            'list': recommendations,
            'themes': themes,
            'total': len(recommendations),
            'featured': [r for r in recommendations if r['rating'] >= 4.5][:3]
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class POISearchView(APIView):
    """
    兴趣点搜索
    GET /api/travel/poi/search/
    """
    def get(self, request):
        keyword = request.query_params.get('keyword', '')
        poi_type = request.query_params.get('type', None)
        
        pois = TravelServiceDataGenerator.generate_pois(30)
        
        if keyword:
            pois = [p for p in pois if keyword in p['name']]
        if poi_type:
            pois = [p for p in pois if p['type'] == poi_type]
        
        data = {
            'list': pois[:20],
            'total': len(pois),
            'types': ['景点', '酒店', '美食', '加油站', '停车场']
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
