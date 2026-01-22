"""
省级基础设施监测预警子系统 - 视图层
提供监测数据驾驶舱、核心档案查询、实时状态监测、移动端一键查询、故障报警
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import random

from utils.mock_data import InfrastructureDataGenerator


class DashboardView(APIView):
    """
    监测数据驾驶舱
    GET /api/infrastructure/dashboard/
    """
    def get(self, request):
        stats = InfrastructureDataGenerator.generate_dashboard_stats()
        
        # 添加图表数据
        stats['health_trend'] = [
            {'month': f'{m}月', 'excellent': random.randint(90, 100), 
             'good': random.randint(30, 40), 'average': random.randint(15, 25),
             'poor': random.randint(3, 8)}
            for m in range(1, 13)
        ]
        
        stats['alert_trend'] = [
            {'date': f'1月{d}日', 'count': random.randint(0, 15)}
            for d in range(1, 31)
        ]
        
        stats['facility_distribution'] = [
            {'type': '桥梁', 'count': stats['bridges']},
            {'type': '隧道', 'count': stats['tunnels']},
            {'type': '收费站', 'count': stats['toll_stations']},
            {'type': '服务区', 'count': stats['service_areas']},
            {'type': '监控中心', 'count': stats['monitoring_centers']},
        ]
        
        data = {
            'stats': stats,
            'update_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class FacilityListView(APIView):
    """
    基础设施档案列表
    GET /api/infrastructure/facilities/
    """
    def get(self, request):
        # 筛选参数
        facility_type = request.query_params.get('type', None)
        status_filter = request.query_params.get('status', None)
        keyword = request.query_params.get('keyword', None)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        facilities = InfrastructureDataGenerator.generate_facilities(50)
        
        # 应用筛选
        if facility_type:
            facilities = [f for f in facilities if f['type'] == facility_type]
        if status_filter:
            facilities = [f for f in facilities if f['status'] == status_filter]
        if keyword:
            facilities = [f for f in facilities if keyword in f['name'] or keyword in f['location']]
        
        total = len(facilities)
        start = (page - 1) * page_size
        paginated = facilities[start:start + page_size]
        
        data = {
            'list': paginated,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': (total + page_size - 1) // page_size
            },
            'type_options': ['桥梁', '隧道', '收费站', '服务区', '监控中心'],
            'status_options': ['优良', '良好', '一般', '较差']
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class FacilityDetailView(APIView):
    """
    设施详情与实时监测数据
    GET /api/infrastructure/facilities/<id>/
    """
    def get(self, request, facility_id):
        facilities = InfrastructureDataGenerator.generate_facilities(50)
        facility = next((f for f in facilities if f['id'] == facility_id), None)
        
        if not facility:
            return Response({'code': 404, 'message': '设施不存在'}, status=404)
        
        # 添加详细信息
        facility['detail'] = {
            'manager': f'管理员{random.randint(1, 20):02d}',
            'phone': f'1{random.randint(30, 99)}{random.randint(10000000, 99999999)}',
            'length': f'{random.randint(100, 5000)}米' if facility['type'] in ['桥梁', '隧道'] else '-',
            'width': f'{random.randint(10, 50)}米' if facility['type'] in ['桥梁', '隧道'] else '-',
            'lanes': random.randint(2, 8),
            'design_load': f'{random.choice(["公路-I级", "公路-II级", "城市-A级"])}',
            'inspection_cycle': '每月1次',
            'next_inspection': '2024-02-15',
        }
        
        # 实时监测数据
        facility['monitoring'] = InfrastructureDataGenerator.generate_monitoring_data(facility_id)
        
        # 历史监测趋势（最近24小时）
        facility['monitoring_history'] = [
            {
                'time': f'{h:02d}:00',
                'temperature': round(random.uniform(18, 28), 1),
                'humidity': round(random.uniform(50, 75), 1),
                'vibration': round(random.uniform(0.1, 3.0), 2),
                'displacement': round(random.uniform(0, 1.5), 3)
            }
            for h in range(24)
        ]
        
        # 检查记录
        facility['inspection_records'] = [
            {
                'id': i,
                'date': InfrastructureDataGenerator.random_datetime(90),
                'type': random.choice(['日常巡检', '定期检测', '专项检查']),
                'result': random.choice(['正常', '存在隐患', '需要维修']),
                'inspector': f'检查员{random.randint(1, 10):02d}'
            }
            for i in range(1, 6)
        ]
        
        return Response({'code': 200, 'message': 'success', 'data': facility})


class RealtimeMonitoringView(APIView):
    """
    实时监测数据
    GET /api/infrastructure/monitoring/<facility_id>/
    """
    def get(self, request, facility_id):
        data = InfrastructureDataGenerator.generate_monitoring_data(facility_id)
        return Response({'code': 200, 'message': 'success', 'data': data})


class MobileQueryView(APIView):
    """
    移动端一键查询
    GET /api/infrastructure/mobile/query/
    POST /api/infrastructure/mobile/query/
    """
    def get(self, request):
        # 获取查询参数
        code = request.query_params.get('code', None)
        keyword = request.query_params.get('keyword', None)
        
        if not code and not keyword:
            return Response({
                'code': 400, 
                'message': '请提供设施编码或关键词',
                'data': None
            }, status=400)
        
        facilities = InfrastructureDataGenerator.generate_facilities(50)
        
        if code:
            result = next((f for f in facilities if f['code'] == code), None)
            if result:
                result['monitoring'] = InfrastructureDataGenerator.generate_monitoring_data(result['id'])
                return Response({'code': 200, 'message': 'success', 'data': result})
            return Response({'code': 404, 'message': '未找到设施'}, status=404)
        
        if keyword:
            results = [f for f in facilities if keyword in f['name'] or keyword in f['location']][:5]
            for r in results:
                r['monitoring'] = InfrastructureDataGenerator.generate_monitoring_data(r['id'])
            return Response({'code': 200, 'message': 'success', 'data': {'list': results, 'total': len(results)}})
    
    def post(self, request):
        # 扫码查询（模拟）
        qr_code = request.data.get('qr_code', '')
        
        facilities = InfrastructureDataGenerator.generate_facilities(50)
        # 模拟根据二维码查询
        result = random.choice(facilities)
        result['monitoring'] = InfrastructureDataGenerator.generate_monitoring_data(result['id'])
        
        return Response({'code': 200, 'message': 'success', 'data': result})


class FaultAlertView(APIView):
    """
    系统运行故障报警
    GET /api/infrastructure/alerts/ - 获取报警列表
    POST /api/infrastructure/alerts/ - 创建报警
    PUT /api/infrastructure/alerts/<id>/handle/ - 处理报警
    """
    def get(self, request):
        status_filter = request.query_params.get('status', None)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        alerts = InfrastructureDataGenerator.generate_fault_alerts(30)
        
        if status_filter:
            alerts = [a for a in alerts if a['status'] == status_filter]
        
        total = len(alerts)
        start = (page - 1) * page_size
        paginated = alerts[start:start + page_size]
        
        # 统计
        stats = {
            'total': total,
            'pending': len([a for a in alerts if a['status'] == '未处理']),
            'processing': len([a for a in alerts if a['status'] == '处理中']),
            'resolved': len([a for a in alerts if a['status'] == '已处理'])
        }
        
        data = {
            'list': paginated,
            'stats': stats,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': (total + page_size - 1) // page_size
            }
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
    
    def post(self, request):
        # 创建报警（通常由系统自动触发）
        data = request.data
        new_alert = {
            'id': random.randint(100, 999),
            'facility': data.get('facility'),
            'fault_type': data.get('fault_type'),
            'description': data.get('description'),
            'status': '未处理',
            'time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': '报警已创建', 'data': new_alert})
    
    def put(self, request, alert_id=None):
        # 处理报警
        action = request.data.get('action', 'process')
        
        if action == 'process':
            result = {
                'id': alert_id,
                'status': '处理中',
                'handler': request.data.get('handler', '运维员01'),
                'process_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        elif action == 'resolve':
            result = {
                'id': alert_id,
                'status': '已处理',
                'handler': request.data.get('handler'),
                'resolve_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                'solution': request.data.get('solution', '')
            }
        else:
            return Response({'code': 400, 'message': '无效操作'}, status=400)
        
        return Response({'code': 200, 'message': '操作成功', 'data': result})


class MapOverviewView(APIView):
    """
    设施地图总览
    GET /api/infrastructure/map/
    """
    def get(self, request):
        facilities = InfrastructureDataGenerator.generate_facilities(50)
        
        # 按类型分组
        grouped = {}
        for f in facilities:
            t = f['type']
            if t not in grouped:
                grouped[t] = []
            grouped[t].append({
                'id': f['id'],
                'name': f['name'],
                'status': f['status'],
                'status_color': f['status_color'],
                'coordinates': f['coordinates']
            })
        
        data = {
            'facilities': grouped,
            'center': {'lng': 120.15, 'lat': 30.25},
            'zoom': 8,
            'total': len(facilities),
            'update_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
