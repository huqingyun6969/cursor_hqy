/**
 * 地图占位组件
 * 在实际项目中可替换为高德地图、百度地图等
 */
import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { EnvironmentOutlined, AimOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const MapPlaceholder = ({ 
  title = '地图区域',
  center = { lng: 120.15, lat: 30.25 },
  markers = [],
  height = 500,
  showLegend = true,
  legendItems = [],
  style = {}
}) => {
  // 模拟地图标记点
  const renderMarkers = () => {
    if (markers.length === 0) {
      // 生成一些模拟标记
      const mockMarkers = [
        { id: 1, name: '省会市', status: '畅通', x: 45, y: 35 },
        { id: 2, name: '东部市', status: '缓行', x: 70, y: 40 },
        { id: 3, name: '西部市', status: '拥堵', x: 25, y: 45 },
        { id: 4, name: '南部市', status: '畅通', x: 55, y: 65 },
        { id: 5, name: '北部市', status: '畅通', x: 40, y: 20 },
      ];
      
      return mockMarkers.map(marker => (
        <div
          key={marker.id}
          style={{
            position: 'absolute',
            left: `${marker.x}%`,
            top: `${marker.y}%`,
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
          }}
          title={marker.name}
        >
          <EnvironmentOutlined 
            style={{ 
              fontSize: 24, 
              color: marker.status === '畅通' ? '#52c41a' : 
                     marker.status === '缓行' ? '#faad14' : '#f5222d'
            }} 
          />
          <Text 
            style={{ 
              display: 'block', 
              fontSize: 12, 
              whiteSpace: 'nowrap',
              background: 'rgba(255,255,255,0.9)',
              padding: '2px 6px',
              borderRadius: 4,
              marginTop: 2
            }}
          >
            {marker.name}
          </Text>
        </div>
      ));
    }
    
    return markers.map((marker, index) => (
      <div
        key={marker.id || index}
        style={{
          position: 'absolute',
          left: `${(marker.coordinates?.lng - 118) * 20 + 10}%`,
          top: `${(32 - marker.coordinates?.lat) * 25 + 10}%`,
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
        }}
        title={marker.name}
      >
        <EnvironmentOutlined 
          style={{ 
            fontSize: 20, 
            color: marker.status_color || '#1890ff'
          }} 
        />
      </div>
    ));
  };

  const defaultLegend = [
    { color: '#52c41a', label: '畅通' },
    { color: '#faad14', label: '缓行' },
    { color: '#ff7a45', label: '拥堵' },
    { color: '#f5222d', label: '严重拥堵' },
  ];

  return (
    <Card 
      style={{ ...style }}
      bodyStyle={{ padding: 0, height }}
    >
      <div 
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #e8f4fc 0%, #d4e8f5 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
        }}
      >
        {/* 模拟地图网格 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(24, 144, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(24, 144, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
        
        {/* 模拟省界轮廓 */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          right: '15%',
          bottom: '15%',
          border: '2px solid rgba(24, 144, 255, 0.3)',
          borderRadius: '30% 40% 45% 35%',
        }} />
        
        {/* 标题 */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(255,255,255,0.95)',
          padding: '8px 16px',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <Space>
            <AimOutlined style={{ color: '#1890ff' }} />
            <Text strong>{title}</Text>
          </Space>
        </div>
        
        {/* 中心点 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 12,
            height: 12,
            background: '#1890ff',
            borderRadius: '50%',
            border: '3px solid #fff',
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.5)',
            margin: '0 auto',
          }} />
          <Text style={{ 
            fontSize: 12, 
            color: '#1890ff',
            display: 'block',
            marginTop: 4,
          }}>
            {center.lng.toFixed(2)}, {center.lat.toFixed(2)}
          </Text>
        </div>
        
        {/* 标记点 */}
        {renderMarkers()}
        
        {/* 图例 */}
        {showLegend && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(255,255,255,0.95)',
            padding: '8px 12px',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              图例
            </Text>
            <Space direction="vertical" size={4}>
              {(legendItems.length > 0 ? legendItems : defaultLegend).map((item, index) => (
                <Space key={index} size={8}>
                  <div style={{
                    width: 12,
                    height: 12,
                    background: item.color,
                    borderRadius: 2,
                  }} />
                  <Text style={{ fontSize: 12 }}>{item.label}</Text>
                </Space>
              ))}
            </Space>
          </div>
        )}
        
        {/* 比例尺 */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'rgba(255,255,255,0.95)',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
        }}>
          <div style={{
            width: 60,
            height: 4,
            background: '#001529',
            marginBottom: 4,
          }} />
          <Text style={{ fontSize: 10 }}>50 km</Text>
        </div>
      </div>
    </Card>
  );
};

export default MapPlaceholder;
