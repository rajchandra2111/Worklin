import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Paperclip, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

type Conversation = {
  id: string; // e.g., 'contract_123' or 'proposal_456'
  rawId: string;
  type: 'contract' | 'proposal';
  projectTitle: string;
  otherPartyName: string;
  status: string;
  project_id: string;
};

export function Messages() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const initialProposalId = searchParams.get('proposal');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, initialProposalId]);

  // Fetch messages and subscribe to real-time updates when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      const isContract = activeConversationId.startsWith('contract_');
      const rawId = activeConversationId.replace('contract_', '').replace('proposal_', '');
      const filterCol = isContract ? 'contract_id' : 'proposal_id';

      fetchMessages(rawId, filterCol);

      const channel = supabase
        .channel(`messages:${activeConversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `${filterCol}=eq.${rawId}`,
          },
          (payload) => {
            setMessages((current) => [...current, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeConversationId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      // 1. Fetch Contracts
      const contractQuery = supabase
        .from('contracts')
        .select(`
          id, project_id, status,
          projects(title),
          client:client_profiles(full_name, company_name),
          freelancer:freelancer_profiles(full_name)
        `);
      if (role === 'client') contractQuery.eq('client_id', user?.id);
      else contractQuery.eq('freelancer_id', user?.id);
      const { data: contractData } = await contractQuery;

      // 2. Fetch Proposals (with messages)
      const proposalQuery = supabase
        .from('proposals')
        .select(`
          id, project_id, status,
          projects!inner(title, client_id),
          freelancer:freelancer_profiles(full_name),
          messages!inner(id)
        `);
      if (role === 'client') proposalQuery.eq('projects.client_id', user?.id);
      else proposalQuery.eq('freelancer_id', user?.id);
      const { data: proposalData } = await proposalQuery;

      // 3. Check for specific initial proposal (Client initiating chat)
      let initialProposal = null;
      if (initialProposalId && role === 'client') {
        const alreadyExists = proposalData?.some(p => p.id === initialProposalId);
        if (!alreadyExists) {
          const { data: single } = await supabase
            .from('proposals')
            .select(`
              id, project_id, status,
              projects!inner(title, client_id),
              freelancer:freelancer_profiles(full_name)
            `)
            .eq('id', initialProposalId)
            .single();
          if (single) initialProposal = single;
        }
      }

      // Format all
      const formattedContracts: Conversation[] = (contractData || []).map((c: any) => ({
        id: `contract_${c.id}`,
        rawId: c.id,
        type: 'contract',
        projectTitle: c.projects?.title || 'Unknown Project',
        otherPartyName: role === 'client' ? c.freelancer?.full_name : (c.client?.company_name || c.client?.full_name || 'Client'),
        status: c.status,
        project_id: c.project_id
      }));

      const formattedProposals: Conversation[] = (proposalData || []).map((p: any) => ({
        id: `proposal_${p.id}`,
        rawId: p.id,
        type: 'proposal',
        projectTitle: p.projects?.title || 'Unknown Project',
        otherPartyName: role === 'client' ? p.freelancer?.full_name : 'Client',
        status: 'Pre-Hire',
        project_id: p.project_id
      }));

      const all = [...formattedContracts, ...formattedProposals];
      
      if (initialProposal) {
        const initP: any = initialProposal;
        all.push({
          id: `proposal_${initP.id}`,
          rawId: initP.id,
          type: 'proposal',
          projectTitle: initP.projects?.title || 'Unknown Project',
          otherPartyName: initP.freelancer?.full_name || 'Freelancer',
          status: 'Pre-Hire',
          project_id: initP.project_id
        });
      }

      // Sort so most recent or newly opened is first? For now just set state.
      setConversations(all);

      if (initialProposalId && role === 'client') {
        setActiveConversationId(`proposal_${initialProposalId}`);
      } else if (all.length > 0 && !activeConversationId) {
        setActiveConversationId(all[0].id);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (id: string, filterCol: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq(filterCol, id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !uploading) return;
    if (!activeConversationId || !user) return;

    const isContract = activeConversationId.startsWith('contract_');
    const rawId = activeConversationId.replace('contract_', '').replace('proposal_', '');

    try {
      const payload: any = {
        sender_id: user.id,
        content: newMessage.trim(),
      };
      if (isContract) payload.contract_id = rawId;
      else payload.proposal_id = rawId;

      const { error } = await supabase.from('messages').insert(payload);

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId || !user) return;

    const rawId = activeConversationId.replace('contract_', '').replace('proposal_', '');
    const isContract = activeConversationId.startsWith('contract_');

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${rawId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_files')
        .getPublicUrl(filePath);

      const payload: any = {
        sender_id: user.id,
        content: `Sent a file: ${file.name}`,
        file_url: publicUrl,
        file_type: file.type
      };
      if (isContract) payload.contract_id = rawId;
      else payload.proposal_id = rawId;

      const { error: msgError } = await supabase.from('messages').insert(payload);

      if (msgError) throw msgError;
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);

  // Freelancer pre-hire messaging restriction check
  const isFreelancerPreHireEmpty = role === 'freelancer' && activeConv?.type === 'proposal' && messages.length === 0;

  return (
    <div className="h-[calc(100vh-120px)] flex border border-border rounded-xl bg-white overflow-hidden shadow-sm">
      
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r border-border bg-surface flex flex-col">
        <div className="p-4 border-b border-border bg-white flex justify-between items-center">
          <h2 className="font-tenor font-bold text-lg text-text-primary">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-text-secondary text-sm">
              No active conversations yet.
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-4 cursor-pointer border-b border-border transition-colors ${
                  activeConversationId === conv.id ? 'bg-accent/10 border-l-4 border-l-accent' : 'hover:bg-white border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-text-primary truncate">
                    {conv.otherPartyName}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    conv.type === 'proposal' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {conv.type === 'proposal' ? 'Pre-Hire' : 'Contract'}
                  </span>
                </div>
                <div className="text-xs text-text-secondary truncate">
                  {conv.projectTitle}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-text-primary text-lg">
                    {activeConv.otherPartyName}
                  </h3>
                  {activeConv.type === 'contract' && (
                    <span className="text-green-600"><CheckCircle size={16} /></span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">
                  {activeConv.projectTitle}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface/30">
              {messages.length === 0 && activeConv.type === 'proposal' && role === 'client' && (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center text-sm mb-6 border border-blue-100">
                  <p className="font-semibold mb-1">Start the conversation!</p>
                  <p>Send a message to discuss their proposal before hiring.</p>
                </div>
              )}
              {messages.length === 0 && activeConv.type === 'proposal' && role === 'freelancer' && (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg text-center text-sm mb-6 border border-yellow-100 flex flex-col items-center">
                  <Clock size={24} className="mb-2 opacity-70" />
                  <p className="font-semibold mb-1">Waiting for Client</p>
                  <p>You cannot initiate the conversation. Once the client sends a message, you'll be able to reply here.</p>
                </div>
              )}

              {messages.map(msg => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMine ? 'bg-accent text-white rounded-br-sm' : 'bg-white border border-border text-text-primary rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="text-[15px] whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.file_url && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          {msg.file_type?.startsWith('image/') ? (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                              <img src={msg.file_url} alt="Attachment" className="max-w-full h-auto rounded-lg max-h-48 object-cover cursor-zoom-in" />
                            </a>
                          ) : (
                            <a 
                              href={msg.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 text-sm font-medium ${isMine ? 'text-white hover:text-white/80' : 'text-accent hover:text-accent-dim'}`}
                            >
                              <FileText size={16} />
                              View Attachment
                            </a>
                          )}
                        </div>
                      )}
                      
                      <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-white/70' : 'text-text-muted'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <label className="cursor-pointer shrink-0 p-3 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-full transition-colors relative">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={uploading || isFreelancerPreHireEmpty}
                  />
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Paperclip size={20} className={isFreelancerPreHireEmpty ? 'opacity-50' : ''} />
                  )}
                </label>
                
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isFreelancerPreHireEmpty ? "Waiting for client to start conversation..." : "Type a message..."}
                  className="flex-1 max-h-32 min-h-[44px] py-3 px-4 bg-surface border border-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-[15px]"
                  rows={1}
                  disabled={isFreelancerPreHireEmpty}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="shrink-0 h-11 w-11 rounded-full p-0 flex items-center justify-center"
                  disabled={(!newMessage.trim() && !uploading) || uploading || isFreelancerPreHireEmpty}
                >
                  <Send size={18} className="ml-1" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary bg-surface/30">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
              <Send size={24} className="text-text-muted" />
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
