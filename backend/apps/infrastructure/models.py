"""
省级基础设施监测预警子系统 - 数据模型
"""
from django.db import models


class Infrastructure(models.Model):
    """基础设施档案"""
    TYPE_CHOICES = [
        ('bridge', '桥梁'),
        ('tunnel', '隧道'),
        ('toll_station', '收费站'),
        ('service_area', '服务区'),
        ('monitoring_center', '监控中心'),
    ]
    
    STATUS_CHOICES = [
        ('excellent', '优良'),
        ('good', '良好'),
        ('average', '一般'),
        ('poor', '较差'),
    ]
    
    name = models.CharField('设施名称', max_length=200)
    facility_type = models.CharField('设施类型', max_length=50, choices=TYPE_CHOICES)
    code = models.CharField('设施编码', max_length=50, unique=True)
    location = models.CharField('所在位置', max_length=200)
    longitude = models.FloatField('经度', null=True, blank=True)
    latitude = models.FloatField('纬度', null=True, blank=True)
    build_year = models.IntegerField('建成年份')
    health_score = models.IntegerField('健康评分', default=100)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='good')
    last_inspection = models.DateTimeField('最近检查时间', null=True, blank=True)
    description = models.TextField('描述', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        verbose_name = '基础设施'
        verbose_name_plural = verbose_name
        ordering = ['-health_score']
    
    def __str__(self):
        return f'{self.name} ({self.get_facility_type_display()})'


class MonitoringSensor(models.Model):
    """监测传感器"""
    SENSOR_TYPES = [
        ('temperature', '温度传感器'),
        ('humidity', '湿度传感器'),
        ('vibration', '振动传感器'),
        ('displacement', '位移传感器'),
        ('stress', '应力传感器'),
        ('crack', '裂缝传感器'),
    ]
    
    STATUS_CHOICES = [
        ('online', '在线'),
        ('offline', '离线'),
        ('fault', '故障'),
    ]
    
    infrastructure = models.ForeignKey(Infrastructure, on_delete=models.CASCADE, 
                                       related_name='sensors', verbose_name='所属设施')
    sensor_type = models.CharField('传感器类型', max_length=50, choices=SENSOR_TYPES)
    sensor_code = models.CharField('传感器编码', max_length=50, unique=True)
    location = models.CharField('安装位置', max_length=200)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='online')
    last_data_time = models.DateTimeField('最后数据时间', null=True, blank=True)
    installed_at = models.DateTimeField('安装时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '监测传感器'
        verbose_name_plural = verbose_name
    
    def __str__(self):
        return f'{self.sensor_code} - {self.get_sensor_type_display()}'


class FaultAlert(models.Model):
    """故障报警"""
    FAULT_TYPES = [
        ('sensor_offline', '传感器离线'),
        ('data_abnormal', '数据异常'),
        ('communication_error', '通信中断'),
        ('device_fault', '设备故障'),
        ('power_error', '电源异常'),
    ]
    
    STATUS_CHOICES = [
        ('pending', '未处理'),
        ('processing', '处理中'),
        ('resolved', '已处理'),
    ]
    
    infrastructure = models.ForeignKey(Infrastructure, on_delete=models.CASCADE,
                                       related_name='fault_alerts', verbose_name='相关设施')
    fault_type = models.CharField('故障类型', max_length=50, choices=FAULT_TYPES)
    description = models.TextField('故障描述')
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    handler = models.CharField('处理人', max_length=50, blank=True)
    created_at = models.DateTimeField('报警时间', auto_now_add=True)
    resolved_at = models.DateTimeField('处理时间', null=True, blank=True)
    
    class Meta:
        verbose_name = '故障报警'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.infrastructure.name} - {self.get_fault_type_display()}'
