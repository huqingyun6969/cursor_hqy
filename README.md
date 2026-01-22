# 省级综合交通运输信息平台升级项目

## 项目概述

本项目是"省级综合交通运输信息平台升级项目"的演示系统，基于 **Python (Django) + React** 技术栈开发，包含4个核心子系统：

1. **省级交通运行预警预测子系统** - 路网拥堵/车流量预测、全省交通态势可视化、预警规则配置、运行报表
2. **省级交通应急指挥调度管理子系统** - 应急力量可视化、应急预案调取、事件全流程处置、值班排班
3. **省级基础设施监测预警子系统** - 监测数据驾驶舱、设施档案管理、实时监测、故障报警
4. **省级一张网出行服务子系统** - 出行地图查询、服务区预约、一键救援、交旅融合推荐

---

## 项目结构

```
/workspace/
├── backend/                          # Django 后端
│   ├── manage.py                     # Django 管理脚本
│   ├── requirements.txt              # Python 依赖
│   ├── config/                       # Django 项目配置
│   │   ├── __init__.py
│   │   ├── settings.py               # 项目设置
│   │   ├── urls.py                   # 主路由配置
│   │   └── wsgi.py                   # WSGI 配置
│   ├── apps/                         # 应用模块
│   │   ├── traffic_warning/          # 交通预警预测子系统
│   │   │   ├── models.py             # 数据模型
│   │   │   ├── views.py              # API 视图
│   │   │   └── urls.py               # 路由配置
│   │   ├── emergency_command/        # 应急指挥调度子系统
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── infrastructure/           # 基础设施监测子系统
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   └── travel_service/           # 出行服务子系统
│   │       ├── models.py
│   │       ├── views.py
│   │       └── urls.py
│   └── utils/                        # 工具模块
│       └── mock_data.py              # 模拟数据生成器
│
├── frontend/                         # React 前端
│   ├── package.json                  # Node.js 依赖
│   ├── public/
│   │   └── index.html               # HTML 模板
│   └── src/
│       ├── index.js                  # 入口文件
│       ├── index.css                 # 全局样式
│       ├── App.js                    # 主应用组件
│       ├── components/               # 公共组件
│       │   ├── StatCard.js           # 统计卡片
│       │   ├── PageHeader.js         # 页面标题
│       │   ├── StatusTag.js          # 状态标签
│       │   ├── ChartCard.js          # 图表卡片
│       │   └── MapPlaceholder.js     # 地图占位组件
│       ├── pages/                    # 页面组件
│       │   ├── TrafficWarning/       # 交通预警预测
│       │   │   ├── Dashboard.js      # 态势一张图
│       │   │   ├── Map.js            # 路网监测
│       │   │   ├── Rules.js          # 预警规则配置
│       │   │   └── Report.js         # 运行报表
│       │   ├── EmergencyCommand/     # 应急指挥调度
│       │   │   ├── Overview.js       # 应急概览
│       │   │   ├── Resources.js      # 应急力量
│       │   │   ├── Plans.js          # 应急预案
│       │   │   ├── Events.js         # 事件处置
│       │   │   └── Duty.js           # 值班排班
│       │   ├── Infrastructure/       # 基础设施监测
│       │   │   ├── Dashboard.js      # 监测驾驶舱
│       │   │   ├── Facilities.js     # 设施档案
│       │   │   ├── Alerts.js         # 故障报警
│       │   │   └── Mobile.js         # 移动端查询
│       │   └── TravelService/        # 出行服务
│       │       ├── Map.js            # 出行地图
│       │       ├── ServiceAreas.js   # 服务区预约
│       │       ├── Rescue.js         # 一键救援
│       │       └── Recommendations.js # 交旅融合
│       ├── services/
│       │   └── api.js                # API 服务封装
│       └── utils/
│           ├── constants.js          # 常量定义
│           └── helpers.js            # 工具函数
│
└── README.md                         # 项目说明文档
```

---

## 技术栈

### 后端
- **Python 3.8+**
- **Django 4.2** - Web 框架
- **Django REST Framework** - API 开发
- **SQLite** - 数据库（演示用）

### 前端
- **React 18** - 前端框架
- **Ant Design 5** - UI 组件库
- **ECharts** - 数据可视化
- **React Router 6** - 路由管理
- **Axios** - HTTP 请求

---

## 运行环境要求

### Windows / Mac / Linux

- **Python**: 3.8 或更高版本
- **Node.js**: 16.0 或更高版本
- **npm**: 8.0 或更高版本

---

## 安装与运行步骤

### 1. 后端启动

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 数据库迁移
python manage.py migrate

# 启动后端服务（默认端口 8000）
python manage.py runserver
```

后端服务启动后，API 地址：`http://localhost:8000/api/`

### 2. 前端启动

```bash
# 新开终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 启动前端开发服务（默认端口 3000）
npm start
```

前端启动后，访问：`http://localhost:3000`

---

## 演示操作步骤

### 子系统一：省级交通运行预警预测子系统

| 功能 | 操作路径 | 演示要点 |
|------|---------|---------|
| 态势一张图 | 菜单 → 交通运行预警预测 → 态势一张图 | 展示全省交通概览、实时预警、流量趋势图、拥堵热点 |
| 路网监测 | 菜单 → 交通运行预警预测 → 路网监测 | 查看路段状态、点击路段查看详情、筛选不同状态 |
| 预警规则配置 | 菜单 → 交通运行预警预测 → 预警规则配置 | 查看规则列表、新建规则、编辑/启用/禁用规则 |
| 运行报表 | 菜单 → 交通运行预警预测 → 运行报表 | 切换日报/周报/月报、查看指标统计、导出报表 |

### 子系统二：省级交通应急指挥调度管理子系统

| 功能 | 操作路径 | 演示要点 |
|------|---------|---------|
| 应急概览 | 菜单 → 应急指挥调度 → 应急概览 | 展示资源统计、最近事件、今日值班信息 |
| 应急力量 | 菜单 → 应急指挥调度 → 应急力量 | 查看资源分布地图、按类型/状态筛选、查看资源详情 |
| 应急预案 | 菜单 → 应急指挥调度 → 应急预案 | 浏览预案列表、查看预案详情、模拟调取预案 |
| 事件处置 | 菜单 → 应急指挥调度 → 事件处置 | 上报事件、调度资源、完成处置、复盘评估 |
| 值班排班 | 菜单 → 应急指挥调度 → 值班排班 | 查看排班日历、排班列表、新增排班 |

### 子系统三：省级基础设施监测预警子系统

| 功能 | 操作路径 | 演示要点 |
|------|---------|---------|
| 监测驾驶舱 | 菜单 → 基础设施监测 → 监测驾驶舱 | 展示设施统计、健康状态分布、传感器状态、报警列表 |
| 设施档案 | 菜单 → 基础设施监测 → 设施档案 | 搜索设施、按类型筛选、查看设施详情和监测数据 |
| 故障报警 | 菜单 → 基础设施监测 → 故障报警 | 查看报警列表、开始处理、完成处理 |
| 移动端查询 | 菜单 → 基础设施监测 → 移动端查询 | 输入关键词查询设施、模拟扫码查询、查看实时监测 |

### 子系统四：省级一张网出行服务子系统

| 功能 | 操作路径 | 演示要点 |
|------|---------|---------|
| 出行地图 | 菜单 → 一张网出行服务 → 出行地图 | 切换图层显示、查看路况/气象/服务区信息 |
| 服务区预约 | 菜单 → 一张网出行服务 → 服务区预约 | 浏览服务区列表、查看详情、发起预约 |
| 一键救援 | 菜单 → 一张网出行服务 → 一键救援 | 选择救援类型、填写信息、发起救援、查看进度 |
| 交旅融合 | 菜单 → 一张网出行服务 → 交旅融合 | 按主题筛选路线、查看路线详情、预约出行 |

---

## API 接口文档

### 交通预警预测子系统

| 接口 | 方法 | 路径 | 说明 |
|------|-----|------|-----|
| 交通概览 | GET | `/api/traffic-warning/overview/` | 获取全省交通态势概览 |
| 车流量预测 | GET | `/api/traffic-warning/flow-prediction/` | 获取车流量预测数据 |
| 路网拥堵 | GET | `/api/traffic-warning/congestion/` | 获取路网拥堵状态 |
| 预警规则 | GET/POST | `/api/traffic-warning/rules/` | 预警规则配置 |
| 预警列表 | GET | `/api/traffic-warning/warnings/` | 获取预警信息列表 |
| 运行报表 | GET | `/api/traffic-warning/report/` | 获取运行指标报表 |

### 应急指挥调度子系统

| 接口 | 方法 | 路径 | 说明 |
|------|-----|------|-----|
| 应急概览 | GET | `/api/emergency/overview/` | 获取应急概览数据 |
| 应急资源 | GET | `/api/emergency/resources/` | 获取应急资源列表 |
| 应急预案 | GET | `/api/emergency/plans/` | 获取应急预案列表 |
| 应急事件 | GET/POST | `/api/emergency/events/` | 事件上报与查询 |
| 值班排班 | GET/POST | `/api/emergency/duty/` | 值班排班管理 |

### 基础设施监测子系统

| 接口 | 方法 | 路径 | 说明 |
|------|-----|------|-----|
| 驾驶舱 | GET | `/api/infrastructure/dashboard/` | 获取驾驶舱统计数据 |
| 设施列表 | GET | `/api/infrastructure/facilities/` | 获取设施档案列表 |
| 实时监测 | GET | `/api/infrastructure/monitoring/{id}/` | 获取设施实时监测数据 |
| 故障报警 | GET/POST | `/api/infrastructure/alerts/` | 故障报警管理 |

### 出行服务子系统

| 接口 | 方法 | 路径 | 说明 |
|------|-----|------|-----|
| 出行地图 | GET | `/api/travel/map/` | 获取地图数据 |
| 服务区 | GET | `/api/travel/service-areas/` | 获取服务区列表 |
| 预约 | GET/POST | `/api/travel/reservations/` | 服务预约管理 |
| 救援 | GET/POST | `/api/travel/rescue/` | 救援请求管理 |
| 旅游推荐 | GET | `/api/travel/recommendations/` | 获取交旅融合推荐 |

---

## 配色规范

系统采用交通行业标准配色，以蓝白为主：

| 颜色 | 色值 | 用途 |
|------|------|------|
| 主色 | `#1890ff` | 主要操作、链接、信息提示 |
| 成功 | `#52c41a` | 畅通状态、成功提示 |
| 警告 | `#faad14` | 缓行状态、黄色预警 |
| 危险 | `#f5222d` | 拥堵状态、红色预警、紧急操作 |
| 橙色 | `#fa8c16` | 橙色预警、次级警告 |
| 背景 | `#f0f2f5` | 页面背景 |
| 深色 | `#001529` | 侧边栏、标题 |

---

## 注意事项

1. 本系统为**演示版本**，数据为模拟生成，每次刷新会有变化
2. 前端在后端不可用时会自动使用**模拟数据**，确保演示流畅
3. 地图组件为占位展示，实际项目可集成高德/百度地图
4. 建议使用 **Chrome / Edge / Firefox** 最新版本浏览器

---

## 技术支持

如有问题，请检查：
1. Python 和 Node.js 版本是否符合要求
2. 依赖是否正确安装
3. 端口 8000 和 3000 是否被占用

---

**版本**: 1.0.0  
**更新日期**: 2024年1月
