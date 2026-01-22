"""
省级交通应急指挥调度管理子系统 - 数据模型
"""
from django.db import models


class EmergencyResource(models.Model):
    """应急资源"""
    RESOURCE_TYPES = [
        ('rescue_vehicle', '救援车辆'),
        ('fire_truck', '消防车'),
        ('ambulance', '救护车'),
        ('tow_truck', '清障车'),
        ('patrol_car', '巡逻车'),
        ('command_vehicle', '指挥车'),
    ]
    
    STATUS_CHOICES = [
        ('standby', '待命'),
        ('dispatched', '执行中'),
        ('maintenance', '维护中'),
    ]
    
    name = models.CharField('资源名称', max_length=100)
    resource_type = models.CharField('资源类型', max_length=50, choices=RESOURCE_TYPES)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='standby')
    location = models.CharField('所在地', max_length=200)
    longitude = models.FloatField('经度', null=True, blank=True)
    latitude = models.FloatField('纬度', null=True, blank=True)
    team = models.CharField('所属队伍', max_length=100)
    contact = models.CharField('联系电话', max_length=20)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '应急资源'
        verbose_name_plural = verbose_name
    
    def __str__(self):
        return f'{self.name} ({self.get_resource_type_display()})'


class EmergencyPlan(models.Model):
    """应急预案"""
    LEVEL_CHOICES = [
        ('I', 'I级(特别重大)'),
        ('II', 'II级(重大)'),
        ('III', 'III级(较大)'),
        ('IV', 'IV级(一般)'),
    ]
    
    name = models.CharField('预案名称', max_length=200)
    level = models.CharField('预案级别', max_length=10, choices=LEVEL_CHOICES)
    plan_type = models.CharField('预案类型', max_length=50)
    description = models.TextField('预案描述')
    response_time = models.CharField('响应时间', max_length=50)
    content = models.TextField('预案内容', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        verbose_name = '应急预案'
        verbose_name_plural = verbose_name
        ordering = ['level', '-updated_at']
    
    def __str__(self):
        return f'{self.name} ({self.get_level_display()})'


class EmergencyEvent(models.Model):
    """应急事件"""
    LEVEL_CHOICES = [
        ('normal', '一般'),
        ('major', '较大'),
        ('serious', '重大'),
        ('critical', '特大'),
    ]
    
    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('processing', '处理中'),
        ('dispatched', '已调度'),
        ('completed', '已完成'),
        ('reviewed', '已复盘'),
    ]
    
    event_no = models.CharField('事件编号', max_length=50, unique=True)
    event_type = models.CharField('事件类型', max_length=50)
    level = models.CharField('事件级别', max_length=20, choices=LEVEL_CHOICES)
    location = models.CharField('事件位置', max_length=200)
    description = models.TextField('事件描述')
    longitude = models.FloatField('经度', null=True, blank=True)
    latitude = models.FloatField('纬度', null=True, blank=True)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    handler = models.CharField('处理人', max_length=50, blank=True)
    report_time = models.DateTimeField('上报时间', auto_now_add=True)
    dispatch_time = models.DateTimeField('调度时间', null=True, blank=True)
    complete_time = models.DateTimeField('完成时间', null=True, blank=True)
    
    class Meta:
        verbose_name = '应急事件'
        verbose_name_plural = verbose_name
        ordering = ['-report_time']
    
    def __str__(self):
        return f'{self.event_no} - {self.event_type}'


class DutySchedule(models.Model):
    """值班排班"""
    SHIFT_CHOICES = [
        ('morning', '早班(08:00-16:00)'),
        ('afternoon', '中班(16:00-24:00)'),
        ('night', '晚班(00:00-08:00)'),
    ]
    
    date = models.DateField('值班日期')
    shift = models.CharField('班次', max_length=20, choices=SHIFT_CHOICES)
    staff_name = models.CharField('值班人员', max_length=50)
    backup_staff = models.CharField('备班人员', max_length=50, blank=True)
    phone = models.CharField('联系电话', max_length=20)
    notes = models.TextField('备注', blank=True)
    
    class Meta:
        verbose_name = '值班排班'
        verbose_name_plural = verbose_name
        ordering = ['date', 'shift']
        unique_together = ['date', 'shift']
    
    def __str__(self):
        return f'{self.date} {self.get_shift_display()} - {self.staff_name}'
