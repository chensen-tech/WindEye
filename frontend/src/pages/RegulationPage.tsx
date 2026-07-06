import React from 'react';
import LayerGraphPage from './KnowledgeGraph/components/LayerGraphPage';
import { REGULATION_CONFIG } from './graphConfig';

const RegulationPage: React.FC = () => <LayerGraphPage config={REGULATION_CONFIG} />;

export default RegulationPage;
