import { FileText, Briefcase, DollarSign, Clock } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function FreelancerDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Open Proposals', value: '4', icon: FileText, color: 'text-accent' },
    { label: 'Active Contracts', value: '2', icon: Briefcase, color: 'text-blue-600' },
    { label: 'Pending Payments', value: '$1,200', icon: Clock, color: 'text-purple-600' },
    { label: 'Total Earnings', value: '$12,450', icon: DollarSign, color: 'text-green-600' },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-tenor font-bold mb-1">Welcome back, Freelancer</h1>
          <p className="text-text-secondary text-sm">Here is a summary of your freelance business.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/freelancer/browse')}>
          Browse Projects
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-lg border border-border shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                <Icon size={18} className={stat.color} />
              </div>
              <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Active Contracts</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="p-8 text-center text-text-secondary text-sm">
          No active contracts at the moment. Keep bidding!
        </div>
      </div>
    </div>
  );
}
