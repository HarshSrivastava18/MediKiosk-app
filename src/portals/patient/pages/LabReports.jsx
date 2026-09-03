import { useState } from 'react'
import { FlaskConical, FileText, Download, Eye, Calendar, Building2, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'

const labReports = [
  {
    id: 'LAB-2026-1049',
    title: 'Complete Blood Count (CBC) & Lipid Profile',
    lab: 'City Hospital Pathology Laboratory',
    date: '25 Apr 2026',
    status: 'Normal',
    parameters: [
      { name: 'Hemoglobin', value: '14.2 g/dL', reference: '13.0 - 17.0 g/dL', status: 'normal' },
      { name: 'Total Cholesterol', value: '188 mg/dL', reference: '< 200 mg/dL', status: 'normal' },
      { name: 'Triglycerides', value: '142 mg/dL', reference: '< 150 mg/dL', status: 'normal' },
      { name: 'HDL Cholesterol', value: '44 mg/dL', reference: '> 40 mg/dL', status: 'normal' },
      { name: 'LDL Cholesterol', value: '115 mg/dL', reference: '< 100 mg/dL', status: 'high' },
    ],
  },
  {
    id: 'LAB-2026-0812',
    title: '12-Lead Electrocardiogram (ECG) Report',
    lab: 'Cardiology Diagnostic Wing',
    date: '28 Aug 2026',
    status: 'Borderline',
    parameters: [
      { name: 'Heart Rate', value: '92 bpm', reference: '60 - 100 bpm', status: 'normal' },
      { name: 'PR Interval', value: '160 ms', reference: '120 - 200 ms', status: 'normal' },
      { name: 'QRS Duration', value: '88 ms', reference: '80 - 120 ms', status: 'normal' },
      { name: 'ST-T Findings', value: 'Mild T-wave inversion in V4-V5', reference: 'Normal upright T-waves', status: 'abnormal' },
    ],
  },
]

export default function LabReports() {
  const [activeReport, setActiveReport] = useState(labReports[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Diagnostic & Lab Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Automated OCR-extracted values and verified diagnostic reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="space-y-3">
          {labReports.map((rep) => {
            const isSelected = activeReport.id === rep.id
            return (
              <div
                key={rep.id}
                onClick={() => setActiveReport(rep)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-50/70 border-violet-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
                    <FlaskConical size={16} />
                  </div>
                  <Badge variant={rep.status === 'Normal' ? 'success' : 'warning'} dot>
                    {rep.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mt-2">{rep.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{rep.lab}</p>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <Calendar size={11} /> {rep.date}
                </p>
              </div>
            )
          })}
        </div>

        {/* Report Detailed Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-slate-50/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{activeReport.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{activeReport.lab} • {activeReport.date}</p>
                </div>
                <Button variant="secondary" size="sm">
                  <Download size={13} /> Original PDF
                </Button>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-2.5">Test Parameter</th>
                    <th className="text-left px-4 py-2.5">Result</th>
                    <th className="text-left px-4 py-2.5">Biological Reference</th>
                    <th className="text-left px-4 py-2.5">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReport.parameters.map((param, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-medium text-slate-800 text-xs">{param.name}</td>
                      <td className="px-4 py-3 font-bold text-xs text-slate-900">{param.value}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{param.reference}</td>
                      <td className="px-4 py-3">
                        {param.status === 'normal' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 size={11} /> Normal
                          </span>
                        ) : param.status === 'high' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            <ArrowUpRight size={11} /> Slightly Elevated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                            <AlertTriangle size={11} /> Review Advised
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
