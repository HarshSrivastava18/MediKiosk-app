import { useState } from 'react'
import { Plus, Search, Star, Phone, ChevronDown } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import { doctors } from '../../../data/doctors'
import { hospitalDepartments } from '../../../data/hospitals'

// Extend with more mock doctors for a fuller grid
const allDoctors = [
  ...doctors,
  {
    id: 'DOC-005', name: 'Dr. Verma',   specialty: 'Cardiology',      department: 'Cardiology',
    branch: 'Lucknow Branch', phone: '9812300005', patients: 31, rating: 4.5, experience: 10, todayCases: 7, avatar: null,
  },
  {
    id: 'DOC-006', name: 'Dr. Sinha',   specialty: 'Neurology',        department: 'Neurology',
    branch: 'Lucknow Branch', phone: '9812300006', patients: 22, rating: 4.3, experience: 6,  todayCases: 4, avatar: null,
  },
  {
    id: 'DOC-007', name: 'Dr. Kapoor',  specialty: 'ENT',              department: 'ENT',
    branch: 'Kanpur Branch',  phone: '9812300007', patients: 18, rating: 4.7, experience: 9,  todayCases: 5, avatar: null,
  },
  {
    id: 'DOC-008', name: 'Dr. Mishra',  specialty: 'Pediatrics',       department: 'Pediatrics',
    branch: 'Kanpur Branch',  phone: '9812300008', patients: 44, rating: 4.9, experience: 18, todayCases: 11, avatar: null,
  },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating}</span>
    </div>
  )
}

function DoctorCard({ doctor }) {
  return (
    <Card hoverable className="flex flex-col">
      <CardBody className="flex flex-col items-center text-center pb-4">
        <Avatar name={doctor.name} size="lg" className="mb-3 mt-1" />
        <p className="font-semibold text-slate-800 text-sm">{doctor.name}</p>
        <p className="text-xs text-emerald-600 font-medium mt-0.5">{doctor.specialty}</p>
        <p className="text-xs text-slate-400 mt-0.5">{doctor.department} · {doctor.branch.replace(' Branch', '')}</p>

        <StarRating rating={doctor.rating} />

        <div className="w-full mt-3 grid grid-cols-3 gap-1 text-center">
          <div className="bg-slate-50 rounded-lg py-1.5">
            <p className="text-sm font-bold text-slate-700">{doctor.patients}</p>
            <p className="text-[10px] text-slate-400">Patients</p>
          </div>
          <div className="bg-slate-50 rounded-lg py-1.5">
            <p className="text-sm font-bold text-slate-700">{doctor.experience}y</p>
            <p className="text-[10px] text-slate-400">Exp.</p>
          </div>
          <div className="bg-emerald-50 rounded-lg py-1.5">
            <p className="text-sm font-bold text-emerald-700">{doctor.todayCases}</p>
            <p className="text-[10px] text-emerald-500">Today</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
          <Phone size={11} />
          <span>{doctor.phone}</span>
        </div>
      </CardBody>
    </Card>
  )
}

const departments = ['All Departments', ...new Set(allDoctors.map(d => d.department))]

export default function Doctors() {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('All Departments')

  const filtered = allDoctors.filter(d => {
    const searchMatch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
    const deptMatch = selectedDept === 'All Departments' || d.department === selectedDept
    return searchMatch && deptMatch
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Doctors</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your medical team across all branches</p>
        </div>
        <Button variant="success">
          <Plus size={16} />
          Add Doctor
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors, specialties..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <Badge variant="default">{filtered.length} doctors</Badge>
      </div>

      {/* Doctor cards grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(doc => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">No doctors found matching your search.</p>
        </div>
      )}
    </div>
  )
}
