import {
  BranchesOutlined,
  NodeIndexOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  App,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Descriptions,
  ConfigProvider,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import G6 from '@antv/g6';

// --- 1. 全局配置与类型定义 ---

// 节点样式配置（颜色与中文名）
const NODE_STYLE_CONFIG: Record<string, { color: string; label: string }> = {
  'COMPANY': { color: '#FFC101', label: '企业' },      // 亮黄色
  'PERSON': { color: '#1890FF', label: '自然人' },    // 蓝色
  'PFCOMPANY': { color: '#722ED1', label: '私募公司' }, // 紫色
  'PFUND': { color: '#008000', label: '私募基金' },     // 橙色
  'SECURITY': { color: '#F5222D', label: '证券' },     // 红色
  'Unknown': { color: '#BFBFBF', label: '未知' }
};

// 关系类型映射
// # 需要排除的关系类型
//  excluded_relations = ['BRANCH', 'CUSTOMER', 'ISSUE', 'JOINDER', 'SUE', 'SUPPLIER']
// 'BRANCH': '分支机构(BRANCH)',
// 'CUSTOMER': '客户(CUSTOMER)',
// 'SUPPLIER': '供应商(SUPPLIER)',
// 'ISSUE': '发行(ISSUE)',
// 'JOINDER': '共同签署人(JOINDER)',
// 'SUE': '诉讼(SUE)',
const RELATION_LABEL_MAP: Record<string, string> = {
  
  'INVEST': '投资(INVEST)',
  'TRUSTEE': '信托受托方(TRUSTEE)',
  'GUARANTEE': '担保(GUARANTEE)',
  'CONTROLLER': '控制(CONTROLLER)',
  'WORK': '工作(WORK)',
};

// 节点类型下拉选项
const NODE_TYPE_OPTIONS = [
  { value: 'COMPANY', label: '企业' },
  { value: 'PERSON', label: '人' },
  { value: 'PFCOMPANY', label: '基金公司' },
  { value: 'PFUND', label: '基金' },
  { value: 'SECURITY', label: '证券' },
];

// 节点属性中文映射表
const PROPERTY_MAP: Record<string, { label: string; isRisk?: boolean }> = {
  COMPANY_NM: { label: '公司名称' },
  COMPANY_NM_OLD: { label: '曾用名' },
  ORGNUM: { label: '统一社会信用代码' },
  STATUS: { label: '经营状态' },
  REG_CAPITAL: { label: '注册资本（万元）' },
  COMPANY_TYPE_LIST: { label: '公司类型' },
  WARNING_NUM: { label: '风险预警总数', isRisk: true },
  RISK_LIST: { label: '风险标签编号', isRisk: true },
  RISK_INFO: { label: '高级别风险事件', isRisk: true },
  FACTOR_INFO: { label: '风险因子明细', isRisk: true },
};

// 风险严重程度映射
const IMPORTANCE_MAP: Record<string, { label: string; color: string; priority: number }> = {
  '-3': { label: '极高风险', color: '#f5222d', priority: 1 },
  '-2': { label: '高风险', color: '#fa541c', priority: 2 },
  '-1': { label: '一般风险', color: '#faad14', priority: 3 },
  '0': { label: '提示信息', color: '#1890ff', priority: 4 },
};

// 风险因子类型映射
const FACTOR_TYPE_MAP: Record<string, string> = {
  '1': '财务预警',
  '2': '法律诉讼',
  '3': '股权变动',
};

// 风险事件类型映射
const RISK_TYPE_MAP: Record<string, string> = {
  '1': '减持风险',
  '2': '违规风险',
  '3': '负面舆情',
};

interface GraphNode {
  id: string;
  name: string;
  labels: string[];
  properties: Record<string, any>;
  typeKey: string;
  levelName: string;
  color: string;
  x?: number;
  y?: number;
  warningCount: number;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  originalLabel: string;
}

// 自定义统计组件
const CustomStatistic = ({ title, value, subTitle }: { title: string; value: number; subTitle?: string }) => (
  <div style={{ padding: '8px 0' }}>
    <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: '30px', fontWeight: '600', color: '#000', lineHeight: 1.2, fontFamily: 'Arial' }}>
      {value.toLocaleString()}
    </div>
    {subTitle && (
      <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)', marginTop: 8 }}>{subTitle}</div>
    )}
  </div>
);

const Admin: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  // --- 状态管理 ---
  const [rawData, setRawData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // 详情弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailTitle, setDetailTitle] = useState("");

  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  // --- 辅助函数 ---
  const parseRiskJson = (jsonStr: string) => {
    try {
      let fixedStr = jsonStr.trim();
      if (!fixedStr.startsWith('[')) {
        fixedStr = '[' + fixedStr.replace(/\}\s*\{/g, '},{') + ']';
      }
      const parsed = JSON.parse(fixedStr);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [];
    }
  };

  const safeParseCount = (jsonStr: string) => {
    try { return parseRiskJson(jsonStr).length; } catch { return 0; }
  };

  // --- API 交互 ---
  const loadData = async (url: string, isSearch: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const result = await response.json();
      
      if (isSearch && (!result.nodes || result.nodes.length === 0)) {
        message.warning("未找到相关的关联主体");
        setRawData({ nodes: [], edges: [] });
      } else {
        setRawData(result);
        if (isSearch) message.success(`找到 ${result.nodes.length} 个关联节点`);
        
        // 缩放适配
        setTimeout(() => {
          if (fgRef.current) {
            fgRef.current.zoomToFit(400, 50);
            if (fgRef.current.zoom() < 1.5) fgRef.current.zoom(1.8, 300); 
          }
        }, 500);
      }
    } catch (err) {
      message.error('后端服务连接失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFullGraph = () => loadData('/api/v1/graph?limit=100', false);

  // 加载节点的扩展子图
  const loadSubgraph = async (nodeId: string) => {
    if (!nodeId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/subgraph/${nodeId}?layer=Subject&limit=100`);
      const result = await response.json();
      
      if (result.nodes && result.nodes.length > 0 && rawData) {
        // 合并新数据到现有图谱
        const existingNodeIds = new Set(rawData.nodes.map((n: any) => n.id));
        const existingEdgeIds = new Set(rawData.edges.map((e: any) => e.id));
        
        // 添加新节点（去重）
        const newNodes = result.nodes.filter((n: any) => !existingNodeIds.has(n.id));
        // 添加新边（去重）
        const newEdges = result.edges.filter((e: any) => !existingEdgeIds.has(e.id));
        
        // 合并数据
        const mergedData = {
          nodes: [...rawData.nodes, ...newNodes],
          edges: [...rawData.edges, ...newEdges]
        };
        
        setRawData(mergedData);
        
        if (newNodes.length > 0 || newEdges.length > 0) {
          message.success(`已扩展 ${newNodes.length} 个新节点和 ${newEdges.length} 条新关系`);
          
          // 缩放适配
          setTimeout(() => {
            if (graphRef.current && !graphRef.current.get('destroyed')) {
              graphRef.current.fitView(50);
              if (graphRef.current.getZoom() < 1) {
                graphRef.current.zoomTo(1, { x: 0, y: 0 });
              }
            }
          }, 300);
        } else {
          message.info('该节点的所有关联节点已显示在图中');
        }
      } else if (result.nodes && result.nodes.length > 0) {
        // 如果没有现有数据，直接设置新数据
        setRawData(result);
        message.success(`已加载 ${result.nodes.length} 个关联节点`);
      } else {
        message.warning('未找到该节点的关联节点');
      }
    } catch (err) {
      message.error('加载子图失败');
      console.error('Subgraph load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: any) => {
    const { keyword, nodeType, relationType, layers } = values;
    const q = keyword?.trim();
    
    // 构造查询参数
    const params = new URLSearchParams();
    
    // 如果有中心节点关键词，添加关键词参数
    if (q) {
      params.append('q', q);
    }
    
    // 添加筛选条件（即使没有关键词也可以查询）
    if (nodeType) params.append('nodeType', nodeType);
    if (relationType) params.append('relType', relationType);
    if (layers) params.append('layers', layers.toString());
    params.append('limit', '100'); // 限制返回100个节点
    params.append('layer', 'Subject');
    
    // 如果没有关键词也没有任何筛选条件，加载全图
    if (!q && !nodeType && !relationType) {
      loadFullGraph();
      return;
    }
    
    // 调用搜索接口（支持有/无关键词的情况）
    loadData(`/api/v1/search?${params.toString()}`, true);
  };

  useEffect(() => { loadFullGraph(); }, []);

  // --- 数据处理 (Memo) ---
  const processedData = useMemo(() => {
    if (!rawData) return { nodes: [], links: [], nodeCategories: 0, linkCategories: 0 };

    const allLabels = new Set<string>();
    const allLinkTypes = new Set<string>();

  const data = rawData;
    if (!data || !data.nodes || !data.edges) {
      return { nodes: [], links: [], nodeCategories: 0, linkCategories: 0 };
    }

    const nodes = data.nodes.map((node) => {
      const labels = node.labels || [];
      labels.forEach((l: string) => allLabels.add(l));
      
      // 优先级判断节点类型
      let typeKey = 'Unknown';
      if (labels.includes('PFCOMPANY')) typeKey = 'PFCOMPANY';
      else if (labels.includes('PFUND')) typeKey = 'PFUND';
      else if (labels.includes('SECURITY')) typeKey = 'SECURITY';
      else if (labels.includes('COMPANY')) typeKey = 'COMPANY';
      else if (labels.includes('PERSON')) typeKey = 'PERSON';
      else if (labels.includes('Subject')) typeKey = 'Subject';
      else if (labels.includes('Event')) typeKey = 'EVENT';

      const config = NODE_STYLE_CONFIG[typeKey] || NODE_STYLE_CONFIG['Unknown'];
      const properties = node.properties || {};

      return {
        ...node,
        id: String(node.id),
        name: properties.COMPANY_NM || properties.name || '未知',
        labels,
        properties,
        typeKey,
        levelName: config.label,
        color: config.color, // 使用固定配色
        warningCount: parseInt(properties.WARNING_NUM || 0),
      };
    });

    const links = data.edges.map(edge => {
      const originalLabel = edge.label || '关联';
      if (originalLabel) allLinkTypes.add(originalLabel);
      
      // 获取关系的properties（如果存在）
      const properties = edge.properties || {};
      
      // 对于WORK关系，优先使用position属性值作为标签
      let displayLabel = RELATION_LABEL_MAP[originalLabel] || originalLabel;
      if (originalLabel === 'WORK' && properties.position) {
        displayLabel = properties.position;
      }
      
      return {
        source: String(edge.source),
        target: String(edge.target),
        label: displayLabel,
        originalLabel,
        properties: properties,
      };
    });

    return {
      nodes,
      links,
      nodeCategories: allLabels.size,
      linkCategories: allLinkTypes.size
    };
  }, [rawData]);

  const [dbStats, setDbStats] = useState<{total: number, details: any[]}>({ total: 0, details: [] });

  const loadDbStatistics = async () => {
    try {
      const response = await fetch('/api/v1/statistics');
      const data = await response.json();
      setDbStats(data);
    } catch (err) {
      console.error("加载统计数据失败", err);
    }
  };
  useEffect(() => {
    loadFullGraph();
    loadDbStatistics();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !processedData.nodes.length) return;

    // 1. 如果图实例已存在，先销毁，避免重复渲染
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    // 2. 数据转换：将 processedData 转换为 G6 需要的格式
    // 选择中心节点：优先选择度最高的节点，如果没有则选择第一个节点
    let centerNodeId: string | null = null;
    if (processedData.nodes.length > 0) {
      const nodeDegreeMap = new Map<string, number>();
      processedData.links.forEach(link => {
        nodeDegreeMap.set(String(link.source), (nodeDegreeMap.get(String(link.source)) || 0) + 1);
        nodeDegreeMap.set(String(link.target), (nodeDegreeMap.get(String(link.target)) || 0) + 1);
      });
      // 找到度最高的节点作为中心节点
      let maxDegree = -1;
      processedData.nodes.forEach(node => {
        const degree = nodeDegreeMap.get(String(node.id)) || 0;
        if (degree > maxDegree) {
          maxDegree = degree;
          centerNodeId = String(node.id);
        }
      });
      // 如果没有找到（所有节点度都为0），选择第一个节点
      if (!centerNodeId) {
        centerNodeId = String(processedData.nodes[0].id);
      }
    }

    const data = {
      nodes: processedData.nodes.map((node) => {
        // 标签截断逻辑
        const labelText = node.name.length > 10 ? `${node.name.substring(0, 10)}...` : node.name;
        const isCenter = String(node.id) === centerNodeId;
        
        return {
          id: String(node.id),
          label: labelText, // 节点下方显示的中文名字
          fullLabel: node.name, // 存完整名字用于 Tooltip
          isCenter, // 标记中心节点
          style: {
            fill: node.color, // 填充色 
            stroke: isCenter ? '#1890ff' : '#fff',   // 中心节点用蓝色描边
            lineWidth: isCenter ? 3 : 2,
            r: isCenter ? 20 : 16,            // 中心节点稍大
            cursor: 'pointer'
          },
          // 标签配置
          labelCfg: {
            position: 'bottom',
            offset: 8,
            style: {
              fill: isCenter ? '#1890ff' : '#666',
              fontSize: isCenter ? 13 : 12,
              fontWeight: isCenter ? 'bold' : 'normal',
              fontFamily: 'Microsoft YaHei',
            },
          },
          ...node, // 保留原始数据
        };
      }),
      edges: processedData.links.map((link) => ({
        source: String(link.source), // G6 要求 source/target 必须是字符串 ID
        target: String(link.target),
        label: link.label, // 连线上的中文标注
        type: 'quadratic', // 使用二次贝塞尔曲线，更适合圆形布局
        style: {
          endArrow: {
            path: G6.Arrow.triangle(8, 8, 0), // 箭头大小
            fill: '#d1d1d6',
            stroke: '#d1d1d6',
          },
          stroke: '#d1d1d6',
          lineWidth: 2,
          radius: 8, // 曲线圆角
        },
        labelCfg: {
          autoRotate: true, // 标签随线旋转
          refY: -10, // 标签偏移，避免与线重叠
          style: {
            fill: '#666',
            fontSize: 11,
            fontWeight: 500,
            background: {
              fill: '#ffffff',
              padding: [3, 5, 3, 5],
              radius: 3,
            }, 
          },
        },
      })),
    };

    // 3. 实例化图谱
    const width = window.innerWidth - 100;
    const height = 750;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      fitView: true,
      fitViewPadding: 50,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node'], // 允许拖拽画布、缩放、拖拽节点
      },
      layout: {
        type: 'force', // 力导向布局，实现环中心球结构
        center: [centerX, centerY], // 布局中心点
        preventOverlap: true, // 防止节点重叠
        nodeSize: 40, // 节点大小，用于碰撞检测
        linkDistance: 150, // 连线的理想长度
        nodeStrength: (d: any) => {
          // 中心节点不受力，固定位置；其他节点受到斥力
          return d.isCenter ? -1000 : -300;
        },
        edgeStrength: 0.3, // 边的引力强度
        collideStrength: 0.8, // 碰撞强度
        alpha: 0.3, // 初始温度
        alphaDecay: 0.02, // 温度衰减速度
        alphaMin: 0.01, // 最小温度
        // 布局开始前，将中心节点固定在画布中心
        onLayoutStart: () => {
          if (graph && centerNodeId) {
            const centerNode = graph.findById(centerNodeId);
            if (centerNode) {
              centerNode.update({
                x: centerX,
                y: centerY,
                fx: centerX,
                fy: centerY, // 固定中心节点位置
              });
            }
          }
        },
        // 布局过程中，保持中心节点位置固定
        tick: () => {
          if (graph && centerNodeId) {
            const centerNode = graph.findById(centerNodeId);
            if (centerNode) {
              centerNode.update({
                fx: centerX,
                fy: centerY,
              });
            }
          }
        },
      },
      // 节点状态样式（选中/hover）
      nodeStateStyles: {
        selected: {
          stroke: '#1890ff', // 选中时的颜色
          lineWidth: 4,
          fillOpacity: 1,
          shadowColor: 'rgba(24, 144, 255, 0.5)',
          shadowBlur: 10
        },
        hover: {
          cursor: 'pointer',
          lineWidth: 3,
        }
      },
    });

    graph.data(data);
    graph.render();
    graphRef.current = graph;

    // 4. 事件监听
    // 节点点击
    graph.on('node:click', async (evt) => {
      const { item } = evt;
      const model = item?.getModel();
      
      // 处理选中样式和光晕效果
      const nodes = graph.getNodes();
      nodes.forEach((n: any) => {
        // 清除其他选中状态和光晕
        graph.clearItemStates(n, 'selected');
        const otherGroup = n.getContainer();
        if (otherGroup) {
          const otherHalo = otherGroup.find((child: any) => child.get('name') === 'halo-circle');
          if (otherHalo) {
            otherHalo.stopAnimate();
            otherGroup.removeChild(otherHalo);
          }
        }
      });
      
      graph.setItemState(item!, 'selected', true); // 设置当前选中
      
      // 添加光晕动画效果
      const nodeGroup = item!.getContainer();
      if (nodeGroup) {
        // 创建光晕圆圈
        let halo = nodeGroup.find((child: any) => child.get('name') === 'halo-circle');
        if (!halo) {
          halo = nodeGroup.addShape('circle', {
            attrs: {
              r: 25,
              fill: '#ff4d4f',
              opacity: 0.3,
              x: 0,
              y: 0,
            },
            name: 'halo-circle',
            zIndex: -1,
          });
        }
        // 停止之前的动画并重新开始
        halo.stopAnimate();
        halo.animate(
          {
            r: 30,
            opacity: 0.1,
          },
          {
            duration: 1000,
            repeat: true,
            easing: 'easeCubic',
          }
        );
      }

      // 触发你的业务逻辑
      if (model) {
        setSelectedNode(model as any);
        setDrawerVisible(true);
      }
    });

    // 节点 Hover 效果
    graph.on('node:mouseenter', (evt) => {
      const { item } = evt;
      graph.setItemState(item!, 'hover', true);
    });
    graph.on('node:mouseleave', (evt) => {
      const { item } = evt;
      graph.setItemState(item!, 'hover', false);
    });

    // 窗口 Resize 监听
    const handleResize = () => {
      if (!graph || graph.get('destroyed')) return;
      graph.changeSize(window.innerWidth - 100, 750);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (graph) graph.destroy();
    };
  }, [processedData]); 

  // 监听外部 selectedNode 变化（比如通过搜索框选中），同步到图谱选中状态
  useEffect(() => {
    if (!graphRef.current || !selectedNode) return;
    const item = graphRef.current.findById(selectedNode.id);
    if (item) {
      const nodes = graphRef.current.getNodes();
      nodes.forEach((n: any) => graphRef.current?.clearItemStates(n, 'selected'));
      graphRef.current.setItemState(item, 'selected', true);
      graphRef.current.focusItem(item, true, { easing: 'easeCubic', duration: 500 });
    }
  }, [selectedNode]);

  return (
    <PageContainer title="主体层图谱检索">
      <style>{`
        .custom-select-dropdown .ant-select-item,
        .custom-select-dropdown .ant-select-item-option {
          font-size: 20px !important;
          text-align: center !important;
          padding: 8px 12px !important;
        }
        .custom-select-dropdown .ant-select-item-option-content,
        .custom-select-dropdown .ant-select-item-option-content > * {
          text-align: center !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
      `}</style>
      {/* 1. 顶部统计卡片 */}
      <Card style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} variant="outlined">
        <Row gutter={[24, 0]} align="middle" style={{ padding: '8px 0' }}>
          {/* 全局总数统计 */}
          <Col flex="1">
            <div style={{ padding: '4px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', color: 'rgba(0,0,0,0.65)', marginBottom: 6, fontWeight: 500 }}>主体层总节点</div>
              <div style={{ fontSize: '30px', fontWeight: '600', color: '#000', lineHeight: 1.2 }}>
                {dbStats.total.toLocaleString()}
              </div>
            </div>
          </Col>

          <Col flex="0 0 1px">
            <div style={{ borderLeft: '1px solid #e8e8e8', height: '50px', margin: '0 auto' }} />
          </Col>
          
          {/* 各类型节点统计（带图例） */}
          {dbStats.details.map((item, index) => {
            const config = NODE_STYLE_CONFIG[item.type] || { color: '#BFBFBF' };
            
            return (
              <React.Fragment key={index}>
                <Col flex="1">
                  <div style={{ padding: '4px 0', textAlign: 'center' }}>
                    {/* 标题部分包含颜色圆点（即图例） */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                      <span style={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: '50%', 
                        backgroundColor: config.color, 
                        marginRight: 8, 
                        display: 'inline-block',
                        border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }} />
                      <span style={{ fontSize: '20px', color: 'rgba(0,0,0,0.65)', fontWeight: 500 }}>{item.label}</span>
                    </div>
                    {/* 统计数值 */}
                    <div style={{ fontSize: '30px', fontWeight: '600', color: '#000', lineHeight: 1.2 }}>
                      {item.value.toLocaleString()}
                    </div>
                  </div>
                </Col>
                {index < dbStats.details.length - 1 && (
                  <Col flex="0 0 1px">
                    <div style={{ borderLeft: '1px solid #e8e8e8', height: '50px', margin: '0 auto' }} />
                  </Col>
                )}
              </React.Fragment>
            );
          })}
          
          {/* 分割线 */}
          <Col flex="0 0 1px">
            <div style={{ borderLeft: '1px solid #e8e8e8', height: '50px', margin: '0 auto' }} />
          </Col>
          
          {/* 当前知识图谱画布统计 */}
          <Col flex="1">
            <div style={{ padding: '4px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', color: 'rgba(0,0,0,0.65)', marginBottom: 6, fontWeight: 500 }}>当前图谱节点</div>
              <div style={{ fontSize: '30px', fontWeight: '600', color: '#1890ff', lineHeight: 1.2 }}>
                {processedData.nodes.length.toLocaleString()}
              </div>
            </div>
          </Col>
          
          <Col flex="0 0 1px">
            <div style={{ borderLeft: '1px solid #e8e8e8', height: '50px', margin: '0 auto' }} />
          </Col>
          
          <Col flex="1">
            <div style={{ padding: '4px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', color: 'rgba(0,0,0,0.65)', marginBottom: 6, fontWeight: 500 }}>当前图谱关系</div>
              <div style={{ fontSize: '30px', fontWeight: '600', color: '#1890ff', lineHeight: 1.2 }}>
                {processedData.links.length.toLocaleString()}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 2. 搜索栏 (灰色背景风格) */}
      <Card style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} variant="outlined">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSearch}
          labelCol={{ style: { fontSize: '16px', color: 'rgba(0,0,0,0.65)', fontWeight: 500, marginBottom: 6 } }}
        >
          <Row gutter={16} align="bottom" style={{ padding: '8px 0' }}>
            <Col flex="1">
              <Form.Item label={<span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.65)', fontWeight: 500 }}>中心节点查询</span>} name="keyword" style={{ marginBottom: 0 }}>
                <Input 
                  placeholder="输入中心节点名称" 
                  variant="filled" 
                  style={{ backgroundColor: '#f4f5f7', height: 40, fontSize: '16px' }} 
                />
              </Form.Item>
            </Col>
            <Col flex="1">
              <Form.Item label={<span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.65)', fontWeight: 500 }}>周围关联节点类型</span>} name="nodeType" style={{ marginBottom: 0 }}>
                <Select 
                  placeholder="选择类型" 
                  variant="filled" 
                  style={{ backgroundColor: '#f4f5f7', height: 40, fontSize: '16px' }} 
                  popupClassName="custom-select-dropdown"
                  options={NODE_TYPE_OPTIONS}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col flex="1">
              <Form.Item label={<span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.65)', fontWeight: 500 }}>周围关联节点关系类型</span>} name="relationType" style={{ marginBottom: 0 }}>
                <Select 
                  placeholder="选择关系" 
                  variant="filled" 
                  style={{ backgroundColor: '#f4f5f7', height: 40, fontSize: '16px' }}
                  popupClassName="custom-select-dropdown"
                  options={Object.keys(RELATION_LABEL_MAP).map(k => ({ label: RELATION_LABEL_MAP[k], value: k }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col flex="1">
              <Form.Item label={<span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.65)', fontWeight: 500 }}>穿透层级</span>} name="layers" style={{ marginBottom: 0 }} initialValue={1}>
                <Select 
                  variant="filled" 
                  style={{ backgroundColor: '#f4f5f7', height: 40, fontSize: '16px' }}
                  popupClassName="custom-select-dropdown"
                  options={[{value:1, label:'1层'}, {value:2, label:'2层'}, {value:3, label:'3层'}]}
                />
              </Form.Item>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <Space size="middle">
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  onClick={() => form.submit()}
                  style={{ 
                    backgroundColor: '#000', 
                    height: 42, 
                    width: 42, 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                />
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => { form.resetFields(); loadFullGraph(); }}
                  style={{ height: 42, borderRadius: 8, width: 42 }}
                />
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 3. 图谱区域 */}
      <Card styles={{ body: { padding: 0 } }} variant="outlined">
        <div style={{ background: '#fafafa', height: '750px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>

          <Spin spinning={loading} style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 10 }} />
          <div ref={containerRef} id="graph-container" />
        </div>
      </Card>

      <Drawer
        title="节点详细信息"
        width={500}
        onClose={() => {
          setDrawerVisible(false);
          // 清除选中状态和光晕
          if (graphRef.current && !graphRef.current.get('destroyed')) {
            const nodes = graphRef.current.getNodes();
            nodes.forEach((n: any) => {
              graphRef.current.clearItemStates(n, 'selected');
              const nodeGroup = n.getContainer();
              if (nodeGroup) {
                const halo = nodeGroup.find((child: any) => child.get('name') === 'halo-circle');
                if (halo) {
                  halo.stopAnimate();
                  nodeGroup.removeChild(halo);
                }
              }
            });
          }
        }}
        open={drawerVisible}
        mask={false}
        styles={{ 
          wrapper: { 
            top: '50px',
            right: '20px',
            bottom: '50px',
            borderRadius: '8px',
            overflow: 'hidden'
          },
          body: { padding: '24px' } 
        }}
      >
        {selectedNode ? (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 头部摘要 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: '50%', 
                backgroundColor: selectedNode.color, margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                fontSize: '24px', fontWeight: 'bold'
              }}>
                {selectedNode.levelName[0]}
              </div>
              <h3 style={{ marginBottom: 8 }}>{selectedNode.name}</h3>
              <Tag color={selectedNode.color}>{selectedNode.levelName}</Tag>
            </div>
            
            {/* 加载扩展子图按钮 */}
            <Button 
              type="primary" 
              icon={<BranchesOutlined />}
              onClick={() => loadSubgraph(selectedNode.id)}
              loading={loading}
              block
              style={{ height: 40, fontSize: 16 }}
            >
              加载该节点的扩展子图
            </Button>
            
            {/* 详细属性列表 */}
            <Descriptions column={1} bordered size="small">
              {Object.keys(PROPERTY_MAP).map((key) => {
                // 检查当前选中的节点属性中是否存在该字段
                const val = selectedNode.properties[key];
                const config = PROPERTY_MAP[key];

                if (val === undefined || val === null) return null;

                const isRiskField = config.isRisk;
                const displayValue = String(val);

                return (
                  <Descriptions.Item 
                    label={config.label} 
                    key={key}
                    labelStyle={isRiskField ? { color: '#f5222d', fontWeight: 'bold' } : {}}
                  >
                    <span style={isRiskField ? { color: '#cf1322', fontWeight: '500' } : {}}>
                    {key.includes('INFO') ? (
                      <a onClick={() => {
                        const list = parseRiskJson(displayValue);
                        setDetailData(list);
                        setDetailTitle(config.label);
                        setDetailModalVisible(true);
                      }}>
                        点击查看明细 ({safeParseCount(displayValue)}条)
                      </a>
                    ) : displayValue}
                    </span>
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </Space>
        ) : <Empty />}
      </Drawer>

      <Modal
        title={<span><b style={{ color: '#f5222d' }}>{selectedNode?.name}</b> - {detailTitle}</span>}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={950}
        footer={null}
      >
        {(() => {
          // 1. 判断数据类型
          const hasFactor = detailData.some(item => item.FACTOR !== undefined);
          const hasRisk = detailData.some(item => item.RISK !== undefined);

          // 2. 构造列
          const columns: any[] = [
            {
              title: '预警日期',
              dataIndex: 'NOTICE_DT',
              width: 120,
              render: (text: string) => text?.split(' ')[0],
              sorter: (a: any, b: any) => new Date(a.NOTICE_DT).getTime() - new Date(b.NOTICE_DT).getTime(),
            },
            {
              title: '严重程度',
              dataIndex: 'IMPORTANCE',
              width: 100,
              render: (val: string) => {
                const config = IMPORTANCE_MAP[String(val)] || { label: val, color: 'default' };
                return <Tag color={config.color}>{config.label}</Tag>;
              },
              sorter: (a: any, b: any) => {
                const priorityA = IMPORTANCE_MAP[String(a.IMPORTANCE)]?.priority || 99;
                const priorityB = IMPORTANCE_MAP[String(b.IMPORTANCE)]?.priority || 99;
                return priorityA - priorityB; // 数值越小优先级越高（极高风险排前面）
              },
              defaultSortOrder: 'ascend' as const,
            }
          ];

          // 3. 动态插入"分类"列
          if (hasFactor) {
            columns.push({
              title: '因子分类',
              dataIndex: 'FACTOR',
              width: 120,
              render: (val: string) => <Tag color="blue">{FACTOR_TYPE_MAP[String(val)] || `因子 ${val}`}</Tag>,
            });
          } else if (hasRisk) {
            columns.push({
              title: '风险类别',
              dataIndex: 'RISK',
              width: 120,
              render: (val: string) => <Tag color="magenta">{RISK_TYPE_MAP[String(val)] || `风险 ${val}`}</Tag>,
            });
          }

          columns.push({
            title: '具体风险事迹',
            dataIndex: 'RISK_TYPE',
            render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
          });

          return (
            <Table 
              dataSource={detailData} 
              columns={columns}
              rowKey={(record: any, index?: number) => `risk-${index ?? Date.now()}-${Math.random()}`}
              size="small"
              bordered
              pagination={{ pageSize: 10 }}
            />
          );
        })()}
      </Modal>
    </PageContainer>
  );
};
      
export default Admin;
  