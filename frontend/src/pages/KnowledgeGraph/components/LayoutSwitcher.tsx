import React from 'react';
import { Select } from 'antd';

var LAYOUT_OPTIONS = [
  { value: 'gForce', label: '力导向 (GPU)' },
  { value: 'force2', label: '力导向' },
  { value: 'dagre', label: '层次化 (TB)' },
  { value: 'dagre-lr', label: '层次化 (LR)' },
  { value: 'circular', label: '环形' },
  { value: 'concentric', label: '同心圆' },
];

interface LayoutSwitcherProps {
  currentLayout: string;
  onLayoutChange: (layoutType: string) => void;
  disabled?: boolean;
}

var LayoutSwitcher: React.FC<LayoutSwitcherProps> = function (_a) {
  var currentLayout = _a.currentLayout, onLayoutChange = _a.onLayoutChange, disabled = _a.disabled;
  return React.createElement(Select, {
    value: currentLayout,
    onChange: onLayoutChange,
    options: LAYOUT_OPTIONS,
    size: "small",
    style: { width: 150 },
    disabled: disabled,
  });
};

export default LayoutSwitcher;
