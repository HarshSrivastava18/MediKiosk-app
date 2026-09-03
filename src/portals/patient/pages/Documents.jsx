import { useState } from 'react'
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FlaskConical,
  Heart,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { patients } from '../../../data/patients'

const patient = patients[0]

// Extended mock documents list
const allDocuments = [
  { id: 1, name: 'ECG Report — Aug 2026',        date: '28 Aug 2026', type: 'ECG',          status: 'processed', size: '1.2 MB', icon: 'ecg' },
  { id: 2, name: 'Blood CBC Report',              date: '25 Apr 2026', type: 'Lab',          status: 'processed', size: '0.8 MB', icon: 'lab' },
  { id: 3, name: 'Amlodipine Prescription',       date: '29 Aug 2026', type: 'Prescription', status: 'processed', size: '0.3 MB', icon: 'rx' },
  { id: 4, name: 'Chest X-Ray PA View',           date: '15 Jul 2026', type: 'Radiology',    status: 'processed', size: '5.4 MB', icon: 'img' },
  { id: 5, name: 'Lipid Profile Report',          date: '10 Mar 2026', type: 'Lab',          status: 'processed', size: '0.6 MB', icon: 'lab' },
  { id: 6, name: 'Echocardiography Report',       date: '02 Sep 2026', type: 'Cardiology',   status: 'pending',   size: '2.1 MB', icon: 'ecg' },
  { id: 7, name: 'Salbutamol Inhaler Rx',         date: '18 Apr 2026', type: 'Prescription', status: 'processed', size: '0.2 MB', icon: 'rx' },
  { id: 8, name: 'Kidney Function Test',          date: '12 Jan 2026', type: 'Lab',          status: 'pending',   size: '0.5 MB', icon: 'lab' },
]

const typeIcon = {
  ecg: { Icon: Heart,      bg: 'bg-red-100',    text: 'text-red-600' },
  lab: { Icon: FlaskConical,bg:'bg-amber-100',  text: 'text-amber-600' },
  rx:  { Icon: FileText,   bg: 'bg-emerald-100',text: 'text-emerald-600' },
  img: { Icon: ImageIcon,  bg: 'bg-violet-100', text: 'text-violet-600' },
}

const typeVariant = {
  ECG: 'danger', Lab: 'warning', Prescription: 'success', Radiology: 'purple', Cardiology: 'blue',
}

export default function Documents() {
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const filtered = allDocuments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">All your health documents — secure &amp; organised</p>
        </div>
        <Button className="gap-2">
          <Upload size={15} />
          Upload Document
        </Button>
      </div>

      {/* Upload dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
        className={[
          'rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-150',
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/30',
        ].join(' ')}
      >
        <Upload size={28} className={`mx-auto mb-3 ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
        <p className="text-sm font-medium text-slate-700">Drag &amp; drop files here</p>
        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DICOM — Max 20 MB per file</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-xs text-slate-400">Accepted types:</span>
          {['Blood Report', 'ECG', 'Prescription', 'X-Ray', 'MRI'].map((t) => (
            <span key={t} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <Button variant="secondary" className="gap-2">
          <Filter size={14} />
          Filter
        </Button>
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const cfg = typeIcon[doc.icon] || typeIcon.rx
          const Icon = cfg.Icon
          return (
            <Card key={doc.id} hoverable>
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={18} className={cfg.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.date} · {doc.size}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={typeVariant[doc.type] || 'default'}>{doc.type}</Badge>
                      <Badge
                        variant={doc.status === 'processed' ? 'success' : 'warning'}
                        dot
                      >
                        {doc.status === 'processed' ? 'Processed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors py-1">
                    <Eye size={13} /> View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium hover:text-slate-700 transition-colors py-1">
                    <Download size={13} /> Download
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-red-500 font-medium hover:text-red-600 transition-colors py-1">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
