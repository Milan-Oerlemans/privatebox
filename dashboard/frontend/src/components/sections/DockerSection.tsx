import React from 'react';

import { Section } from '../Section';
import { DockerList } from '../DockerList';
import { DockerContainer, PendingCommand } from '../../types';

interface DockerSectionProps {
  containers: DockerContainer[];
  pendingCommands: Record<string, PendingCommand>;
  onCommand: (command: string, id: string, wasRunning: boolean) => void;
}

export const DockerSection: React.FC<DockerSectionProps> = ({ containers, pendingCommands, onCommand }) => {
  return (
    <Section className="bg-gray-50 flex flex-col items-start justify-start p-8">
       <h3 className="text-2xl font-bold text-gray-800 mb-4 sticky top-0 bg-gray-50 w-full z-10 pb-4">Docker Containers</h3>
       <div className="w-full flex-1 min-h-0 overflow-y-auto">
          <DockerList 
            containers={containers} 
            pendingCommands={pendingCommands} 
            onCommand={onCommand} 
          />
       </div>
    </Section>
  );
};
