import { FolderOpen, FileText, CreditCard, MessageSquare, Plus, ArrowRight, MoreHorizontal, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function ClientDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Projects', value: '3', icon: FolderOpen, color: 'text-accent' },
    { label: 'Pending Proposals', value: '12', icon: FileText, color: 'text-blue-600' },
    { label: 'Escrow Balance', value: '$8,450', icon: CreditCard, color: 'text-green-600' },
    { label: 'Unread Messages', value: '5', icon: MessageSquare, color: 'text-purple-600' },
  ];

  const recentProjects = [
    { id: 1, title: 'Full Stack Web App for Real Estate', status: 'Active', proposals: 8, budget: '$5,000', deadline: 'Oct 24' },
    { id: 2, title: 'Brand Identity & Logo Design', status: 'Sourcing', proposals: 24, budget: '$1,200', deadline: 'Sep 15' },
    { id: 3, title: 'SEO Optimization for E-commerce', status: 'Completed', proposals: 4, budget: '$800', deadline: 'Aug 30' },
  ];

  const statusColors: Record<string, string> = {
    'Active': 'bg-blue-50 text-blue-700 border-blue-200',
    'Sourcing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Completed': 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-tenor font-bold mb-1">Overview</h1>
          <p className="text-text-secondary text-sm">Welcome back. Here's what's happening with your projects.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/client/post-project')} className="flex items-center gap-2">
          <Plus size={18} />
          Post New Project
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
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold font-tenor">Recent Projects</h2>
            <Button variant="ghost" size="sm" className="text-text-secondary">View All</Button>
          </div>
          
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex flex-col divide-y divide-border">
              {recentProjects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-surface/50 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[16px] text-text-primary group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <button className="text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[12px] font-medium border ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <FileText size={14} /> {project.proposals} Proposals
                    </span>
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <CreditCard size={14} /> {project.budget}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-xs text-text-muted flex items-center gap-1.5">
                      <Clock size={14} /> Deadline: {project.deadline}
                    </span>
                    <span className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage Project <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <h2 className="text-[20px] font-bold font-tenor">Action Items</h2>
          
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-start gap-4 mb-5 pb-5 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Review new proposals</h4>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  You have 8 new proposals for "Brand Identity & Logo Design".
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full">Review Now</Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Approve Milestone</h4>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  Freelancer submitted work for "Full Stack Web App".
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full">View Submission</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
