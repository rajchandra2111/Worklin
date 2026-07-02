import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Paperclip, FileText, CheckCircle, Clock, Check, CheckCheck, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';

type Conversation = {
  id: string; // e.g., 'contract_123' or 'proposal_456'
  rawId: string;
  type: 'contract' | 'proposal';
  projectTitle: string;
  otherPartyName: string;
  otherPartyId: string;
  status: string;
  project_id: string;
  contractData?: any;
  proposalData?: any;
};
export function Messages() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialProposalId = searchParams.get('proposal');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Modals state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [deliveryUploading, setDeliveryUploading] = useState(false);
  
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global Presence (Online Status)
  useEffect(() => {
    if (!user) return;
    const presenceChannel = supabase.channel('online-users');
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const activeIds = new Set(Object.values(state).flatMap((p: any) => p.map((u: any) => u.user_id)));
        setOnlineUsers(activeIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: user.id });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  // Fetch conversations and unread counts
  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUnreadCounts();
    }
  }, [user, initialProposalId]);

  // Global Realtime Subscription for all messages
  useEffect(() => {
    if (!user) return;
    
    // We only need to fetch messages when the active conversation changes
    if (activeConversationId) {
      const isContract = activeConversationId.startsWith('contract_');
      const rawId = activeConversationId.replace('contract_', '').replace('proposal_', '');
      const filterCol = isContract ? 'contract_id' : 'proposal_id';
      fetchMessages(rawId, filterCol);
    }

    const channel = supabase
      .channel(`global-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new;
            
            // Check if this message belongs to the current active conversation
            let belongsToActive = false;
            if (activeConversationId) {
              const isContract = activeConversationId.startsWith('contract_');
              const rawId = activeConversationId.replace('contract_', '').replace('proposal_', '');
              if (isContract && newMsg.contract_id === rawId) belongsToActive = true;
              if (!isContract && newMsg.proposal_id === rawId) belongsToActive = true;
            }

            if (belongsToActive) {
              setMessages((current) => {
                if (current.some(m => m.id === newMsg.id)) return current;
                const optimisticMatch = current.find(m => m.sender_id === newMsg.sender_id && m.content === newMsg.content && m.id.toString().startsWith('temp_'));
                if (optimisticMatch) return current.map(m => m.id === optimisticMatch.id ? newMsg : m);
                return [...current, newMsg];
              });

              if (newMsg.sender_id !== user.id && activeConversationId) {
                markAsRead(activeConversationId);
              }
            } else {
              // Update unread count for the other conversation
              fetchUnreadCounts();
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update read receipts
            setMessages(current => current.map(m => m.id === payload.new.id ? payload.new : m));
            fetchUnreadCounts(); // Refresh unread counts in case they changed
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, user]);

  // Typing indicator subscription (specific to active conversation)
  useEffect(() => {
    if (!activeConversationId || !user) return;
    
    const channel = supabase
      .channel(`typing:${activeConversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== user.id) {
          setTypingUserId(payload.payload.user_id);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [activeConversationId, user]);

  // Auto-scroll and auto-read when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark as read if there are unread messages from the other person
    if (activeConversationId && messages.length > 0) {
      const hasUnread = messages.some(m => !m.read_at && m.sender_id !== user?.id);
      if (hasUnread) {
        markAsRead(activeConversationId);
      }
    }
  }, [messages, activeConversationId]);

  const fetchUnreadCounts = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('contract_id, proposal_id')
        .is('read_at', null)
        .neq('sender_id', user?.id);
        
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach(msg => {
          const key = msg.contract_id ? `contract_${msg.contract_id}` : `proposal_${msg.proposal_id}`;
          counts[key] = (counts[key] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  const markAsRead = async (convId: string) => {
    if (!user) return;
    const isContract = convId.startsWith('contract_');
    const rawId = convId.replace('contract_', '').replace('proposal_', '');
    
    try {
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: rawId,
        p_is_contract: isContract,
        p_user_id: user.id
      });
      
      // Update local states
      setMessages(prev => prev.map(m => (!m.read_at && m.sender_id !== user.id) ? { ...m, read_at: new Date().toISOString() } : m));
      setUnreadCounts(prev => ({ ...prev, [convId]: 0 }));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      // 1. Fetch Contracts
      const contractQuery = supabase
        .from('contracts')
        .select(`
          id, project_id, status, client_id, freelancer_id,
          amount, total_amount, escrow_amount, escrow_funded, work_submitted_at, submission_notes, remaining_balance_paid,
          client:client_profiles(full_name, company_name),
          freelancer:freelancer_profiles(full_name)
        `);
      if (role === 'client') contractQuery.eq('client_id', user?.id);
      else contractQuery.eq('freelancer_id', user?.id);
      const { data: contractData } = await contractQuery;

      // 2. Fetch Projects to avoid PGRST201 join errors
      let projectMap: Record<string, any> = {};
      let myProjectIds: string[] = [];
      if (role === 'client' && user) {
        const { data: myProjects } = await supabase.from('projects').select('id, title, client_id').eq('client_id', user.id);
        if (myProjects) {
          myProjectIds = myProjects.map(p => p.id);
          projectMap = Object.fromEntries(myProjects.map(p => [p.id, p]));
        }
      }

      // 3. Fetch Proposals (with messages)
      const proposalQuery = supabase
        .from('proposals')
        .select(`
          id, project_id, status, freelancer_id, proposed_rate, deposit_required,
          freelancer:freelancer_profiles(full_name),
          messages!inner(id)
        `);
      if (role === 'client') {
        if (myProjectIds.length > 0) proposalQuery.in('project_id', myProjectIds);
        else proposalQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Force empty if no projects
      } else {
        proposalQuery.eq('freelancer_id', user?.id);
      }
      const { data: proposalData, error: propErr } = await proposalQuery;
      if (propErr) console.error("Proposal query error:", propErr);

      // 4. Check for specific initial proposal (Client initiating chat)
      let initialProposal = null;
      if (initialProposalId && role === 'client') {
        const alreadyExists = proposalData?.some(p => p.id === initialProposalId);
        if (!alreadyExists) {
          const { data: single, error: singleErr } = await supabase
            .from('proposals')
            .select(`
              id, project_id, status, freelancer_id, proposed_rate, deposit_required,
              freelancer:freelancer_profiles(full_name)
            `)
            .eq('id', initialProposalId)
            .single();
          if (singleErr) console.error("Initial proposal fetch error:", singleErr);
          if (single) initialProposal = single;
        }
      }

      // 5. If freelancer, fetch project details for their proposals/contracts
      if (role === 'freelancer') {
         const allProjectIds = [
           ...(contractData || []).map(c => c.project_id),
           ...(proposalData || []).map(p => p.project_id)
         ];
         if (allProjectIds.length > 0) {
            const { data: fProjects } = await supabase.from('projects').select('id, title, client_id').in('id', [...new Set(allProjectIds)]);
            if (fProjects) {
               projectMap = Object.fromEntries(fProjects.map(p => [p.id, p]));
            }
         }
      }

      // Format all
      const formattedContracts: Conversation[] = (contractData || []).map((c: any) => ({
        id: `contract_${c.id}`,
        rawId: c.id,
        type: 'contract',
        projectTitle: projectMap[c.project_id]?.title || 'Unknown Project',
        otherPartyName: role === 'client' ? c.freelancer?.full_name : (c.client?.company_name || c.client?.full_name || 'Client'),
        otherPartyId: role === 'client' ? c.freelancer_id : c.client_id,
        status: c.status,
        project_id: c.project_id,
        contractData: c
      }));

      const formattedProposals: Conversation[] = (proposalData || []).map((p: any) => ({
        id: `proposal_${p.id}`,
        rawId: p.id,
        type: 'proposal',
        projectTitle: projectMap[p.project_id]?.title || 'Unknown Project',
        otherPartyName: role === 'client' ? p.freelancer?.full_name : 'Client',
        otherPartyId: role === 'client' ? p.freelancer_id : projectMap[p.project_id]?.client_id,
        status: 'Pre-Hire',
        project_id: p.project_id,
        proposalData: p
      }));

      const all = [...formattedContracts, ...formattedProposals];
      
      if (initialProposal) {
        const initP: any = initialProposal;
        all.push({
          id: `proposal_${initP.id}`,
          rawId: initP.id,
          type: 'proposal',
          projectTitle: projectMap[initP.project_id]?.title || 'Unknown Project',
          otherPartyName: initP.freelancer?.full_name || 'Freelancer',
          otherPartyId: role === 'client' ? initP.freelancer_id : projectMap[initP.project_id]?.client_id,
          status: 'Pre-Hire',
          project_id: initP.project_id,
          proposalData: initP
        });
      }

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

  const handleTyping = () => {
    if (!activeConversationId || !user) return;
    supabase.channel(`messages:${activeConversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !uploading) return;
    if (!activeConversationId || !user) return;

    const isContract = activeConversationId.startsWith('contract_');
    const rawId = activeConversationId.replace('contract_', '').replace('proposal_', '');

    try {
      const text = newMessage.trim();
      setNewMessage(''); // Clear instantly
      
      const tempId = `temp_${Date.now()}`;
      const payload: any = {
        sender_id: user.id,
        content: text,
      };
      if (isContract) payload.contract_id = rawId;
      else payload.proposal_id = rawId;

      // Optimistic UI
      setMessages(prev => [...prev, { ...payload, id: tempId, created_at: new Date().toISOString(), read_at: null }]);

      const { error } = await supabase.from('messages').insert(payload);

      if (error) {
        console.error("Supabase insert error:", error);
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== tempId));
        alert(`Failed to send message: ${error.message}`);
        throw error;
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      if (!err.message) alert('Failed to send message. Please check console.');
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

  const handleHireFreelancer = async () => {
    if (!activeConv || activeConv.type !== 'proposal') return;
    navigate(`/checkout?proposal_id=${activeConv.rawId}&type=deposit`);
  };

  const handleDeliverWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || activeConv.type !== 'contract' || !user) return;
    
    setDeliveryUploading(true);
    try {
      let fileUrl = null;
      let fileType = null;
      
      if (deliveryFile) {
        const fileExt = deliveryFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${activeConv.rawId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('message_attachments')
          .upload(filePath, deliveryFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('message_attachments')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
        fileType = deliveryFile.type;
      }
      
      // Update contract to mark work as submitted
      const { error: contractErr } = await supabase
        .from('contracts')
        .update({
           work_submitted_at: new Date().toISOString(),
           submission_notes: deliveryNotes
        })
        .eq('id', activeConv.rawId);
        
      if (contractErr) throw contractErr;
      
      // Send a delivery_submission message
      const payload: any = {
        sender_id: user.id,
        contract_id: activeConv.rawId,
        message_type: 'delivery_submission',
        content: deliveryNotes || 'Work has been submitted for review.',
        metadata: {
           event: 'work_delivered'
        }
      };
      if (fileUrl) {
         payload.file_url = fileUrl;
         payload.file_type = fileType;
      }
      
      const { error: msgErr } = await supabase.from('messages').insert(payload);
      if (msgErr) throw msgErr;
      
      setShowDeliveryModal(false);
      setDeliveryNotes('');
      setDeliveryFile(null);
      await fetchConversations(); // refresh contract status
    } catch (err) {
      console.error(err);
      alert('Failed to deliver work');
    } finally {
      setDeliveryUploading(false);
    }
  };

  const handleRequestRevision = async (contractId: string) => {
    if (!user) return;
    try {
      const { error: contractErr } = await supabase
        .from('contracts')
        .update({
           work_submitted_at: null, // clear submission
           submission_notes: null
        })
        .eq('id', contractId);
      if (contractErr) throw contractErr;

      // Send system message
      await supabase.from('messages').insert({
        sender_id: user.id,
        contract_id: contractId,
        message_type: 'system_event',
        content: 'Revision requested by client.',
        metadata: { event: 'revision_requested' }
      });
      
      await fetchConversations();
    } catch (err) {
      console.error(err);
      alert('Failed to request revision');
    }
  };

  const handleApproveAndPay = (contractId: string) => {
     navigate(`/checkout?contract_id=${contractId}&type=final`);
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);
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
            conversations.map(conv => {
              const unread = unreadCounts[conv.id] || 0;
              const isOnline = onlineUsers.has(conv.otherPartyId);
              
              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-4 cursor-pointer border-b border-border transition-colors relative ${
                    activeConversationId === conv.id ? 'bg-accent/10 border-l-4 border-l-accent' : 'hover:bg-white border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-text-primary flex items-center gap-2 truncate">
                      <div className="relative">
                        {conv.otherPartyName}
                        {isOnline && (
                          <div className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unread}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        conv.type === 'proposal' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {conv.type === 'proposal' ? 'Pre-Hire' : 'Contract'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary truncate pr-8">
                    {conv.projectTitle}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                    {activeConv.otherPartyName}
                    {onlineUsers.has(activeConv.otherPartyId) && (
                      <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Online</span>
                    )}
                  </h3>
                  {activeConv.type === 'contract' && (
                    <span className="text-green-600"><CheckCircle size={16} /></span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {activeConv.projectTitle}
                </p>
              </div>
              {role === 'client' && activeConv.type === 'proposal' && activeConv.status !== 'accepted' && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-accent">€{activeConv.proposalData?.deposit_required} Deposit</div>
                    <div className="text-xs text-text-secondary">Quote: €{activeConv.proposalData?.proposed_rate}</div>
                  </div>
                  <Button 
                    onClick={handleHireFreelancer}
                    className="bg-accent text-white hover:bg-accent-hover"
                  >
                    Hire & Fund Escrow
                  </Button>
                </div>
              )}
              {role === 'freelancer' && activeConv.type === 'contract' && activeConv.contractData?.status === 'active' && activeConv.contractData?.escrow_status === 'funded' && !activeConv.contractData?.work_submitted_at && (
                 <Button onClick={() => setShowDeliveryModal(true)} className="bg-accent text-white">
                   Deliver Work
                 </Button>
              )}
              {activeConv.type === 'contract' && activeConv.contractData?.status === 'active' && activeConv.contractData?.work_submitted_at && (
                 <div className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full font-medium text-sm border border-yellow-200">
                   In Review
                 </div>
              )}
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

                if (msg.message_type === 'system_event') {
                   return (
                     <div key={msg.id} className="flex justify-center my-4">
                       <div className="bg-surface text-text-secondary px-4 py-2 rounded-full text-xs font-medium border border-border shadow-sm flex items-center gap-2">
                         <CheckCircle size={14} className="text-accent" />
                         {msg.content}
                       </div>
                     </div>
                   );
                }

                if (msg.message_type === 'delivery_submission') {
                   return (
                     <div key={msg.id} className="my-6 mx-auto w-full max-w-lg border border-accent/20 rounded-xl overflow-hidden bg-white shadow-sm">
                       <div className="bg-accent/5 p-4 border-b border-accent/10 flex items-center gap-3">
                         <div className="bg-accent text-white p-2 rounded-lg">
                           <FileText size={20} />
                         </div>
                         <div>
                           <h4 className="font-bold text-accent-dark">Work Delivery Submitted</h4>
                           <p className="text-xs text-text-secondary">{new Date(msg.created_at).toLocaleString()}</p>
                         </div>
                       </div>
                       <div className="p-4">
                         <p className="text-text-primary whitespace-pre-wrap mb-4">{msg.content}</p>
                         
                         {msg.file_url && (
                           <div className="bg-surface p-3 rounded-lg flex items-center justify-between mb-4 border border-border">
                             <div className="flex items-center gap-2 text-sm font-medium">
                               <Paperclip size={16} />
                               Attached File
                             </div>
                             <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm font-medium">
                               Download
                             </a>
                           </div>
                         )}
                         
                         {!isMine && role === 'client' && activeConv.type === 'contract' && activeConv.contractData?.status === 'active' && activeConv.contractData?.work_submitted_at && (
                           <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                             <Button 
                               variant="outline" 
                               className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                               onClick={() => handleRequestRevision(activeConv.rawId)}
                             >
                               Request Revision
                             </Button>
                             <Button 
                               className="flex-1 bg-green-600 hover:bg-green-700 text-white border-transparent"
                               onClick={() => handleApproveAndPay(activeConv.rawId)}
                             >
                               Approve & Pay
                             </Button>
                           </div>
                         )}
                       </div>
                     </div>
                   );
                }

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
                      
                      <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMine ? 'text-white/80' : 'text-text-muted'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMine && (
                          <span className="ml-0.5">
                            {msg.read_at ? <CheckCheck size={14} className="text-blue-200" /> : <Check size={14} className="opacity-70" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUserId && typingUserId === activeConv.otherPartyId && (
              <div className="absolute bottom-20 left-6 text-xs text-text-secondary bg-white px-3 py-1.5 rounded-full shadow-sm border border-border flex items-center gap-2 z-10">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                {activeConv.otherPartyName} is typing...
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-white relative z-20">
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
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
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
                
                <button 
                  type="submit" 
                  className="shrink-0 h-11 w-11 rounded-full bg-accent text-white hover:bg-accent-light flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={(!newMessage.trim() && !uploading) || uploading || isFreelancerPreHireEmpty}
                >
                  <Send size={18} />
                </button>
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
      
      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold font-tenor mb-4">Deliver Work</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Submit your final work or milestone for the client to review. They will be notified immediately.
            </p>
            
            <form onSubmit={handleDeliverWork}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">Delivery Notes / Message</label>
                <textarea 
                  className="w-full rounded-lg border-border focus:border-accent focus:ring-accent text-sm"
                  rows={4}
                  required
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Describe what you are submitting..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">Attach Files (Optional)</label>
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-surface hover:bg-surface-dark transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-text-muted" />
                            <p className="mb-2 text-sm text-text-secondary">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            {deliveryFile && <p className="text-xs text-accent font-medium mt-2">{deliveryFile.name}</p>}
                        </div>
                        <input type="file" className="hidden" onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)} />
                    </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowDeliveryModal(false)}>Cancel</Button>
                <Button type="submit" disabled={deliveryUploading || !deliveryNotes.trim()}>
                  {deliveryUploading ? 'Submitting...' : 'Submit Work'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
