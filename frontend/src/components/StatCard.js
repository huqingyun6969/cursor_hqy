/**
 * 统计卡片组件
 */
import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

const StatCard = ({ 
  title, 
  value, 
  prefix, 
  suffix,
  trend, 
  trendValue,
  icon,
  color = '#1890ff',
  loading = false,
  style = {}
}) => {
  const renderTrend = () => {
    if (trendValue === undefined || trendValue === null) return null;
    
    const isUp = trendValue > 0;
    const trendColor = trend === 'positive' 
      ? (isUp ? '#52c41a' : '#f5222d')
      : (isUp ? '#f5222d' : '#52c41a');
    
    return (
      <div style={{ marginTop: 8 }}>
        <Text style={{ color: trendColor, fontSize: 12 }}>
          {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {' '}{Math.abs(trendValue)}%
          <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
            较昨日
          </Text>
        </Text>
      </div>
    );
  };

  return (
    <Card 
      loading={loading}
      style={{ 
        borderRadius: 4,
        ...style
      }}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ 
              color: color,
              fontSize: 28,
              fontWeight: 600,
              marginTop: 4
            }}
          />
          {renderTrend()}
        </div>
        {icon && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: color
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
