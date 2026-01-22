/**
 * 页面标题组件
 */
import React from 'react';
import { Typography, Space, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumb = [],
  extra,
  style = {} 
}) => {
  return (
    <div 
      className="page-header" 
      style={{ 
        background: '#fff',
        padding: '16px 24px',
        marginBottom: 16,
        borderRadius: 4,
        ...style
      }}
    >
      {breadcrumb.length > 0 && (
        <Breadcrumb style={{ marginBottom: 8 }}>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          {breadcrumb.map((item, index) => (
            <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#001529' }}>{title}</Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 14, marginTop: 4, display: 'block' }}>
              {subtitle}
            </Text>
          )}
        </div>
        {extra && <Space>{extra}</Space>}
      </div>
    </div>
  );
};

export default PageHeader;
