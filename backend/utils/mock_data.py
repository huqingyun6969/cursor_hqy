"""
省级综合交通运输信息平台 - 模拟数据生成器
用于演示时的数据实时渲染
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any


class MockDataGenerator:
    """模拟数据生成器基类"""
    
    # 省内城市列表
    CITIES = ['省会市', '东部市', '西部市', '南部市', '北部市', '中部市', 
              '临海市', '山区市', '平原市', '工业市', '旅游市', '港口市']
    
    # 高速公路列表
    HIGHWAYS = ['G1高速', 'G2高速', 'G3高速', 'S1省道', 'S2省道', 'S3省道',
                'G15沿海高速', 'G25长深高速', 'G60沪昆高速', 'S26环城高速']
    
    # 服务区列表
    SERVICE_AREAS = ['东阳服务区', '西湖服务区', '南山服务区', '北岭服务区',
                     '青山服务区', '绿水服务区', '阳光服务区', '月亮湾服务区']
    
    @staticmethod
    def random_location() -> Dict[str, float]:
        """生成随机经纬度（以某省为中心）"""
        return {
            'lng': round(119.0 + random.random() * 3, 6),
            'lat': round(29.0 + random.random() * 2, 6)
        }
    
    @staticmethod
    def random_datetime(days_ago: int = 30) -> str:
        """生成随机时间"""
        dt = datetime.now() - timedelta(
            days=random.randint(0, days_ago),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        return dt.strftime('%Y-%m-%d %H:%M:%S')


class TrafficDataGenerator(MockDataGenerator):
    """交通数据生成器"""
    
    @classmethod
    def generate_traffic_flow(cls, count: int = 24) -> List[Dict[str, Any]]:
        """生成车流量数据（按小时）"""
        base_flow = random.randint(5000, 8000)
        data = []
        for hour in range(count):
            # 模拟早晚高峰
            multiplier = 1.0
            if 7 <= hour <= 9 or 17 <= hour <= 19:
                multiplier = 1.8
            elif 0 <= hour <= 5:
                multiplier = 0.3
            
            flow = int(base_flow * multiplier * (0.9 + random.random() * 0.2))
            data.append({
                'hour': f'{hour:02d}:00',
                'flow': flow,
                'speed': random.randint(40, 120),
                'congestion_index': round(random.random() * 2 + (multiplier - 1), 2)
            })
        return data
    
    @classmethod
    def generate_road_status(cls, count: int = 20) -> List[Dict[str, Any]]:
        """生成路段状态数据"""
        statuses = ['畅通', '缓行', '拥堵', '严重拥堵']
        status_colors = ['#52c41a', '#faad14', '#ff7a45', '#f5222d']
        
        data = []
        for i in range(count):
            status_idx = random.choices([0, 1, 2, 3], weights=[50, 30, 15, 5])[0]
            data.append({
                'id': i + 1,
                'road_name': f'{random.choice(cls.HIGHWAYS)}_{random.choice(cls.CITIES)}段',
                'start_point': f'{random.choice(cls.CITIES)}入口',
                'end_point': f'{random.choice(cls.CITIES)}出口',
                'length': round(random.uniform(10, 80), 1),
                'status': statuses[status_idx],
                'status_color': status_colors[status_idx],
                'speed': random.randint(20, 120),
                'flow': random.randint(500, 5000),
                'location': cls.random_location()
            })
        return data
    
    @classmethod
    def generate_warning_rules(cls) -> List[Dict[str, Any]]:
        """生成预警规则配置"""
        return [
            {'id': 1, 'name': '拥堵预警', 'type': 'congestion', 'threshold': 1.5, 
             'level': '黄色预警', 'enabled': True, 'description': '拥堵指数超过1.5时触发'},
            {'id': 2, 'name': '严重拥堵预警', 'type': 'congestion', 'threshold': 2.0, 
             'level': '红色预警', 'enabled': True, 'description': '拥堵指数超过2.0时触发'},
            {'id': 3, 'name': '车流量预警', 'type': 'flow', 'threshold': 8000, 
             'level': '黄色预警', 'enabled': True, 'description': '小时车流量超过8000时触发'},
            {'id': 4, 'name': '低速预警', 'type': 'speed', 'threshold': 30, 
             'level': '橙色预警', 'enabled': True, 'description': '平均车速低于30km/h时触发'},
            {'id': 5, 'name': '事故预警', 'type': 'accident', 'threshold': 1, 
             'level': '红色预警', 'enabled': True, 'description': '发生交通事故时触发'},
        ]
    
    @classmethod
    def generate_warnings(cls, count: int = 10) -> List[Dict[str, Any]]:
        """生成预警信息"""
        warning_types = ['拥堵预警', '事故预警', '气象预警', '施工预警', '流量预警']
        levels = ['蓝色', '黄色', '橙色', '红色']
        level_colors = ['#1890ff', '#faad14', '#ff7a45', '#f5222d']
        
        data = []
        for i in range(count):
            level_idx = random.choices([0, 1, 2, 3], weights=[20, 40, 30, 10])[0]
            data.append({
                'id': i + 1,
                'type': random.choice(warning_types),
                'level': levels[level_idx],
                'level_color': level_colors[level_idx],
                'location': f'{random.choice(cls.HIGHWAYS)} {random.choice(cls.CITIES)}段',
                'description': f'检测到异常情况，请注意关注',
                'time': cls.random_datetime(7),
                'status': random.choice(['处理中', '已处理', '待处理']),
                'coordinates': cls.random_location()
            })
        return sorted(data, key=lambda x: x['time'], reverse=True)


class EmergencyDataGenerator(MockDataGenerator):
    """应急数据生成器"""
    
    # 应急资源类型
    RESOURCE_TYPES = ['救援车辆', '消防车', '救护车', '清障车', '巡逻车', '指挥车']
    
    @classmethod
    def generate_emergency_resources(cls, count: int = 30) -> List[Dict[str, Any]]:
        """生成应急资源数据"""
        data = []
        for i in range(count):
            resource_type = random.choice(cls.RESOURCE_TYPES)
            data.append({
                'id': i + 1,
                'name': f'{resource_type}{i+1:03d}',
                'type': resource_type,
                'status': random.choice(['待命', '执行中', '维护中']),
                'location': random.choice(cls.CITIES),
                'coordinates': cls.random_location(),
                'team': f'第{random.randint(1, 5)}应急小队',
                'contact': f'1{random.randint(30, 99)}{random.randint(1000, 9999)}{random.randint(1000, 9999)}'
            })
        return data
    
    @classmethod
    def generate_emergency_plans(cls) -> List[Dict[str, Any]]:
        """生成应急预案列表"""
        plans = [
            {'id': 1, 'name': '重大交通事故应急预案', 'level': 'I级', 'type': '事故类',
             'description': '适用于造成30人以上死亡或100人以上重伤的特别重大道路交通事故',
             'response_time': '15分钟', 'update_time': '2024-01-15'},
            {'id': 2, 'name': '恶劣天气交通保障预案', 'level': 'II级', 'type': '气象类',
             'description': '适用于暴雨、暴雪、大雾等恶劣天气的交通保障',
             'response_time': '30分钟', 'update_time': '2024-02-20'},
            {'id': 3, 'name': '危险品运输事故预案', 'level': 'I级', 'type': '危化品类',
             'description': '适用于危险化学品运输车辆发生泄漏、爆炸等事故',
             'response_time': '10分钟', 'update_time': '2024-03-10'},
            {'id': 4, 'name': '大型活动交通保障预案', 'level': 'III级', 'type': '保障类',
             'description': '适用于大型体育赛事、演唱会等活动的交通保障',
             'response_time': '60分钟', 'update_time': '2024-01-25'},
            {'id': 5, 'name': '桥梁隧道应急处置预案', 'level': 'II级', 'type': '设施类',
             'description': '适用于桥梁、隧道发生结构损坏或安全事故',
             'response_time': '20分钟', 'update_time': '2024-04-05'},
        ]
        return plans
    
    @classmethod
    def generate_events(cls, count: int = 15) -> List[Dict[str, Any]]:
        """生成事件列表"""
        event_types = ['交通事故', '车辆故障', '道路施工', '气象灾害', '危化品泄漏']
        statuses = ['待处理', '处理中', '已调度', '已完成', '已复盘']
        
        data = []
        for i in range(count):
            status = random.choice(statuses)
            data.append({
                'id': i + 1,
                'event_no': f'EV{datetime.now().strftime("%Y%m%d")}{i+1:04d}',
                'type': random.choice(event_types),
                'level': random.choice(['一般', '较大', '重大', '特大']),
                'location': f'{random.choice(cls.HIGHWAYS)} K{random.randint(10, 300)}+{random.randint(0, 999):03d}',
                'description': f'发生{random.choice(event_types)}，需要紧急处理',
                'report_time': cls.random_datetime(7),
                'status': status,
                'handler': f'调度员{random.randint(1, 20):02d}',
                'coordinates': cls.random_location()
            })
        return sorted(data, key=lambda x: x['report_time'], reverse=True)
    
    @classmethod
    def generate_duty_schedule(cls, days: int = 7) -> List[Dict[str, Any]]:
        """生成值班排班表"""
        staff_names = ['张明', '李华', '王强', '赵敏', '刘洋', '陈静', '周杰', '吴磊']
        shifts = ['早班(08:00-16:00)', '中班(16:00-24:00)', '晚班(00:00-08:00)']
        
        data = []
        for day_offset in range(days):
            date = (datetime.now() + timedelta(days=day_offset)).strftime('%Y-%m-%d')
            weekday = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][
                (datetime.now() + timedelta(days=day_offset)).weekday()]
            
            for shift in shifts:
                data.append({
                    'id': len(data) + 1,
                    'date': date,
                    'weekday': weekday,
                    'shift': shift,
                    'staff': random.choice(staff_names),
                    'backup': random.choice(staff_names),
                    'phone': f'1{random.randint(30, 99)}{random.randint(10000000, 99999999)}'
                })
        return data


class InfrastructureDataGenerator(MockDataGenerator):
    """基础设施数据生成器"""
    
    # 设施类型
    FACILITY_TYPES = ['桥梁', '隧道', '收费站', '服务区', '监控中心']
    
    @classmethod
    def generate_facilities(cls, count: int = 25) -> List[Dict[str, Any]]:
        """生成基础设施列表"""
        data = []
        for i in range(count):
            facility_type = random.choice(cls.FACILITY_TYPES)
            health_score = random.randint(60, 100)
            
            if health_score >= 90:
                status = '优良'
                status_color = '#52c41a'
            elif health_score >= 75:
                status = '良好'
                status_color = '#1890ff'
            elif health_score >= 60:
                status = '一般'
                status_color = '#faad14'
            else:
                status = '较差'
                status_color = '#f5222d'
            
            data.append({
                'id': i + 1,
                'name': f'{random.choice(cls.CITIES)}{facility_type}{i+1:02d}',
                'type': facility_type,
                'code': f'{facility_type[0]}{datetime.now().year}{i+1:04d}',
                'location': f'{random.choice(cls.HIGHWAYS)} K{random.randint(10, 300)}',
                'build_year': random.randint(1995, 2023),
                'health_score': health_score,
                'status': status,
                'status_color': status_color,
                'last_inspection': cls.random_datetime(30),
                'coordinates': cls.random_location()
            })
        return data
    
    @classmethod
    def generate_monitoring_data(cls, facility_id: int = 1) -> Dict[str, Any]:
        """生成设施监测数据"""
        return {
            'facility_id': facility_id,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'sensors': {
                'temperature': round(random.uniform(15, 35), 1),
                'humidity': round(random.uniform(40, 80), 1),
                'vibration': round(random.uniform(0, 5), 2),
                'displacement': round(random.uniform(0, 2), 3),
                'stress': round(random.uniform(0, 100), 1),
                'crack_width': round(random.uniform(0, 0.5), 2)
            },
            'alerts': random.choices([[], ['振动异常'], ['位移超限'], ['裂缝扩大']], 
                                    weights=[80, 10, 7, 3])[0]
        }
    
    @classmethod
    def generate_dashboard_stats(cls) -> Dict[str, Any]:
        """生成驾驶舱统计数据"""
        return {
            'total_facilities': 156,
            'bridges': 45,
            'tunnels': 28,
            'toll_stations': 38,
            'service_areas': 25,
            'monitoring_centers': 20,
            'health_excellent': 98,
            'health_good': 35,
            'health_average': 18,
            'health_poor': 5,
            'alerts_today': random.randint(0, 10),
            'inspections_month': random.randint(50, 100),
            'online_sensors': random.randint(1200, 1500),
            'offline_sensors': random.randint(5, 30)
        }
    
    @classmethod
    def generate_fault_alerts(cls, count: int = 10) -> List[Dict[str, Any]]:
        """生成故障报警列表"""
        fault_types = ['传感器离线', '数据异常', '通信中断', '设备故障', '电源异常']
        
        data = []
        for i in range(count):
            data.append({
                'id': i + 1,
                'facility': f'{random.choice(cls.CITIES)}{random.choice(cls.FACILITY_TYPES)}{random.randint(1, 20):02d}',
                'fault_type': random.choice(fault_types),
                'description': '系统检测到异常，请及时处理',
                'time': cls.random_datetime(3),
                'status': random.choice(['未处理', '处理中', '已处理']),
                'handler': f'运维员{random.randint(1, 10):02d}' if random.random() > 0.3 else None
            })
        return sorted(data, key=lambda x: x['time'], reverse=True)


class TravelServiceDataGenerator(MockDataGenerator):
    """出行服务数据生成器"""
    
    @classmethod
    def generate_map_data(cls) -> Dict[str, Any]:
        """生成地图数据"""
        return {
            'roads': cls.generate_road_conditions(30),
            'weather': cls.generate_weather_stations(15),
            'services': cls.generate_service_facilities(20),
            'pois': cls.generate_pois(25)
        }
    
    @classmethod
    def generate_road_conditions(cls, count: int = 30) -> List[Dict[str, Any]]:
        """生成路况数据"""
        conditions = ['畅通', '缓行', '拥堵', '管制']
        condition_colors = ['#52c41a', '#faad14', '#ff7a45', '#f5222d']
        
        data = []
        for i in range(count):
            cond_idx = random.choices([0, 1, 2, 3], weights=[50, 30, 15, 5])[0]
            data.append({
                'id': i + 1,
                'road': random.choice(cls.HIGHWAYS),
                'section': f'{random.choice(cls.CITIES)}-{random.choice(cls.CITIES)}',
                'condition': conditions[cond_idx],
                'color': condition_colors[cond_idx],
                'speed': random.randint(20, 120),
                'coordinates': [cls.random_location() for _ in range(2)]
            })
        return data
    
    @classmethod
    def generate_weather_stations(cls, count: int = 15) -> List[Dict[str, Any]]:
        """生成气象站数据"""
        weathers = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雾']
        weather_icons = ['☀️', '⛅', '☁️', '🌧️', '🌧️', '⛈️', '🌫️']
        
        data = []
        for i in range(count):
            weather_idx = random.choices(range(7), weights=[30, 25, 15, 10, 8, 5, 7])[0]
            data.append({
                'id': i + 1,
                'station': f'{random.choice(cls.CITIES)}气象站',
                'weather': weathers[weather_idx],
                'weather_icon': weather_icons[weather_idx],
                'temperature': random.randint(5, 35),
                'humidity': random.randint(40, 90),
                'wind_speed': random.randint(1, 30),
                'visibility': random.randint(1, 20),
                'coordinates': cls.random_location()
            })
        return data
    
    @classmethod
    def generate_service_facilities(cls, count: int = 20) -> List[Dict[str, Any]]:
        """生成服务设施数据"""
        data = []
        for i, area in enumerate(cls.SERVICE_AREAS[:count]):
            data.append({
                'id': i + 1,
                'name': area,
                'highway': random.choice(cls.HIGHWAYS),
                'direction': random.choice(['上行', '下行']),
                'services': random.sample(['加油站', '餐饮', '超市', '卫生间', '休息区', '充电桩', '修车服务'], 
                                         k=random.randint(4, 7)),
                'parking_total': random.randint(100, 300),
                'parking_available': random.randint(20, 150),
                'rating': round(random.uniform(3.5, 5.0), 1),
                'coordinates': cls.random_location()
            })
        return data
    
    @classmethod
    def generate_pois(cls, count: int = 25) -> List[Dict[str, Any]]:
        """生成兴趣点数据"""
        poi_types = ['景点', '酒店', '美食', '加油站', '停车场']
        poi_icons = ['🏞️', '🏨', '🍽️', '⛽', '🅿️']
        
        data = []
        for i in range(count):
            type_idx = random.randint(0, len(poi_types) - 1)
            data.append({
                'id': i + 1,
                'name': f'{random.choice(cls.CITIES)}{poi_types[type_idx]}{i+1}',
                'type': poi_types[type_idx],
                'icon': poi_icons[type_idx],
                'rating': round(random.uniform(3.0, 5.0), 1),
                'distance': round(random.uniform(0.5, 50), 1),
                'coordinates': cls.random_location()
            })
        return data
    
    @classmethod
    def generate_reservations(cls, count: int = 20) -> List[Dict[str, Any]]:
        """生成预约记录"""
        reservation_types = ['服务区预约', '绿通预约']
        statuses = ['待确认', '已确认', '已完成', '已取消']
        
        data = []
        for i in range(count):
            res_type = random.choice(reservation_types)
            data.append({
                'id': i + 1,
                'reservation_no': f'RES{datetime.now().strftime("%Y%m%d")}{i+1:04d}',
                'type': res_type,
                'user_name': f'用户{random.randint(1000, 9999)}',
                'phone': f'1{random.randint(30, 99)}{random.randint(10000000, 99999999)}',
                'service_area': random.choice(cls.SERVICE_AREAS) if res_type == '服务区预约' else None,
                'vehicle_no': f'浙{chr(65+random.randint(0, 25))}{random.randint(10000, 99999)}',
                'appointment_time': cls.random_datetime(-7),  # 未来7天
                'status': random.choice(statuses),
                'create_time': cls.random_datetime(14)
            })
        return sorted(data, key=lambda x: x['create_time'], reverse=True)
    
    @classmethod
    def generate_rescue_requests(cls, count: int = 10) -> List[Dict[str, Any]]:
        """生成救援请求"""
        rescue_types = ['车辆故障', '轮胎漏气', '燃油耗尽', '事故救援', '电瓶没电']
        statuses = ['待接单', '已派单', '救援中', '已完成']
        
        data = []
        for i in range(count):
            data.append({
                'id': i + 1,
                'request_no': f'SOS{datetime.now().strftime("%Y%m%d")}{i+1:04d}',
                'type': random.choice(rescue_types),
                'location': f'{random.choice(cls.HIGHWAYS)} K{random.randint(10, 300)}+{random.randint(0, 999):03d}',
                'user_name': f'用户{random.randint(1000, 9999)}',
                'phone': f'1{random.randint(30, 99)}{random.randint(10000000, 99999999)}',
                'vehicle_no': f'浙{chr(65+random.randint(0, 25))}{random.randint(10000, 99999)}',
                'description': '车辆出现问题，需要救援',
                'status': random.choice(statuses),
                'create_time': cls.random_datetime(3),
                'coordinates': cls.random_location()
            })
        return sorted(data, key=lambda x: x['create_time'], reverse=True)
    
    @classmethod
    def generate_travel_recommendations(cls, count: int = 10) -> List[Dict[str, Any]]:
        """生成交旅融合推荐"""
        themes = ['山水风光', '历史文化', '美食之旅', '温泉度假', '古镇探访', '海岛风情']
        
        data = []
        for i in range(count):
            data.append({
                'id': i + 1,
                'title': f'{random.choice(cls.CITIES)}{random.choice(themes)}游',
                'theme': random.choice(themes),
                'description': '精选线路，带您领略沿途美景',
                'duration': f'{random.randint(1, 5)}天{random.randint(0, 2)}晚',
                'distance': f'{random.randint(100, 500)}公里',
                'highlights': random.sample(['国家5A景区', '非遗体验', '特色美食', '精品民宿', 
                                            '自然风光', '文化古迹'], k=3),
                'rating': round(random.uniform(4.0, 5.0), 1),
                'price': random.randint(500, 3000),
                'image': f'/images/travel_{i+1}.jpg'
            })
        return data
