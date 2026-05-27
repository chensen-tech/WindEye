import { Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { getCrawlTemplates } from '@/services/data-collection';
import { useCrawlStore } from '../store/crawlStore';

const TemplatePanel: React.FC = () => {
  const [templates, setTemplates] = useState<API.CrawlTemplate[]>([]);
  const setMode = useCrawlStore((s) => s.setMode);
  const setDataType = useCrawlStore((s) => s.setDataType);
  const setSources = useCrawlStore((s) => s.setSources);
  const setKeywords = useCrawlStore((s) => s.setKeywords);
  const setMaxPages = useCrawlStore((s) => s.setMaxPages);
  const setTemplateId = useCrawlStore((s) => s.setTemplateId);

  useEffect(() => {
    getCrawlTemplates()
      .then((res) => {
        if (res.templates) setTemplates(res.templates);
      })
      .catch(() => {});
  }, []);

  const handleClick = (t: API.CrawlTemplate) => {
    setMode('template');
    setTemplateId(t.id);
    setDataType(t.data_type);
  };

  const colorMap: Record<string, string> = {
    announcement: 'blue',
    news: 'orange',
    law: 'green',
  };

  return (
    <div>
      {templates.map((t) => (
        <Tag.CheckableTag
          key={t.id}
          checked={false}
          onChange={() => handleClick(t)}
          style={{
            display: 'block',
            marginBottom: 8,
            padding: '6px 12px',
            border: `1px solid var(--ant-color-border)`,
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          <span style={{ color: 'var(--ant-color-text)' }}>[{t.label}]</span>
        </Tag.CheckableTag>
      ))}
    </div>
  );
};

export default TemplatePanel;
