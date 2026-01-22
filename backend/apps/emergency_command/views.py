"""
省级交通应急指挥调度管理子系统 - 视图层
支持应急力量可视化、应急预案调取、事件全流程管理、值班排班管理
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import random

from utils.mock_data import EmergencyDataGenerator


class EmergencyOverviewView(APIView):
    """
    应急指挥概览
    GET /api/emergency/overview/
    """
    def get(self, request):
        data = {
            'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'resource_summary': {
                'total': 156,
                'standby': random.randint(100, 130),
                'dispatched': random.randint(15, 40),
                'maintenance': random.randint(5, 15),
            },
            'resource_by_type': {
                'rescue_vehicle': random.randint(30, 40),
                'fire_truck': random.randint(20, 30),
                'ambulance': random.randint(25, 35),
                'tow_truck': random.randint(30, 40),
                'patrol_car': random.randint(20, 30),
                'command_vehicle': random.randint(5, 10),
            },
            'event_stats': {
                'today_total': random.randint(5, 20),
                'pending': random.randint(1, 5),
                'processing': random.randint(2, 8),
                'completed': random.randint(5, 15),
            },
            'response_time_avg': f'{random.randint(10, 20)}分钟',
            'duty_today': {
                'morning': '张明',
                'afternoon': '李华',
                'night': '王强',
            }
        }
        return Response({'code': 200, 'message': 'success', 'data': data})


class EmergencyResourceView(APIView):
    """
    应急力量资源管理
    GET /api/emergency/resources/ - 获取资源列表
    GET /api/emergency/resources/map/ - 获取资源地图数据
    """
    def get(self, request):
        view_type = request.query_params.get('view', 'list')
        resource_type = request.query_params.get('type', None)
        status_filter = request.query_params.get('status', None)
        
        resources = EmergencyDataGenerator.generate_emergency_resources(50)
        
        # 应用筛选
        if resource_type:
            resources = [r for r in resources if r['type'] == resource_type]
        if status_filter:
            resources = [r for r in resources if r['status'] == status_filter]
        
        if view_type == 'map':
            # 返回地图数据格式
            data = {
                'resources': resources,
                'center': {'lng': 120.15, 'lat': 30.25},
                'clusters': [
                    {'location': city, 'count': random.randint(3, 10), 
                     'coordinates': EmergencyDataGenerator.random_location()}
                    for city in EmergencyDataGenerator.CITIES[:8]
                ]
            }
        else:
            # 按类型分组统计
            type_stats = {}
            for r in resources:
                t = r['type']
                if t not in type_stats:
                    type_stats[t] = {'total': 0, 'standby': 0, 'dispatched': 0}
                type_stats[t]['total'] += 1
                if r['status'] == '待命':
                    type_stats[t]['standby'] += 1
                elif r['status'] == '执行中':
                    type_stats[t]['dispatched'] += 1
            
            data = {
                'list': resources,
                'stats': type_stats,
                'total': len(resources)
            }
        
        return Response({'code': 200, 'message': 'success', 'data': data})


class EmergencyPlanView(APIView):
    """
    应急预案管理
    GET /api/emergency/plans/ - 获取预案列表
    GET /api/emergency/plans/<id>/ - 获取预案详情
    POST /api/emergency/plans/invoke/ - 调取预案
    """
    def get(self, request, plan_id=None):
        plans = EmergencyDataGenerator.generate_emergency_plans()
        
        if plan_id:
            # 返回单个预案详情
            plan = next((p for p in plans if p['id'] == plan_id), None)
            if plan:
                # 添加详细内容
                plan['content'] = {
                    'scope': '本预案适用于全省范围内的相关应急事件处置',
                    'organization': [
                        {'role': '指挥长', 'responsibility': '总体指挥协调'},
                        {'role': '副指挥长', 'responsibility': '协助指挥，分管具体事务'},
                        {'role': '现场指挥', 'responsibility': '现场处置指挥'},
                        {'role': '信息组', 'responsibility': '信息收集与发布'},
                        {'role': '救援组', 'responsibility': '现场救援处置'},
                    ],
                    'procedures': [
                        {'step': 1, 'name': '事件报告', 'content': '接报后立即核实事件信息'},
                        {'step': 2, 'name': '启动响应', 'content': '根据事件级别启动相应预案'},
                        {'step': 3, 'name': '力量调度', 'content': '调配应急资源赶赴现场'},
                        {'step': 4, 'name': '现场处置', 'content': '组织实施现场救援'},
                        {'step': 5, 'name': '信息发布', 'content': '及时发布事件处置信息'},
                        {'step': 6, 'name': '善后处理', 'content': '做好善后恢复工作'},
                    ],
                    'resources_required': [
                        '救援车辆不少于5辆',
                        '救护车不少于2辆',
                        '消防车不少于2辆',
                        '专业救援人员不少于20人',
                    ]
                }
                return Response({'code': 200, 'message': 'success', 'data': plan})
            return Response({'code': 404, 'message': '预案不存在'}, status=404)
        
        # 按类型分组
        plan_types = list(set(p['type'] for p in plans))
        
        data = {
            'list': plans,
            'types': plan_types,
            'total': len(plans)
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
    
    def post(self, request):
        # 调取预案
        plan_id = request.data.get('plan_id')
        event_id = request.data.get('event_id')
        
        invoke_record = {
            'invoke_id': f'INV{timezone.now().strftime("%Y%m%d%H%M%S")}',
            'plan_id': plan_id,
            'event_id': event_id,
            'invoke_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'invoker': '调度员01',
            'status': '已启动'
        }
        return Response({'code': 200, 'message': '预案调取成功', 'data': invoke_record})


class EmergencyEventView(APIView):
    """
    应急事件管理 - 事件上报/分级叫应/调度/复盘全流程
    GET /api/emergency/events/ - 获取事件列表
    POST /api/emergency/events/ - 上报事件
    PUT /api/emergency/events/<id>/dispatch/ - 调度
    PUT /api/emergency/events/<id>/complete/ - 完成
    PUT /api/emergency/events/<id>/review/ - 复盘
    """
    def get(self, request, event_id=None, action=None):
        events = EmergencyDataGenerator.generate_events(30)
        
        if event_id:
            event = next((e for e in events if e['id'] == event_id), None)
            if event:
                # 添加事件详情
                event['timeline'] = [
                    {'time': event['report_time'], 'action': '事件上报', 'operator': '系统'},
                    {'time': EmergencyDataGenerator.random_datetime(0), 'action': '事件确认', 'operator': event['handler']},
                    {'time': EmergencyDataGenerator.random_datetime(0), 'action': '启动响应', 'operator': event['handler']},
                ]
                if event['status'] in ['已调度', '已完成', '已复盘']:
                    event['timeline'].append({
                        'time': EmergencyDataGenerator.random_datetime(0),
                        'action': '资源调度',
                        'operator': event['handler']
                    })
                if event['status'] in ['已完成', '已复盘']:
                    event['timeline'].append({
                        'time': EmergencyDataGenerator.random_datetime(0),
                        'action': '处置完成',
                        'operator': event['handler']
                    })
                event['dispatched_resources'] = EmergencyDataGenerator.generate_emergency_resources(5)
                return Response({'code': 200, 'message': 'success', 'data': event})
            return Response({'code': 404, 'message': '事件不存在'}, status=404)
        
        # 筛选参数
        status_filter = request.query_params.get('status', None)
        level = request.query_params.get('level', None)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        if status_filter:
            events = [e for e in events if e['status'] == status_filter]
        if level:
            events = [e for e in events if e['level'] == level]
        
        total = len(events)
        start = (page - 1) * page_size
        paginated = events[start:start + page_size]
        
        data = {
            'list': paginated,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': (total + page_size - 1) // page_size
            },
            'status_stats': {
                'pending': len([e for e in events if e['status'] == '待处理']),
                'processing': len([e for e in events if e['status'] == '处理中']),
                'dispatched': len([e for e in events if e['status'] == '已调度']),
                'completed': len([e for e in events if e['status'] == '已完成']),
                'reviewed': len([e for e in events if e['status'] == '已复盘']),
            }
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
    
    def post(self, request):
        # 上报新事件
        data = request.data
        new_event = {
            'id': random.randint(100, 999),
            'event_no': f'EV{timezone.now().strftime("%Y%m%d%H%M%S")}',
            'type': data.get('type', '交通事故'),
            'level': data.get('level', '一般'),
            'location': data.get('location', ''),
            'description': data.get('description', ''),
            'status': '待处理',
            'report_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'handler': None
        }
        return Response({'code': 200, 'message': '事件上报成功', 'data': new_event})
    
    def put(self, request, event_id=None, action=None):
        if action == 'dispatch':
            # 调度资源
            resources = request.data.get('resources', [])
            result = {
                'event_id': event_id,
                'status': '已调度',
                'dispatch_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                'dispatched_resources': resources,
                'message': f'已调度{len(resources)}个资源'
            }
            return Response({'code': 200, 'message': '调度成功', 'data': result})
        
        elif action == 'complete':
            # 完成处置
            result = {
                'event_id': event_id,
                'status': '已完成',
                'complete_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                'summary': request.data.get('summary', '')
            }
            return Response({'code': 200, 'message': '处置完成', 'data': result})
        
        elif action == 'review':
            # 复盘
            review_data = {
                'event_id': event_id,
                'status': '已复盘',
                'review_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
                'review_content': {
                    'response_time': request.data.get('response_time', '15分钟'),
                    'handling_efficiency': request.data.get('efficiency', '良好'),
                    'issues': request.data.get('issues', []),
                    'improvements': request.data.get('improvements', []),
                    'score': request.data.get('score', 85)
                }
            }
            return Response({'code': 200, 'message': '复盘完成', 'data': review_data})
        
        return Response({'code': 400, 'message': '无效操作'}, status=400)


class DutyScheduleView(APIView):
    """
    值班排班管理
    GET /api/emergency/duty/ - 获取排班表
    POST /api/emergency/duty/ - 创建排班
    PUT /api/emergency/duty/<id>/ - 更新排班
    """
    def get(self, request):
        days = int(request.query_params.get('days', 7))
        schedule = EmergencyDataGenerator.generate_duty_schedule(days)
        
        # 按日期分组
        grouped = {}
        for item in schedule:
            date = item['date']
            if date not in grouped:
                grouped[date] = {'date': date, 'weekday': item['weekday'], 'shifts': []}
            grouped[date]['shifts'].append({
                'id': item['id'],
                'shift': item['shift'],
                'staff': item['staff'],
                'backup': item['backup'],
                'phone': item['phone']
            })
        
        data = {
            'schedule': list(grouped.values()),
            'total_days': days,
            'staff_list': ['张明', '李华', '王强', '赵敏', '刘洋', '陈静', '周杰', '吴磊']
        }
        return Response({'code': 200, 'message': 'success', 'data': data})
    
    def post(self, request):
        # 创建排班
        data = request.data
        new_schedule = {
            'id': random.randint(100, 999),
            'date': data.get('date'),
            'shift': data.get('shift'),
            'staff': data.get('staff'),
            'backup': data.get('backup', ''),
            'phone': data.get('phone', ''),
            'created_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': '排班创建成功', 'data': new_schedule})
    
    def put(self, request, schedule_id=None):
        # 更新排班
        data = request.data
        updated = {
            'id': schedule_id,
            'date': data.get('date'),
            'shift': data.get('shift'),
            'staff': data.get('staff'),
            'backup': data.get('backup'),
            'phone': data.get('phone'),
            'updated_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        return Response({'code': 200, 'message': '排班更新成功', 'data': updated})


class EventDispatchView(APIView):
    """
    分级叫应接口
    POST /api/emergency/dispatch/call/ - 发起叫应
    """
    def post(self, request):
        event_id = request.data.get('event_id')
        level = request.data.get('level', 'III')
        
        # 根据级别确定叫应范围
        call_scope = {
            'IV': {'range': '县级', 'units': ['县交通局', '县应急办']},
            'III': {'range': '市级', 'units': ['市交通局', '市应急办', '市消防支队']},
            'II': {'range': '省级', 'units': ['省交通厅', '省应急厅', '省消防总队', '省公安厅']},
            'I': {'range': '省级+报部', 'units': ['省交通厅', '省应急厅', '省政府应急办', '交通运输部']}
        }
        
        scope = call_scope.get(level, call_scope['III'])
        
        result = {
            'event_id': event_id,
            'call_level': level,
            'call_time': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'scope': scope['range'],
            'notified_units': scope['units'],
            'status': '已发送',
            'responses': []
        }
        return Response({'code': 200, 'message': '叫应已发送', 'data': result})
