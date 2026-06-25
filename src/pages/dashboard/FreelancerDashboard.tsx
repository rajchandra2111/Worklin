import { FileText, Briefcase, DollarSign, Search, ArrowRight, MoreHorizontal, Clock, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function FreelancerDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Open Proposals', value: '4', icon: FileText, color: 'text-accent' },
    { label: 'Active Contracts', value: '2', icon: Briefcase, color: 'text-blue-600' },
    { label: 'Available Balance', value: '$1,200', icon: DollarSign, color: 'text-green-600' },
    { label: 'Job Success', value: '98%', icon: Star, color: 'text-yellow-500' },
  ];

  const recommendedProjects = [
    { id: 1, title: 'Senior React Developer for Fintech Dashboard', client: 'FinServe Inc', budget: '$60/hr', type: 'Hourly', posted: '2h ago' },
    { id: 2, title: 'Build a Next.js Marketing Site', client: 'WebStudio', budget: '$2,500', type: 'Fixed', posted: '5h ago' },
    { id: 3, title: 'Supabase Database Optimization', client: 'StartupX', budget: '$800', type: 'Fixed', posted: '1d ago' },
  ];

  const activeContracts = [
    { id: 1, title: 'E-commerce React Migration', client: 'RetailCo', status: 'In Progress', nextMilestone: '$1,500' },
    { id: 2, title: 'API Integration & Webhooks', client: 'SaaS Platform', status: 'In Review', nextMilestone: '$400' },
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-tenor font-bold mb-1">My Workspace</h1>
          <p className="text-text-secondary text-sm">Here is a summary of your freelance business today.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/freelancer/browse')} className="flex items-center gap-2">
          <Search size={18} />
          Find Work
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-lg bg-surface ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <span className="text-[32px] font-bold text-text-primary tracking-tight">{stat.value}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Projects) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recommended Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold font-tenor">Recommended for You</h2>
              <Button variant="ghost" size="sm" className="text-text-secondary">View More</Button>
            </div>
            
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-border">
                {recommendedProjects.map((project) => (
                  <div key={project.id} className="p-6 hover:bg-surface/50 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[16px] text-text-primary group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <button className="text-text-muted hover:text-accent bg-transparent border-none cursor-pointer">
                        <Star size={18} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                      <span className="text-text-secondary font-medium">{project.type}</span>
                      <span className="text-text-primary font-semibold">{project.budget}</span>
                      <span className="text-text-secondary">Client: {project.client}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-xs text-text-muted flex items-center gap-1.5">
                        <Clock size={14} /> Posted {project.posted}
                      </span>
                      <span className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Submit Proposal <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <h2 className="text-[20px] font-bold font-tenor">Active Contracts</h2>
          
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex flex-col divide-y divide-border">
              {activeContracts.map((contract) => (
                <div key={contract.id} className="p-5 hover:bg-surface/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[14px] font-semibold text-text-primary leading-tight pr-4">
                      {contract.title}
                    </h4>
                    <MoreHorizontal size={16} className="text-text-muted shrink-0" />
                  </div>
                  <p className="text-xs text-text-secondary mb-3">{contract.client}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-text-muted uppercase font-semibold tracking-wider mb-1">Status</span>
                      <span className="text-[13px] font-medium text-blue-600">{contract.status}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] text-text-muted uppercase font-semibold tracking-wider mb-1">Next Milestone</span>
                      <span className="text-[13px] font-bold text-text-primary">{contract.nextMilestone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border bg-surface text-center">
              <Button variant="ghost" size="sm" className="text-text-secondary w-full text-xs">View All Contracts</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
