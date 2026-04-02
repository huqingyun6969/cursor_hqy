import React from 'react'
import { Card, Result } from 'antd'
import { AuditOutlined } from '@ant-design/icons'

const CompliancePage: React.FC = () => {
  return (
    <Card style={{ borderRadius: 8, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        icon={<AuditOutlined style={{ color: '#1677ff' }} />}
        title="标准符合性检测"
        subTitle="功能开发中..."
      />
    </Card>
  )
}

export default CompliancePage
