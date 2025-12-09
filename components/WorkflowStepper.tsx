import React from 'react';
import { Check, Circle, Clock, User } from 'lucide-react';
import { Incident } from '../types';

interface WorkflowStepperProps {
  incident: Incident;
}

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ incident }) => {
  // Determine current step
  let currentStep = 0;
  const isResolved = ['Resolved', 'Closed'].includes(incident.status);
  const hasSME = !!incident.sme;
  const isTriaged = incident.warroom !== 'Unassigned' && incident.priority !== 'P4: Low'; 

  if (isResolved) currentStep = 4;
  else if (hasSME) currentStep = 3;
  else if (isTriaged || incident.status !== 'New') currentStep = 2;
  else currentStep = 1;

  const steps = [
    { id: 1, label: 'New', icon: Circle },
    { id: 2, label: 'Triaged', icon: Clock },
    { id: 3, label: 'Assigned', icon: User },
    { id: 4, label: 'Resolved', icon: Check },
  ];

  return (
    <div className="w-full flex items-center justify-between text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-200">
      {steps.map((step, idx) => {
        const isActive = currentStep >= step.id;
        const isCurrent = currentStep === step.id;
        
        return (
          <div key={step.id} className="flex items-center gap-2 flex-1 justify-center last:justify-end first:justify-start">
             {idx > 0 && <div className={`h-0.5 flex-1 mx-2 ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}></div>}
             <div className={`flex items-center gap-1.5 ${isActive ? 'text-blue-700' : ''}`}>
               {isActive ? (
                 <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check size={10} /> 
                 </div>
               ) : (
                 <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
               )}
               <span className={`${isCurrent ? 'font-bold text-gray-900' : ''}`}>{step.label}</span>
             </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowStepper;