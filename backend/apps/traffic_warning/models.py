"""
省级交通运行预警预测子系统 - 数据模型
"""
from django.db import models


class TrafficWarningRule(models.Model):
    """预警规则配置"""
    LEVEL_CHOICES = [
        ('blue', '蓝色预警'),
        ('yellow', '黄色预警'),
        ('orange', '橙色预警'),
        ('red', '红色预警'),
    ]
    
    TYPE_CHOICES = [
        ('congestion', '拥堵预警'),
        ('flow', '流量预警'),
        ('speed', '速度预警'),
        ('accident', '事故预警'),
        ('weather', '气象预警'),
    ]
    
    name = models.CharField('规则名称', max_length=100)
    rule_type = models.CharField('规则类型', max_length=20, choices=TYPE_CHOICES)
    level = models.CharField('预警级别', max_length=20, choices=LEVEL_CHOICES)
    threshold = models.FloatField('阈值')
    description = models.TextField('规则描述', blank=True)
    enabled = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        verbose_name = '预警规则'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class TrafficWarning(models.Model):
    """预警信息"""
    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('processing', '处理中'),
        ('resolved', '已处理'),
    ]
    
    warning_type = models.CharField('预警类型', max_length=50)
    level = models.CharField('预警级别', max_length=20)
    location = models.CharField('预警位置', max_length=200)
    description = models.TextField('预警描述')
    longitude = models.FloatField('经度', null=True, blank=True)
    latitude = models.FloatField('纬度', null=True, blank=True)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    resolved_at = models.DateTimeField('处理时间', null=True, blank=True)
    
    class Meta:
        verbose_name = '预警信息'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.warning_type} - {self.location}'
