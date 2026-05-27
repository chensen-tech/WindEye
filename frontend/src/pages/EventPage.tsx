import React from 'react';
import LayerGraphPage from './KnowledgeGraph/components/LayerGraphPage';
import { EVENT_CONFIG } from './graphConfig';

const EventPage: React.FC = () => <LayerGraphPage config={EVENT_CONFIG} />;

export default EventPage;
