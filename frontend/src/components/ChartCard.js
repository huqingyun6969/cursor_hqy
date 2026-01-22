/**
 * 图表卡片组件
 */
import React from 'react';
import { Card, Typography, Space, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ChartCard = ({ 
  title, 
  subtitle,
  extra,
  loading = false,
  children,
  onRefresh,
  height = 300,
  style = {},
  bodyStyle = {}
}) => {
  return (
    <Card 
      style={{ 
        borderRadius: 4,
        ...style
      }}
      bodyStyle={{
        padding: 16,
        ...bodyStyle
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 12 }}>{subtitle}</Text>
          )}
        </div>
        <Space>
          {extra}
          {onRefresh && (
            <ReloadOutlined 
              style={{ cursor: 'pointer', color: '#8c8c8c' }} 
              onClick={onRefresh}
              spin={loading}
            />
          )}
        </Space>
      </div>
      
      <Spin spinning={loading}>
        <div style={{ height, minHeight: height }}>
          {children}
        </div>
      </Spin>
    </Card>
  );
};

export default ChartCard;
