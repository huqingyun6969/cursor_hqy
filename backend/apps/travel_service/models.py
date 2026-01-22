"""
省级一张网出行服务子系统 - 数据模型
"""
from django.db import models


class ServiceArea(models.Model):
    """服务区"""
    name = models.CharField('名称', max_length=100)
    highway = models.CharField('所属高速', max_length=100)
    direction = models.CharField('方向', max_length=20)
    longitude = models.FloatField('经度')
    latitude = models.FloatField('纬度')
    parking_total = models.IntegerField('停车位总数')
    parking_available = models.IntegerField('可用停车位')
    services = models.JSONField('服务设施', default=list)
    rating = models.FloatField('评分', default=4.0)
    open_time = models.CharField('营业时间', max_length=50, default='24小时')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '服务区'
        verbose_name_plural = verbose_name
    
    def __str__(self):
        return self.name


class Reservation(models.Model):
    """预约记录"""
    TYPE_CHOICES = [
        ('service_area', '服务区预约'),
        ('green_pass', '绿通预约'),
    ]
    
    STATUS_CHOICES = [
        ('pending', '待确认'),
        ('confirmed', '已确认'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
    ]
    
    reservation_no = models.CharField('预约编号', max_length=50, unique=True)
    reservation_type = models.CharField('预约类型', max_length=20, choices=TYPE_CHOICES)
    user_name = models.CharField('用户姓名', max_length=50)
    phone = models.CharField('联系电话', max_length=20)
    vehicle_no = models.CharField('车牌号', max_length=20)
    service_area = models.ForeignKey(ServiceArea, on_delete=models.SET_NULL, 
                                     null=True, blank=True, verbose_name='服务区')
    appointment_time = models.DateTimeField('预约时间')
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField('备注', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '预约记录'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.reservation_no} - {self.user_name}'


class RescueRequest(models.Model):
    """救援请求"""
    TYPE_CHOICES = [
        ('breakdown', '车辆故障'),
        ('flat_tire', '轮胎漏气'),
        ('fuel_empty', '燃油耗尽'),
        ('accident', '事故救援'),
        ('battery', '电瓶没电'),
    ]
    
    STATUS_CHOICES = [
        ('pending', '待接单'),
        ('assigned', '已派单'),
        ('rescuing', '救援中'),
        ('completed', '已完成'),
    ]
    
    request_no = models.CharField('请求编号', max_length=50, unique=True)
    rescue_type = models.CharField('救援类型', max_length=20, choices=TYPE_CHOICES)
    location = models.CharField('位置', max_length=200)
    longitude = models.FloatField('经度')
    latitude = models.FloatField('纬度')
    user_name = models.CharField('用户姓名', max_length=50)
    phone = models.CharField('联系电话', max_length=20)
    vehicle_no = models.CharField('车牌号', max_length=20)
    description = models.TextField('问题描述')
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    rescuer = models.CharField('救援人员', max_length=50, blank=True)
    rescuer_phone = models.CharField('救援人员电话', max_length=20, blank=True)
    eta = models.IntegerField('预计到达时间(分钟)', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    completed_at = models.DateTimeField('完成时间', null=True, blank=True)
    
    class Meta:
        verbose_name = '救援请求'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.request_no} - {self.get_rescue_type_display()}'


class TravelRoute(models.Model):
    """交旅融合路线"""
    title = models.CharField('路线标题', max_length=200)
    theme = models.CharField('主题', max_length=50)
    description = models.TextField('描述')
    duration = models.CharField('时长', max_length=50)
    distance = models.CharField('里程', max_length=50)
    highlights = models.JSONField('亮点', default=list)
    rating = models.FloatField('评分', default=4.5)
    price = models.IntegerField('参考价格')
    image = models.CharField('封面图', max_length=200, blank=True)
    is_recommended = models.BooleanField('是否推荐', default=False)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '交旅路线'
        verbose_name_plural = verbose_name
        ordering = ['-is_recommended', '-rating']
    
    def __str__(self):
        return self.title
