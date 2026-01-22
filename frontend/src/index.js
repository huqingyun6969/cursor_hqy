/**
 * 省级综合交通运输信息平台 - 入口文件
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import App from './App';
import './index.css';

// 设置 dayjs 中文
dayjs.locale('zh-cn');

// Ant Design 主题配置 - 交通行业规范配色（蓝白为主）
const themeConfig = {
  token: {
    colorPrimary: '#1890ff',      // 主色调-蓝色
    colorSuccess: '#52c41a',      // 成功-绿色
    colorWarning: '#faad14',      // 警告-黄色
    colorError: '#f5222d',        // 错误-红色
    colorInfo: '#1890ff',         // 信息-蓝色
    borderRadius: 4,              // 圆角
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
      bodyBg: '#f0f2f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
