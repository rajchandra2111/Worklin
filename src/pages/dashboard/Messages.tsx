import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Paperclip, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Messages() {
  const { user, role } = useAuth();
  
  const [contracts, setContracts] = useState<any[]>([]);
  const [activeContractId, setActiveContractId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch contracts
  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  // Fetch messages and subscribe to real-time updates when active contract changes
  useEffect(() => {
    if (activeContractId) {
      fetchMessages(activeContractId);

      const channel = supabase
        .channel(`messages:${activeContractId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `contract_id=eq.${activeContractId}`,
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
  }, [activeContractId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContracts = async () => {
    try {
      // We need to fetch contracts and join with projects to get the title.
      // We also need to join the other party's profile to get their name.
      const query = supabase
        .from('contracts')
        .select(`
          id,
          project_id,
          client_id,
          freelancer_id,
          status,
          projects(title),
          client:client_profiles(full_name, company_name),
          freelancer:freelancer_profiles(full_name)
        `);
      
      if (role === 'client') {
        query.eq('client_id', user?.id);
      } else {
        query.eq('freelancer_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setContracts(data || []);
      if (data && data.length > 0 && !activeContractId) {
        setActiveContractId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
    }
  };

  const fetchMessages = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('contract_id', contractId)
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
    if (!activeContractId || !user) return;

    try {
      const { error } = await supabase.from('messages').insert({
        contract_id: activeContractId,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeContractId || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${activeContractId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_files')
        .getPublicUrl(filePath);

      // Send a message with the file URL
      const { error: msgError } = await supabase.from('messages').insert({
        contract_id: activeContractId,
        sender_id: user.id,
        content: `Sent a file: ${file.name}`,
        file_url: publicUrl,
        file_type: file.type
      });

      if (msgError) throw msgError;
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const getOtherPartyName = (contract: any) => {
    if (role === 'client') {
      return contract.freelancer?.full_name || 'Freelancer';
    } else {
      return contract.client?.company_name || contract.client?.full_name || 'Client';
    }
  };

  const activeContract = contracts.find(c => c.id === activeContractId);

  return (
    <div className="h-[calc(100vh-120px)] flex border border-border rounded-xl bg-white overflow-hidden shadow-sm">
      
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r border-border bg-surface flex flex-col">
        <div className="p-4 border-b border-border bg-white">
          <h2 className="font-tenor font-bold text-lg text-text-primary">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contracts.length === 0 ? (
            <div className="p-6 text-center text-text-secondary text-sm">
              No active conversations yet.
            </div>
          ) : (
            contracts.map(contract => (
              <div 
                key={contract.id}
                onClick={() => setActiveContractId(contract.id)}
                className={`p-4 cursor-pointer border-b border-border transition-colors ${
                  activeContractId === contract.id ? 'bg-accent/10 border-l-4 border-l-accent' : 'hover:bg-white border-l-4 border-l-transparent'
                }`}
              >
                <div className="font-semibold text-text-primary truncate">
                  {getOtherPartyName(contract)}
                </div>
                <div className="text-xs text-text-secondary truncate mt-1">
                  Project: {contract.projects?.title}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeContract ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-primary text-lg">
                  {getOtherPartyName(activeContract)}
                </h3>
                <p className="text-xs text-text-secondary">
                  {activeContract.projects?.title}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                activeContract.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-surface text-text-secondary border-border'
              }`}>
                {activeContract.status}
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface/30">
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
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Paperclip size={20} />
                  )}
                </label>
                
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-[44px] py-3 px-4 bg-surface border border-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-[15px]"
                  rows={1}
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
                  disabled={(!newMessage.trim() && !uploading) || uploading}
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
