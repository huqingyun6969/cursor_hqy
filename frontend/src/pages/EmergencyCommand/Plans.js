/**
 * 省级交通应急指挥调度管理子系统 - 应急预案
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Tag, Space, Button, Modal, Typography, Descriptions, Steps, Timeline, message } from 'antd';
import {
  FileTextOutlined, SearchOutlined, PlayCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import { PlanLevelTag } from '../../components/StatusTag';
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

  const invokePlan = async (plan) => {
    message.success(`已调取预案: ${plan.name}`);
  };

  const levelColor = (level) => {
    const map = { 'I级': '#f5222d', 'II级': '#fa8c16', 'III级': '#faad14', 'IV级': '#1890ff' };
    return map[level] || '#8c8c8c';
  };

  return (
    <div>
      <PageHeader 
        title="应急预案管理" 
        subtitle="查看和调取各类应急预案"
        breadcrumb={['应急指挥调度', '应急预案']}
      />

      {/* 预案统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {['I级', 'II级', 'III级', 'IV级'].map(level => (
          <Col xs={12} sm={6} key={level}>
            <Card size="small" style={{ borderLeft: `3px solid ${levelColor(level)}` }}>
              <Text type="secondary">{level}预案</Text>
              <div style={{ fontSize: 24, fontWeight: 600, color: levelColor(level) }}>
                {plans.filter(p => p.level === level).length}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 预案列表 */}
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
        dataSource={plans}
        loading={loading}
        renderItem={plan => (
          <List.Item>
            <Card
              hoverable
              className={`plan-card level-${plan.level.replace('级', '')}`}
              actions={[
                <Button type="link" icon={<SearchOutlined />} onClick={() => viewPlanDetail(plan)}>
                  查看详情
                </Button>,
                <Button type="link" icon={<PlayCircleOutlined />} onClick={() => invokePlan(plan)}>
                  调取预案
                </Button>,
              ]}
            >
              <Card.Meta
                avatar={<FileTextOutlined style={{ fontSize: 32, color: levelColor(plan.level) }} />}
                title={
                  <Space>
                    <Text strong>{plan.name}</Text>
                    <PlanLevelTag level={plan.level} />
                  </Space>
                }
                description={
                  <>
                    <Tag>{plan.type}</Tag>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ margin: '8px 0', color: '#8c8c8c' }}>
                      {plan.description}
                    </Paragraph>
                    <Space>
                      <ClockCircleOutlined />
                      <Text type="secondary">响应时间: {plan.response_time}</Text>
                    </Space>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      {/* 预案详情弹窗 */}
      <Modal
        title={<span><FileTextOutlined /> 预案详情</span>}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button key="invoke" type="primary" onClick={() => { invokePlan(selectedPlan); setDetailVisible(false); }}>
            调取预案
          </Button>,
        ]}
        width={800}
      >
        {selectedPlan && (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="预案名称" span={2}>{selectedPlan.name}</Descriptions.Item>
              <Descriptions.Item label="预案级别"><PlanLevelTag level={selectedPlan.level} /></Descriptions.Item>
              <Descriptions.Item label="预案类型"><Tag>{selectedPlan.type}</Tag></Descriptions.Item>
              <Descriptions.Item label="响应时间">{selectedPlan.response_time}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedPlan.update_time}</Descriptions.Item>
              <Descriptions.Item label="适用范围" span={2}>{selectedPlan.content?.scope}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>应急组织架构</Title>
            <List
              size="small"
              dataSource={selectedPlan.content?.organization || []}
              renderItem={item => (
                <List.Item>
                  <Text strong>{item.role}：</Text>{item.responsibility}
                </List.Item>
              )}
            />

            <Title level={5} style={{ marginTop: 24 }}>响应处置流程</Title>
            <Steps direction="vertical" size="small" current={-1}>
              {(selectedPlan.content?.procedures || []).map(p => (
                <Step key={p.step} title={p.name} description={p.content} />
              ))}
            </Steps>

            <Title level={5} style={{ marginTop: 24 }}>资源需求</Title>
            <List
              size="small"
              dataSource={selectedPlan.content?.resources_required || []}
              renderItem={item => <List.Item>• {item}</List.Item>}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default EmergencyPlans;
