
import React from 'react';
import { ConversionPlan, BOMItem, SafetyRisk } from '../types';
import { CarIcon, BatteryIcon, BoltIcon, ShieldCheckIcon, DocumentTextIcon, CurrencyDollarIcon, SpeakerWaveIcon, LinkIcon } from './Icons';

interface PlanDisplayProps {
  plan: ConversionPlan | null;
  onTextToSpeech: (text: string) => void;
}

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-brand-surface border border-gray-700 rounded-lg p-4 shadow-lg animate-fade-in">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-lg font-semibold text-white ml-3">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailItem: React.FC<{ label: string; value: string | number | undefined; unit?: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between items-baseline py-2 border-b border-gray-800">
    <span className="text-sm text-brand-muted">{label}</span>
    <span className="text-base font-medium text-gray-200">{value ?? 'N/A'} {unit}</span>
  </div>
);

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onTextToSpeech }) => {
  if (!plan) {
    return null;
  }

  const handleSpeak = (text: string) => {
    onTextToSpeech(text);
  };

  const severityColor = (severity: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch(severity) {
      case 'LOW': return 'bg-green-600/50 text-green-300 border-green-500';
      case 'MEDIUM': return 'bg-yellow-600/50 text-yellow-300 border-yellow-500';
      case 'HIGH': return 'bg-red-600/50 text-red-300 border-red-500';
      default: return 'bg-gray-600/50 text-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-brand-surface border border-gray-700 rounded-lg p-5 shadow-lg">
             <h2 className="text-2xl font-bold text-brand-blue mb-2">EV Conversion Plan Generated</h2>
             <div className="flex items-start">
                <p className="text-gray-300 flex-grow">{plan.summary}</p>
                <button onClick={() => handleSpeak(plan.summary)} className="ml-4 p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <SpeakerWaveIcon className="w-5 h-5 text-brand-muted"/>
                </button>
             </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <InfoCard title="Vehicle" icon={<CarIcon className="w-6 h-6 text-brand-blue"/>}>
            <DetailItem label="Make" value={plan.vehicle.make} />
            <DetailItem label="Model" value={plan.vehicle.model} />
            <DetailItem label="Year" value={plan.vehicle.year} />
        </InfoCard>

        <InfoCard title="Drivetrain" icon={<BoltIcon className="w-6 h-6 text-brand-blue"/>}>
            <DetailItem label="Motor" value={plan.drivetrain.motor} />
            <DetailItem label="Inverter" value={plan.drivetrain.inverter} />
            <DetailItem label="Gear Ratio" value={plan.drivetrain.gearRatio} />
        </InfoCard>
        
        <InfoCard title="Battery System" icon={<BatteryIcon className="w-6 h-6 text-brand-blue"/>}>
            <DetailItem label="Chemistry" value={plan.battery.chemistry} />
            <DetailItem label="Voltage" value={plan.battery.voltage} unit="V" />
            <DetailItem label="Capacity" value={plan.battery.capacity_kWh} unit="kWh" />
            <DetailItem label="Pack Layout" value={plan.battery.packLayout} />
        </InfoCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Bill of Materials (BOM)" icon={<DocumentTextIcon className="w-6 h-6 text-brand-blue"/>}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-brand-muted uppercase bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-4 py-2">Item</th>
                            <th scope="col" className="px-4 py-2 text-center">Qty</th>
                            <th scope="col" className="px-4 py-2 text-right">Unit Cost</th>
                            <th scope="col" className="px-4 py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plan.bom.map((item: BOMItem, index) => (
                            <tr key={index} className="border-b border-gray-800">
                                <td className="px-4 py-2 font-medium text-gray-200">{item.description}</td>
                                <td className="px-4 py-2 text-center">{item.qty}</td>
                                <td className="px-4 py-2 text-right">${item.unitCost.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right font-semibold">${(item.qty * item.unitCost).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </InfoCard>

         <InfoCard title="Cost & Labor" icon={<CurrencyDollarIcon className="w-6 h-6 text-brand-blue"/>}>
             <div className="space-y-4">
                <div className="text-center bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-sm text-brand-muted">Total Estimated Cost</p>
                    <p className="text-3xl font-bold text-brand-green">${plan.cost.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                 <DetailItem label="Parts Cost" value={`$${plan.cost.parts.toFixed(2)}`} />
                 <DetailItem label="Labor Cost" value={`$${plan.cost.labor.toFixed(2)}`} />
                 <DetailItem label="Labor Hours" value={plan.laborHours} unit="hrs" />
             </div>
        </InfoCard>
      </div>
       <InfoCard title="Safety & Compliance" icon={<ShieldCheckIcon className="w-6 h-6 text-brand-blue"/>}>
          <div className="space-y-4">
              <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Applicable Standards</h4>
                  <div className="flex flex-wrap gap-2">
                      {plan.safety.standards.map((std, i) => (
                          <span key={i} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">{std}</span>
                      ))}
                  </div>
              </div>
               <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Identified Risks</h4>
                  <ul className="space-y-2">
                      {plan.safety.risks.map((risk: SafetyRisk, i) => (
                          <li key={i} className={`p-3 rounded-md border ${severityColor(risk.severity)}`}>
                              <div className="flex justify-between items-center">
                                  <p className="font-bold">{risk.code}</p>
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full border">{risk.severity}</span>
                              </div>
                              <p className="text-sm mt-1">{risk.remediation}</p>
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </InfoCard>

      {plan.citations && plan.citations.length > 0 && (
           <InfoCard title="Grounded Citations" icon={<LinkIcon className="w-6 h-6 text-brand-blue"/>}>
               <ul className="space-y-2">
                   {plan.citations.map((citation, index) => (
                       <li key={index}>
                           <a href={citation.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm flex items-center gap-2">
                              <LinkIcon className="w-4 h-4" /> {citation.title}
                           </a>
                       </li>
                   ))}
               </ul>
            </InfoCard>
      )}
    </div>
  );
};
