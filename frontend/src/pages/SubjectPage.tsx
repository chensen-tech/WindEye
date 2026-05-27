import React from 'react';
import LayerGraphPage from './KnowledgeGraph/components/LayerGraphPage';
import { SUBJECT_CONFIG } from './graphConfig';

const SubjectPage: React.FC = () => <LayerGraphPage config={SUBJECT_CONFIG} />;

export default SubjectPage;
