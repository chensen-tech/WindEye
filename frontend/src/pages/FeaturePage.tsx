import React from 'react';
import LayerGraphPage from './KnowledgeGraph/components/LayerGraphPage';
import { FEATURE_CONFIG } from './graphConfig';

const FeaturePage: React.FC = () => <LayerGraphPage config={FEATURE_CONFIG} />;

export default FeaturePage;
