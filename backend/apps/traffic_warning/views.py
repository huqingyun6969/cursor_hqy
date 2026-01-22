"""
省级交通运行预警预测子系统 - 视图层
提供路网拥堵/车流量预测、全省交通态势可视化、预警规则配置、运行指标查询与报表
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import random

from utils.mock_data import TrafficDataGenerator


class TrafficOverviewView(APIView):
    """
    全省交通态势"一张图"概览数据
    GET /api/traffic-warning/overview/
    """
    def get(self, request):
        # 生成概览统计数据
        data = {
            'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'summary': {
                'total_highways': 28,  # 高速公路总数
                'total_mileage': 5680,  # 总里程(公里)
                'monitored_sections': 156,  # 监控路段数
                'active_warnings': random.randint(5, 20),  # 当前预警数
            },
            'traffic_index': {
                'province_avg': round(random.uniform(1.0, 2.0), 2),  # 全省平均拥堵指数
                'trend': random.choice(['up', 'down', 'stable']),
                'compared_yesterday': round(random.uniform(-10, 10), 1),  # 较昨日变化%
            },
            'road_status_distribution': {
                'smooth': random.randint(60, 75),  # 畅通占比%
                'slow': random.randint(15, 25),  # 缓行占比%
                'congested': random.randint(5, 12),  # 拥堵占比%
                'blocked': random.randint(0, 3),  # 严重拥堵占比%
            },
            'flow_stats': {
                'total_today': random.randint(800000, 1200000),  # 今日总流量
                'peak_hour': '08:30',
                'peak_flow': random.randint(50000, 80000),
            },
            'warning_distribution': {
                'blue': random.randint(2, 8),
                'yellow': random.randint(1, 5),
                'orange': random.randint(0, 3),
                'red': random.randint(0, 2),
            }
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class TrafficFlowPredictionView(APIView):
    """
    车流量预测
    GET /api/traffic-warning/flow-prediction/
    """
    def get(self, request):
        # 获取时间范围参数
        hours = int(request.query_params.get('hours', 24))
        road_id = request.query_params.get('road_id', None)
        
        # 生成车流量预测数据
        flow_data = TrafficDataGenerator.generate_traffic_flow(hours)
        
        # 添加预测数据（未来6小时）
        predictions = []
        current_hour = int(timezone.now().strftime('%H'))
        for i in range(1, 7):
            hour = (current_hour + i) % 24
            multiplier = 1.8 if (7 <= hour <= 9 or 17 <= hour <= 19) else (0.3 if 0 <= hour <= 5 else 1.0)
            predictions.append({
                'hour': f'{hour:02d}:00',
                'predicted_flow': int(6000 * multiplier * (0.9 + random.random() * 0.2)),
                'confidence': round(0.85 + random.random() * 0.1, 2),
                'is_prediction': True
            })
        
        data = {
            'historical': flow_data,
            'predictions': predictions,
            'analysis': {
                'avg_flow': sum(f['flow'] for f in flow_data) // len(flow_data),
                'max_flow': max(f['flow'] for f in flow_data),
                'min_flow': min(f['flow'] for f in flow_data),
                'trend': '上升' if random.random() > 0.5 else '下降',
                'peak_hours': ['08:00', '09:00', '17:00', '18:00'],
            }
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class RoadCongestionView(APIView):
    """
    路网拥堵状态
    GET /api/traffic-warning/congestion/
    """
    def get(self, request):
        # 生成路段状态数据
        road_data = TrafficDataGenerator.generate_road_status(30)
        
        # 按拥堵程度分类
        congestion_summary = {
            '畅通': len([r for r in road_data if r['status'] == '畅通']),
            '缓行': len([r for r in road_data if r['status'] == '缓行']),
            '拥堵': len([r for r in road_data if r['status'] == '拥堵']),
            '严重拥堵': len([r for r in road_data if r['status'] == '严重拥堵']),
        }
        
        # 拥堵热点路段（取前5）
        hotspots = sorted([r for r in road_data if r['status'] in ['拥堵', '严重拥堵']], 
                         key=lambda x: x['speed'])[:5]
        
        data = {
            'roads': road_data,
            'summary': congestion_summary,
            'hotspots': hotspots,
            'update_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class WarningRulesView(APIView):
    """
    预警规则配置
    GET /api/traffic-warning/rules/ - 获取规则列表
    POST /api/traffic-warning/rules/ - 创建规则
    PUT /api/traffic-warning/rules/<id>/ - 更新规则
    """
    def get(self, request):
        rules = TrafficDataGenerator.generate_warning_rules()
        return Response({'code': 200, 'message': 'success', 'data': rules})
    
    def post(self, request):
        # 模拟创建规则
        data = request.data
        new_rule = {
            'id': random.randint(100, 999),
            'name': data.get('name', '新规则'),
            'type': data.get('type', 'congestion'),
            'threshold': data.get('threshold', 1.5),
            'level': data.get('level', '黄色预警'),
            'enabled': data.get('enabled', True),
            'description': data.get('description', ''),
            'created_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': '规则创建成功', 'data': new_rule})
    
    def put(self, request, rule_id=None):
        # 模拟更新规则
        data = request.data
        updated_rule = {
            'id': rule_id,
            'name': data.get('name'),
            'type': data.get('type'),
            'threshold': data.get('threshold'),
            'level': data.get('level'),
            'enabled': data.get('enabled'),
            'description': data.get('description'),
            'updated_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': '规则更新成功', 'data': updated_rule})


class WarningListView(APIView):
    """
    预警信息列表
    GET /api/traffic-warning/warnings/
    """
    def get(self, request):
        # 获取筛选参数
        level = request.query_params.get('level', None)
        status_filter = request.query_params.get('status', None)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        warnings = TrafficDataGenerator.generate_warnings(50)
        
        # 应用筛选
        if level:
            warnings = [w for w in warnings if w['level'] == level]
        if status_filter:
            warnings = [w for w in warnings if w['status'] == status_filter]
        
        # 分页
        total = len(warnings)
        start = (page - 1) * page_size
        end = start + page_size
        paginated_warnings = warnings[start:end]
        
        data = {
            'list': paginated_warnings,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': (total + page_size - 1) // page_size
            }
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class TrafficReportView(APIView):
    """
    运行指标查询与报表生成
    GET /api/traffic-warning/report/
    POST /api/traffic-warning/report/generate/
    """
    def get(self, request):
        # 获取报表类型
        report_type = request.query_params.get('type', 'daily')
        
        if report_type == 'daily':
            data = self._generate_daily_report()
        elif report_type == 'weekly':
            data = self._generate_weekly_report()
        elif report_type == 'monthly':
            data = self._generate_monthly_report()
        else:
            data = self._generate_daily_report()
        
        return Response({'code': 200, 'message': 'success', 'data': data})
    
    def post(self, request):
        # 生成自定义报表
        params = request.data
        report = {
            'report_id': f'RPT{timezone.now().strftime("%Y%m%d%H%M%S")}',
            'type': params.get('type', 'custom'),
            'date_range': {
                'start': params.get('start_date'),
                'end': params.get('end_date')
            },
            'generated_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'status': '生成中',
            'download_url': '/api/traffic-warning/report/download/'
        }
        return Response({'code': 200, 'message': '报表生成任务已提交', 'data': report})
    
    def _generate_daily_report(self):
        """生成日报"""
        return {
            'report_type': '日报',
            'date': timezone.now().strftime('%Y-%m-%d'),
            'indicators': {
                'total_flow': random.randint(800000, 1200000),
                'avg_speed': random.randint(60, 85),
                'congestion_index': round(random.uniform(1.0, 1.8), 2),
                'warning_count': random.randint(10, 50),
                'accident_count': random.randint(0, 10),
            },
            'comparison': {
                'flow_change': round(random.uniform(-15, 15), 1),
                'speed_change': round(random.uniform(-10, 10), 1),
                'congestion_change': round(random.uniform(-0.3, 0.3), 2),
            },
            'top_congested_roads': [
                {'road': 'G1高速省会段', 'index': round(random.uniform(2.0, 3.0), 2)},
                {'road': 'S1省道东部段', 'index': round(random.uniform(1.8, 2.5), 2)},
                {'road': 'G2高速北部段', 'index': round(random.uniform(1.5, 2.2), 2)},
            ],
            'hourly_flow': TrafficDataGenerator.generate_traffic_flow(24)
        }
    
    def _generate_weekly_report(self):
        """生成周报"""
        return {
            'report_type': '周报',
            'week': timezone.now().strftime('%Y年第%W周'),
            'indicators': {
                'total_flow': random.randint(5000000, 8000000),
                'avg_speed': random.randint(65, 80),
                'avg_congestion_index': round(random.uniform(1.2, 1.6), 2),
                'total_warnings': random.randint(80, 200),
                'total_accidents': random.randint(20, 60),
            },
            'daily_stats': [
                {'day': f'周{d}', 'flow': random.randint(700000, 1200000), 
                 'index': round(random.uniform(1.0, 2.0), 2)}
                for d in ['一', '二', '三', '四', '五', '六', '日']
            ]
        }
    
    def _generate_monthly_report(self):
        """生成月报"""
        return {
            'report_type': '月报',
            'month': timezone.now().strftime('%Y年%m月'),
            'indicators': {
                'total_flow': random.randint(20000000, 35000000),
                'avg_speed': random.randint(65, 78),
                'avg_congestion_index': round(random.uniform(1.3, 1.5), 2),
                'total_warnings': random.randint(300, 800),
                'total_accidents': random.randint(80, 200),
            },
            'weekly_trend': [
                {'week': f'第{w}周', 'flow': random.randint(5000000, 8000000)}
                for w in range(1, 5)
            ]
        }


class MapDataView(APIView):
    """
    地图数据接口 - 用于一张图展示
    GET /api/traffic-warning/map-data/
    """
    def get(self, request):
        roads = TrafficDataGenerator.generate_road_status(50)
        warnings = TrafficDataGenerator.generate_warnings(20)
        
        data = {
            'roads': roads,
            'warnings': [w for w in warnings if w['status'] == '待处理'],
            'center': {'lng': 120.15, 'lat': 30.25},  # 地图中心点
            'zoom': 8,
            'update_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
