import { Alert, Button, Descriptions, Input, Space, Tag } from 'antd';
import React, { useState } from 'react';
import { parseNLQuery } from '@/services/data-collection';
import { useCrawlStore } from '../store/crawlStore';

const { TextArea } = Input;

const ComplexInputPanel: React.FC = () => {
  const nlQuery = useCrawlStore((s) => s.nlQuery);
  const parsedIntent = useCrawlStore((s) => s.parsedIntent);
  const setNlQuery = useCrawlStore((s) => s.setNlQuery);
  const setParsedIntent = useCrawlStore((s) => s.setParsedIntent);
  const setDataType = useCrawlStore((s) => s.setDataType);
  const setSources = useCrawlStore((s) => s.setSources);
  const setKeywords = useCrawlStore((s) => s.setKeywords);
  const setMaxPages = useCrawlStore((s) => s.setMaxPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (!nlQuery.trim()) {
      setError('请输入自然语言描述');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await parseNLQuery(nlQuery);
      if (res.success && res.data) {
        setParsedIntent(res.data);
      } else {
        setError('解析失败，请重试');
      }
    } catch {
      setError('解析请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (parsedIntent) {
      setDataType(parsedIntent.data_type as API.DataType);
      setSources(parsedIntent.sources || []);
      setKeywords(parsedIntent.keywords || []);
      setMaxPages(parsedIntent.max_pages || 5);
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>
          用自然语言描述你想采集的数据
        </div>
        <TextArea
          rows={3}
          value={nlQuery}
          onChange={(e) => setNlQuery(e.target.value)}
          placeholder='例如: "最近30天沪深两市关于诉讼仲裁的公告"'
        />
      </div>

      <Button type="primary" loading={loading} onClick={handleParse}>
        解析意图
      </Button>

      {error && <Alert type="error" message={error} showIcon closable onClose={() => setError('')} />}

      {parsedIntent && (
        <div>
          <Descriptions
            title="解析结果 (确认无误后点击确认提交)"
            bordered
            size="small"
            column={2}
          >
            <Descriptions.Item label="数据类型">
              <Tag>{parsedIntent.data_type === 'announcement' ? '公司公告' : parsedIntent.data_type === 'news' ? '舆情新闻' : '法律法规'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="置信度">
              {((parsedIntent.confidence || 0) * 100).toFixed(0)}%
            </Descriptions.Item>
            <Descriptions.Item label="数据源" span={2}>
              {(parsedIntent.sources || []).map((s) => <Tag key={s}>{s}</Tag>)}
            </Descriptions.Item>
            {parsedIntent.keywords?.length > 0 && (
              <Descriptions.Item label="关键词" span={2}>
                {parsedIntent.keywords.map((k) => <Tag key={k}>{k}</Tag>)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="最大页数">{parsedIntent.max_pages || 5}</Descriptions.Item>
          </Descriptions>
          <Button type="primary" onClick={handleConfirm} style={{ marginTop: 12 }}>
            确认提交
          </Button>
        </div>
      )}
    </Space>
  );
};

export default ComplexInputPanel;
