import { useState } from 'react'
import { MessageSquare, Send, User, Search, Paperclip, CheckCheck, Clock, Building2 } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Avatar from '../../../components/ui/Avatar'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const conversations = [
  {
    id: 1,
    name: 'Dr. Patel (Neurology)',
    hospital: 'City Hospital - Lucknow',
    lastMsg: 'Reviewed the MRI scans. No signs of intracranial pathology.',
    time: '11:45 AM',
    unread: 1,
    online: true,
  },
  {
    id: 2,
    name: 'Dr. Mehta (Emergency)',
    hospital: 'City Hospital - Lucknow',
    lastMsg: 'Patient Rahul Kumar has arrived for priority triage.',
    time: '10:12 AM',
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: 'Pathology Lab Wing',
    hospital: 'Diagnostic Center',
    lastMsg: 'Troponin-I and Cardiac Enzyme panel expedited.',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
]

export default function Messages() {
  const [activeChat, setActiveChat] = useState(conversations[0])
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Patel (Neurology)', text: 'Hello Dr. Sharma, I saw your referral for patient with dizzy spells and chest discomfort.', time: '11:30 AM', isMe: false },
    { id: 2, sender: 'You', text: 'Hi Dr. Patel. Yes, ruled out primary ischemic events on resting ECG. Need neuro clearance.', time: '11:35 AM', isMe: true },
    { id: 3, sender: 'Dr. Patel (Neurology)', text: 'Reviewed the MRI scans. No signs of intracranial pathology.', time: '11:45 AM', isMe: false },
  ])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    setMessages([
      ...messages,
      { id: Date.now(), sender: 'You', text: inputText, time: 'Just now', isMe: true },
    ])
    setInputText('')
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8.5rem)] flex flex-col">
      <div>
        <h1 className="page-title">Inter-Hospital & Department Consultations</h1>
        <p className="text-sm text-slate-500">Secure clinical chat between referring physicians, specialists, and diagnostics</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 bg-white rounded-card shadow-card border border-slate-200 overflow-hidden">
        {/* Left List */}
        <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50/40">
          <div className="p-3 border-b border-slate-200">
            <Input icon={Search} placeholder="Search clinician or dept..." className="text-xs py-1.5" />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  activeChat.id === chat.id ? 'bg-blue-50/80 border-l-4 border-l-brand-600' : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    {chat.name.charAt(4) || 'D'}
                  </div>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800 truncate">{chat.name}</p>
                    <span className="text-[10px] text-slate-400">{chat.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{chat.hospital}</p>
                  <p className="text-xs text-slate-600 truncate mt-1">{chat.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Conversation Right */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {activeChat.name.charAt(4) || 'D'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{activeChat.name}</h4>
                <p className="text-[11px] text-slate-500">{activeChat.hospital}</p>
              </div>
            </div>
            <Badge variant="success" dot>Secured Channel</Badge>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs shadow-sm ${
                    msg.isMe
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <Paperclip size={18} />
            </button>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type clinical inquiry or note..."
              className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" variant="primary" size="sm" className="px-4">
              <Send size={14} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
