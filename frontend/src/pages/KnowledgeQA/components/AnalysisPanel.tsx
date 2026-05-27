import React, { useEffect, useRef, useMemo } from 'react'
import * as echarts from 'echarts'
import { Spin, Empty, Table, Button, Tooltip, message } from 'antd'
import { DownloadOutlined, FileImageOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAgentStore } from '../store/agentStore'

interface AnalysisPanelProps {
  onClose: () => void
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onClose }) => {
  const { analysisResult, analysisQuery, isLoading, error } = useAgentStore()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const resizeObserver = useRef<ResizeObserver | null>(null)

  const handleExportImage = () => {
    if (!chartInstance.current) {
      message.warning('Chart not ready')
      return
    }
    try {
      const dataURL = chartInstance.current.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff',
      })
      const link = document.createElement('a')
      link.download = `chart_${Date.now()}.png`
      link.href = dataURL
      link.click()
      message.success('Chart exported')
    } catch (err) {
      console.error('Export image failed:', err)
      message.error('Export failed')
    }
  }

  const handleExportCSV = () => {
    if (!analysisResult?.raw_data || analysisResult.raw_data.length === 0) {
      message.warning('No data to export')
      return
    }
    try {
      const data = analysisResult.raw_data
      const headers = Object.keys(data[0])

      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const val = row[header]
              const escaped = ('' + (val ?? '')).replace(/"/g, '""')
              return `"${escaped}"`
            })
            .join(',')
        ),
      ]

      const csvString = '﻿' + csvRows.join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `data_${Date.now()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('CSV exported')
    } catch (err) {
      console.error('Export CSV failed:', err)
      message.error('Export failed')
    }
  }

  const columns: ColumnsType<any> = useMemo(() => {
    if (!analysisResult?.raw_data || analysisResult.raw_data.length === 0) return []

    return Object.keys(analysisResult.raw_data[0]).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      sorter: (a: any, b: any) => {
        const valA = a[key]
        const valB = b[key]
        if (typeof valA === 'number' && typeof valB === 'number') {
          return valA - valB
        }
        return String(valA).localeCompare(String(valB))
      },
      ellipsis: true,
    }))
  }, [analysisResult?.raw_data])

  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current)

    resizeObserver.current = new ResizeObserver(() => {
      chartInstance.current?.resize()
    })
    resizeObserver.current.observe(chartRef.current)

    return () => {
      resizeObserver.current?.disconnect()
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [])

  useEffect(() => {
    if (!analysisResult?.echarts_config || !chartInstance.current) {
      chartInstance.current?.clear()
      return
    }
    chartInstance.current.setOption(analysisResult.echarts_config, true)
  }, [analysisResult?.echarts_config])

  if (!analysisResult && !isLoading && !error) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              Start a data analysis query on the left
            </span>
          }
        />
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <rect x="1" y="3" width="14" height="10" rx="2" stroke="#6c8ef5" strokeWidth="1.4" />
            <path d="M4 7h8M4 10h5" stroke="#6c8ef5" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={styles.headerTitle}>Analysis Results</span>
          {analysisQuery && <span style={styles.queryBadge}>{analysisQuery}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {analysisResult && (
            <Tooltip title="Export chart as image">
              <Button
                type="text"
                icon={<FileImageOutlined style={{ color: '#64748b' }} />}
                onClick={handleExportImage}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Tooltip>
          )}
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.chartSection}>
          {isLoading && !analysisResult && (
            <div style={styles.loadingOverlay}>
              <Spin tip="Analyzing data..." size="large" />
            </div>
          )}
          {error && <div style={styles.errorBanner}>{error}</div>}
          <div ref={chartRef} style={styles.chartCanvas} />
        </div>

        <div style={styles.dataSection}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div style={styles.sectionLabel}>
              Data Preview{' '}
              {analysisResult &&
                `(${analysisResult.row_count || analysisResult.raw_data.length} rows)`}
            </div>
            {analysisResult && analysisResult.raw_data.length > 0 && (
              <Button
                type="primary"
                ghost
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
                style={{ fontSize: 12, borderRadius: 4, height: 24 }}
              >
                Export CSV
              </Button>
            )}
          </div>
          {analysisResult && analysisResult.raw_data.length > 0 ? (
            <div style={styles.tableWrapper}>
              <Table
                dataSource={analysisResult.raw_data}
                columns={columns}
                rowKey={(_record, index) => index?.toString() || ''}
                pagination={{
                  pageSize: 10,
                  size: 'small',
                  showSizeChanger: false,
                  style: { marginBottom: 0 },
                }}
                size="middle"
                scroll={{ y: 'calc(100% - 40px)' }}
              />
            </div>
          ) : (
            <div style={styles.noDataPlaceholder}>
              {isLoading ? 'Fetching data...' : 'No raw data available'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f5',
    background: '#fafafa',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
    whiteSpace: 'nowrap',
  },
  queryBadge: {
    fontSize: 11,
    color: '#6c8ef5',
    background: 'rgba(108,142,245,0.1)',
    padding: '2px 8px',
    borderRadius: 10,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 200,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chartSection: {
    position: 'relative',
    height: '60%',
    minHeight: 350,
    borderBottom: '1px solid #f0f0f5',
  },
  chartCanvas: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.8)',
    zIndex: 10,
  },
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '8px 16px',
    background: '#fef2f2',
    color: '#dc2626',
    fontSize: 12,
    zIndex: 11,
    borderBottom: '1px solid #fee2e2',
  },
  dataSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  tableWrapper: {
    flex: 1,
    overflow: 'auto',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  noDataPlaceholder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: 13,
    background: '#f8fafc',
    borderRadius: 8,
    border: '1px dashed #e2e8f0',
  },
}

export default AnalysisPanel
