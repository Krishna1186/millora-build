import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { MessageCircle, X, Send, Phone, Mail, BookOpen, Search, User, AlertCircle } from "lucide-react";
const Support = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMode, setChatMode] = useState<'faq' | 'ticket' | 'chat'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    issueType: '',
    description: ''
  });
  const faqs = [{
    question: "How do I upload a project?",
    answer: "Go to your dashboard and click 'Upload Project'. You can upload CAD files like .dwg, .dxf, .step, .stl and more."
  }, {
    question: "How long does manufacturing take?",
    answer: "Manufacturing time varies by project complexity and manufacturer. Most projects take 5-15 business days."
  }, {
    question: "What file formats do you support?",
    answer: "We support CAD files including .dwg, .dxf, .step, .stl, .obj, .3mf, and many others."
  }, {
    question: "How do I track my order?",
    answer: "You can track your order status in your dashboard under 'My Projects' section."
  }, {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards, PayPal, and bank transfers through our secure escrow system."
  }];
  const filteredFaqs = faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Ticket submitted:', ticketForm);
    // Reset form
    setTicketForm({
      name: '',
      email: '',
      issueType: '',
      description: ''
    });
    setChatMode('chat');
  };
  return <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get support, find answers, or chat with our team
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-800">
                  <MessageCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get instant help from our support team using the chat widget below.
                </p>
                <Badge variant="secondary">Available 24/7</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-800">
                  <Mail className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Send us a detailed message for complex issues.
                </p>
                <a href="mailto:support@millora.com" className="text-primary hover:underline">
                  support@millora.com
                </a>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-800">
                  <Phone className="w-8 h-8 text-yellow-600 " />
                </div>
                <CardTitle>Phone Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Call us for urgent matters during business hours.
                </p>
                <p className="font-semibold">+91 9876543210</p>
              </CardContent>
            </Card>
          </div>

          {/* Knowledge Base Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Knowledge Base
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-yellow-600" />
                    <CardTitle>Getting Started Guide</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Learn how to upload your first project and find manufacturers.
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <CardTitle>Troubleshooting</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Common issues and solutions for project uploads and orders.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      {isChatOpen && <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border z-50">
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Millora Support</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex border-b">
            <Button variant={chatMode === 'faq' ? 'default' : 'ghost'} size="sm" onClick={() => setChatMode('faq')} className="flex-1 rounded-none">
              FAQs
            </Button>
            <Button variant={chatMode === 'ticket' ? 'default' : 'ghost'} size="sm" onClick={() => setChatMode('ticket')} className="flex-1 rounded-none">
              Submit Ticket
            </Button>
            <Button variant={chatMode === 'chat' ? 'default' : 'ghost'} size="sm" onClick={() => setChatMode('chat')} className="flex-1 rounded-none">
              Live Chat
            </Button>
          </div>

          <div className="p-4 h-[400px] overflow-y-auto">
            {chatMode === 'faq' && <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search FAQs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="space-y-3">
                  {filteredFaqs.map((faq, index) => <Card key={index} className="p-3">
                      <h4 className="font-semibold text-sm mb-2">{faq.question}</h4>
                      <p className="text-xs text-gray-600">{faq.answer}</p>
                    </Card>)}
                </div>
              </div>}

            {chatMode === 'ticket' && <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <Input placeholder="Your Name" value={ticketForm.name} onChange={e => setTicketForm({
              ...ticketForm,
              name: e.target.value
            })} required />
                </div>
                <div>
                  <Input type="email" placeholder="Your Email" value={ticketForm.email} onChange={e => setTicketForm({
              ...ticketForm,
              email: e.target.value
            })} required />
                </div>
                <div>
                  <Select value={ticketForm.issueType} onValueChange={value => setTicketForm({
              ...ticketForm,
              issueType: value
            })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Issue Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="project">Project Support</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Textarea placeholder="Describe your issue..." value={ticketForm.description} onChange={e => setTicketForm({
              ...ticketForm,
              description: e.target.value
            })} required rows={4} />
                </div>
                <Button type="submit" className="w-full">
                  Submit Ticket
                </Button>
              </form>}

            {chatMode === 'chat' && <div className="space-y-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm">
                    👋 Hello! How can we help you today?
                  </p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    💬 Chat with live agent
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="mailto:support@millora.com">
                      📧 Send email to support
                    </a>
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  <Input placeholder="Type your message..." className="flex-1" />
                  <Button size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>}
          </div>
        </div>}

      {/* Chat Toggle Button */}
      {!isChatOpen && <Button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50">
          <MessageCircle className="w-6 h-6" />
        </Button>}

      <Footer />
    </div>;
};
export default Support;