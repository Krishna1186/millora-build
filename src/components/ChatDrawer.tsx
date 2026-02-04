
import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  project_id: string;
  bid_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

interface Conversation {
  user_id: string;
  user_name: string;
  user_email: string;
  project_id: string;
  project_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
      setupRealtimeSubscription();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all chat messages where user is sender or receiver
      const { data: messageData, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!sender_id (
            full_name,
            company_name
          ),
          projects (
            id,
            project_name,
            user_id
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner and project
      const conversationMap = new Map<string, Conversation>();
      
      for (const message of messageData || []) {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const conversationKey = `${partnerId}_${message.project_id}`;
        
        if (!conversationMap.has(conversationKey)) {
          const senderProfile = message.sender;
          const partnerName = senderProfile?.company_name || senderProfile?.full_name || 'Unknown User';

          conversationMap.set(conversationKey, {
            user_id: partnerId,
            user_name: partnerName,
            user_email: '',
            project_id: message.project_id,
            project_name: message.projects?.project_name || 'Unknown Project',
            last_message: message.message,
            last_message_time: message.created_at,
            unread_count: 0
          });
        }
      }

      // Count unread messages for each conversation
      for (const [key, conversation] of conversationMap) {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', conversation.project_id)
          .eq('sender_id', conversation.user_id)
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        conversation.unread_count = count || 0;
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error loading conversations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversation: Conversation) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', conversation.project_id)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversation.user_id}),and(sender_id.eq.${conversation.user_id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      
      // Mark messages as read
      await markMessagesAsRead(conversation);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const markMessagesAsRead = async (conversation: Conversation) => {
    if (!user) return;

    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('project_id', conversation.project_id)
        .eq('sender_id', conversation.user_id)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      // Update local conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.user_id === conversation.user_id && conv.project_id === conversation.project_id
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          project_id: selectedConversation.project_id,
          sender_id: user.id,
          receiver_id: selectedConversation.user_id,
          message: newMessage.trim(),
          bid_id: null,
          is_read: false
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
         (payload) => {
           const newMessage = payload.new as Message;
           
           // If message is for current conversation, add to messages
           if (selectedConversation && 
               newMessage.project_id === selectedConversation.project_id &&
               ((newMessage.sender_id === user.id && newMessage.receiver_id === selectedConversation.user_id) ||
                (newMessage.sender_id === selectedConversation.user_id && newMessage.receiver_id === user.id))) {
             setMessages(prev => [...prev, newMessage]);
           }

          // Refresh conversations to update last message and counts
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-96 bg-background border-l shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Messages</h2>
              {totalUnreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalUnreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!selectedConversation ? (
            /* Conversations List */
            <div className="flex-1 overflow-hidden">
              <div className="p-3 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Your conversations</span>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground text-sm">No conversations yet</p>
                    <p className="text-muted-foreground/70 text-xs mt-1">
                      Messages will appear here when customers contact you
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {conversations.map((conversation) => (
                      <Card 
                        key={`${conversation.user_id}_${conversation.project_id}`}
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-0 shadow-none"
                        onClick={() => selectConversation(conversation)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm truncate flex-1">
                              {conversation.user_name}
                            </div>
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="ml-2 h-5 text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1 truncate">
                            Project: {conversation.project_name}
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-xs text-muted-foreground truncate flex-1 mr-2">
                              {conversation.last_message}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                              <Clock className="h-3 w-3" />
                              {formatTime(conversation.last_message_time)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            /* Chat View */
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-3 border-b bg-muted/30">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedConversation(null)}
                  className="mb-2 -ml-2"
                >
                  ← Back to conversations
                </Button>
                <div className="font-medium text-sm">{selectedConversation.user_name}</div>
                <div className="text-xs text-muted-foreground">
                  Project: {selectedConversation.project_name}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div>{message.message}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={sending || !newMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatDrawer;
