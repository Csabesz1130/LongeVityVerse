// File: components/IntegrationsPanel.tsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Integration } from '@/types';

interface IntegrationsPanelProps {
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
}

const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ integrations, onToggleIntegration }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent>
        {integrations.map((integration) => (
          <div key={integration.id} className="flex items-center justify-between mb-2">
            <span>{integration.name}</span>
            <Button onClick={() => onToggleIntegration(integration.id)}>
              {integration.isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default IntegrationsPanel;