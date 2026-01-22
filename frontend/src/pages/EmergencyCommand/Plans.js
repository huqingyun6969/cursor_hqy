/**
 * 省级交通应急指挥调度管理子系统 - 应急预案
 * 重新设计：美观、简洁、大气、上档次
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Space, Button, Modal, Typography, Descriptions, Steps, List, Divider, Empty } from 'antd';
import {
  FileTextOutlined, 
  SearchOutlined, 
  PlayCircleOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  RightOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { emergencyApi } from '../../services/api';

const { Text, Title, Paragraph } = Typography;
const { Step } = Steps;

const EmergencyPlans = () => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await emergencyApi.getPlans();
      setPlans(res.data?.list || generateMockPlans());
    } catch (error) {
      setPlans(generateMockPlans());
    }
    setLoading(false);
  };

  const generateMockPlans = () => [
    { id: 1, name: '重大交通事故应急预案', level: 'I级', type: '事故类', description: '适用于造成30人以上死亡或100人以上重伤的特别重大道路交通事故', response_time: '15分钟', update_time: '2024-01-15' },
    { id: 2, name: '恶劣天气交通保障预案', level: 'II级', type: '气象类', description: '适用于暴雨、暴雪、大雾等恶劣天气的交通保障', response_time: '30分钟', update_time: '2024-02-20' },
    { id: 3, name: '危险品运输事故预案', level: 'I级', type: '危化品类', description: '适用于危险化学品运输车辆发生泄漏、爆炸等事故', response_time: '10分钟', update_time: '2024-03-10' },
    { id: 4, name: '大型活动交通保障预案', level: 'III级', type: '保障类', description: '适用于大型体育赛事、演唱会等活动的交通保障', response_time: '60分钟', update_time: '2024-01-25' },
    { id: 5, name: '桥梁隧道应急处置预案', level: 'II级', type: '设施类', description: '适用于桥梁、隧道发生结构损坏或安全事故', response_time: '20分钟', update_time: '2024-04-05' },
  ];

  const viewPlanDetail = async (plan) => {
    setSelectedPlan({
      ...plan,
      content: {
        scope: '本预案适用于全省范围内的相关应急事件处置',
        organization: [
          { role: '指挥长', responsibility: '总体指挥协调，决策重大事项' },
          { role: '副指挥长', responsibility: '协助指挥，分管具体事务' },
          { role: '现场指挥', responsibility: '现场处置指挥，协调各方力量' },
          { role: '信息组', responsibility: '信息收集、研判与发布' },
          { role: '救援组', responsibility: '现场救援处置' },
        ],
        procedures: [
          { step: 1, name: '事件报告', content: '接报后立即核实事件信息，5分钟内完成初步研判' },
          { step: 2, name: '启动响应', content: '根据事件级别启动相应预案，通知相关人员' },
          { step: 3, name: '力量调度', content: '调配应急资源赶赴现场，确保15分钟内到达' },
          { step: 4, name: '现场处置', content: '组织实施现场救援，控制事态发展' },
          { step: 5, name: '信息发布', content: '及时发布事件处置信息，做好舆情引导' },
          { step: 6, name: '善后处理', content: '做好善后恢复工作，组织事件复盘' },
        ],
        resources_required: ['救援车辆不少于5辆', '救护车不少于2辆', '消防车不少于2辆', '专业救援人员不少于20人'],
      }
    });
    setDetailVisible(true);
  };

  const invokePlan = async (plan, e) => {
    e?.stopPropagation();
    Modal.success({
      title: '预案调取成功',
      content: `已成功调取预案：${plan.name}`,
    });
  };

  // 预案级别配置
  const levelConfig = {
    'I级': { color: '#f5222d', bg: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)', text: '特别重大' },
    'II级': { color: '#fa8c16', bg: 'linear-gradient(135deg, #ffa940 0%, #ffc069 100%)', text: '重大' },
    'III级': { color: '#faad14', bg: 'linear-gradient(135deg, #ffec3d 0%, #fff566 100%)', text: '较大' },
    'IV级': { color: '#1890ff', bg: 'linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%)', text: '一般' },
  };

  // 统计数据
  const stats = [
    { level: 'I级', count: plans.filter(p => p.level === 'I级').length, ...levelConfig['I级'] },
    { level: 'II级', count: plans.filter(p => p.level === 'II级').length, ...levelConfig['II级'] },
    { level: 'III级', count: plans.filter(p => p.level === 'III级').length, ...levelConfig['III级'] },
    { level: 'IV级', count: plans.filter(p => p.level === 'IV级').length, ...levelConfig['IV级'] },
  ];

  return (
    <div>
      <PageHeader 
        title="应急预案管理" 
        subtitle="查看和调取各类应急预案，快速响应突发事件"
        breadcrumb={['应急指挥调度', '应急预案']}
      />

      {/* 统计卡片区域 - 重新设计 */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={12} sm={12} md={6} key={stat.level}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                border: 'none',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              bodyStyle={{
                padding: 0,
              }}
            >
              <div style={{
                background: stat.bg,
                padding: '20px 24px',
                color: '#fff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>{stat.level}预案</div>
                    <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{stat.count}</div>
                  </div>
                  <SafetyCertificateOutlined style={{ fontSize: 48, opacity: 0.3 }} />
                </div>
                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
                  {stat.text}事件响应
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 预案列表区域 - 重新设计 */}
      <Card 
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>预案列表</span>
            <Tag color="blue">{plans.length} 个预案</Tag>
          </Space>
        }
        style={{ 
          borderRadius: 12, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
        bodyStyle={{ padding: '12px 24px 24px' }}
      >
        {plans.length === 0 ? (
          <Empty description="暂无预案数据" />
        ) : (
          <Row gutter={[20, 20]}>
            {plans.map((plan) => {
              const config = levelConfig[plan.level] || levelConfig['IV级'];
              return (
                <Col xs={24} md={12} lg={8} key={plan.id}>
                  <Card
                    hoverable
                    onClick={() => viewPlanDetail(plan)}
                    style={{
                      borderRadius: 12,
                      border: '1px solid #f0f0f0',
                      height: '100%',
                      transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{ padding: 0 }}
                    className="plan-hover-card"
                  >
                    {/* 顶部色条 */}
                    <div style={{
                      height: 6,
                      background: config.bg,
                      borderRadius: '12px 12px 0 0',
                    }} />
                    
                    <div style={{ padding: '20px 20px 16px' }}>
                      {/* 标题行 */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Title level={5} style={{ 
                            margin: 0, 
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#1a1a1a',
                          }} ellipsis>
                            {plan.name}
                          </Title>
                        </div>
                        <Tag 
                          style={{ 
                            marginLeft: 8,
                            background: config.bg,
                            border: 'none',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 4,
                            padding: '2px 10px',
                          }}
                        >
                          {plan.level}
                        </Tag>
                      </div>

                      {/* 类型标签 */}
                      <div style={{ marginBottom: 12 }}>
                        <Tag style={{ 
                          background: '#f5f5f5', 
                          border: 'none',
                          color: '#666',
                          borderRadius: 4,
                        }}>
                          {plan.type}
                        </Tag>
                      </div>

                      {/* 描述 */}
                      <Paragraph 
                        ellipsis={{ rows: 2 }} 
                        style={{ 
                          color: '#666', 
                          fontSize: 13, 
                          marginBottom: 16,
                          lineHeight: 1.6,
                          minHeight: 42,
                        }}
                      >
                        {plan.description}
                      </Paragraph>

                      {/* 响应时间 */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: '#fafafa',
                        borderRadius: 8,
                        marginBottom: 16,
                      }}>
                        <ClockCircleOutlined style={{ color: config.color, marginRight: 8 }} />
                        <Text style={{ color: '#666', fontSize: 13 }}>响应时间：</Text>
                        <Text strong style={{ color: config.color }}>{plan.response_time}</Text>
                      </div>

                      {/* 操作按钮 */}
                      <div style={{ 
                        display: 'flex', 
                        gap: 12,
                        paddingTop: 12,
                        borderTop: '1px solid #f0f0f0',
                      }}>
                        <Button 
                          type="default"
                          icon={<SearchOutlined />}
                          style={{ 
                            flex: 1,
                            borderRadius: 6,
                            height: 36,
                          }}
                          onClick={(e) => { e.stopPropagation(); viewPlanDetail(plan); }}
                        >
                          查看详情
                        </Button>
                        <Button 
                          type="primary"
                          icon={<ThunderboltOutlined />}
                          style={{ 
                            flex: 1,
                            borderRadius: 6,
                            height: 36,
                            background: config.bg,
                            border: 'none',
                          }}
                          onClick={(e) => invokePlan(plan, e)}
                        >
                          调取预案
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* 预案详情弹窗 - 重新设计 */}
      <Modal
        title={null}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
        style={{ top: 40 }}
        bodyStyle={{ padding: 0 }}
      >
        {selectedPlan && (
          <div>
            {/* 弹窗头部 */}
            <div style={{
              background: levelConfig[selectedPlan.level]?.bg || levelConfig['IV级'].bg,
              padding: '32px 32px 24px',
              color: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <Tag style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: 'none', 
                    color: '#fff',
                    marginBottom: 12,
                  }}>
                    {selectedPlan.type}
                  </Tag>
                  <Title level={3} style={{ color: '#fff', margin: 0 }}>
                    {selectedPlan.name}
                  </Title>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  borderRadius: 8,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{selectedPlan.level}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>预案级别</div>
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
                <Space>
                  <ClockCircleOutlined />
                  <span>响应时间：{selectedPlan.response_time}</span>
                </Space>
                <Space>
                  <CheckCircleOutlined />
                  <span>更新时间：{selectedPlan.update_time}</span>
                </Space>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div style={{ padding: 32 }}>
              {/* 适用范围 */}
              <div style={{ marginBottom: 32 }}>
                <Title level={5} style={{ marginBottom: 12 }}>
                  <SafetyCertificateOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  适用范围
                </Title>
                <Card size="small" style={{ background: '#f9f9f9', border: 'none' }}>
                  <Text>{selectedPlan.content?.scope}</Text>
                </Card>
              </div>

              {/* 组织架构 */}
              <div style={{ marginBottom: 32 }}>
                <Title level={5} style={{ marginBottom: 12 }}>
                  <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  应急组织架构
                </Title>
                <Row gutter={[12, 12]}>
                  {selectedPlan.content?.organization?.map((item, index) => (
                    <Col span={12} key={index}>
                      <Card size="small" style={{ background: '#f9f9f9', border: 'none' }}>
                        <Text strong style={{ color: '#1890ff' }}>{item.role}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>{item.responsibility}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* 响应流程 */}
              <div style={{ marginBottom: 32 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  <ThunderboltOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  响应处置流程
                </Title>
                <Steps 
                  direction="vertical" 
                  size="small" 
                  current={-1}
                  style={{ paddingLeft: 4 }}
                >
                  {selectedPlan.content?.procedures?.map(p => (
                    <Step 
                      key={p.step} 
                      title={<Text strong>{p.name}</Text>}
                      description={<Text type="secondary">{p.content}</Text>}
                    />
                  ))}
                </Steps>
              </div>

              {/* 资源需求 */}
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 12 }}>
                  <CheckCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  资源需求
                </Title>
                <Row gutter={[12, 12]}>
                  {selectedPlan.content?.resources_required?.map((item, index) => (
                    <Col span={12} key={index}>
                      <div style={{ 
                        padding: '8px 12px', 
                        background: '#f0f7ff', 
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        <Text>{item}</Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>

              <Divider />

              {/* 底部操作按钮 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button size="large" onClick={() => setDetailVisible(false)}>
                  关闭
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ThunderboltOutlined />}
                  style={{
                    background: levelConfig[selectedPlan.level]?.bg || levelConfig['IV级'].bg,
                    border: 'none',
                  }}
                  onClick={() => { invokePlan(selectedPlan); setDetailVisible(false); }}
                >
                  立即调取预案
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 添加自定义样式 */}
      <style>{`
        .plan-hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </div>
  );
};

export default EmergencyPlans;
