import { List, Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { getCrawlTasks } from '@/services/data-collection';

const { Text } = Typography;

const TaskHistory: React.FC = () => {
  const [tasks, setTasks] = useState<API.CrawlTaskItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = () => {
    setLoading(true);
    getCrawlTasks({ limit: 5 })
      .then((res) => {
        if (res.tasks) setTasks(res.tasks);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  if (tasks.length === 0) {
    return <Text type="secondary">暂无历史任务</Text>;
  }

  return (
    <List
      loading={loading}
      size="small"
      dataSource={tasks}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<ClockCircleOutlined />}
            title={
              <Text style={{ fontSize: 13 }}>
                {item.mode === 'quick' ? '快速采集' : item.mode === 'template' ? '模板采集' : '智能采集'}
                <Tag style={{ marginLeft: 8 }}>{item.data_type === 'risk_event' ? '风险事件' : '风险舆情'}</Tag>
              </Text>
            }
            description={
              <Text type="secondary" style={{ fontSize: 11 }}>
                {item.completed_at?.slice(0, 19).replace('T', ' ')} | {item.task_id?.slice(0, 12)}
              </Text>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default TaskHistory;
