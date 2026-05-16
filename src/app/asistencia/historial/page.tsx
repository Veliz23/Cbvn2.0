'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import Navbar from '@/components/Navbar'
import { getAsistencias, deleteAsistencia } from '@/lib/firestore'
import type { Asistencia } from '@/types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronUp, Trash2, PlusCircle, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HistorialAsistenciaPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filtroClase, setFiltroClase] = useState('')

  async function load() {
    setLoading(true)
    const data = await getAsistencias()
    setAsistencias(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string, clase: string) {
    if (!confirm(`¿Eliminar el registro de "${clase}"?`)) return
    try {
      await deleteAsistencia(id)
      toast.success('Registro eliminado')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const clases = [...new Set(asistencias.map(a => a.clase))]
  const filtered = filtroClase ? asistencias.filter(a => a.clase === filtroClase) : asistencias

  const totalPresentes = filtered.reduce((s, a) => s + a.totalPresentes, 0)
  const totalMiembros = filtered.reduce((s, a) => s + a.totalMiembros, 0)

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Asistencia</h1>
            <p className="text-gray-500 mt-1">{asistencias.length} clases registradas</p>
          </div>
          <Link href="/asistencia" className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Nueva clase
          </Link>
        </div>

        {/* Summary */}
        {asistencias.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-3xl font-bold text-blue-600">{asistencias.length}</p>
              <p className="text-sm text-gray-500 mt-1">Clases registradas</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">{totalPresentes}</p>
              <p className="text-sm text-gray-500 mt-1">Asistencias totales</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-purple-600">
                {totalMiembros > 0 ? Math.round((totalPresentes / totalMiembros) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Promedio asistencia</p>
            </div>
          </div>
        )}

        <div className="card">
          {clases.length > 1 && (
            <div className="mb-4">
              <select
                value={filtroClase}
                onChange={e => setFiltroClase(e.target.value)}
                className="input max-w-xs"
              >
                <option value="">Todas las clases</option>
                {clases.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No hay registros de asistencia</p>
              <Link href="/asistencia" className="btn-primary inline-flex items-center gap-2 mt-4">
                <PlusCircle className="w-4 h-4" />
                Registrar primera clase
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(a => {
                const pct = Math.round((a.totalPresentes / a.totalMiembros) * 100)
                const isOpen = expanded === a.id
                return (
                  <div key={a.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpanded(isOpen ? null : a.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{a.clase}</span>
                          <span className="badge-blue">{a.clase}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {format(parseISO(a.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{a.totalPresentes}/{a.totalMiembros}</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {pct}%
                            </span>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Detalle de asistencia</span>
                          </div>
                          <button
                            onClick={() => handleDelete(a.id, a.clase)}
                            className="btn-danger text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar registro
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {a.registros.map(r => (
                            <div
                              key={r.miembroId}
                              className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                r.presente ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full flex-shrink-0 ${r.presente ? 'bg-green-500' : 'bg-red-400'}" />
                              <span className={r.presente ? '' : 'opacity-70'}>{r.nombre}</span>
                              <span className="ml-auto text-xs">{r.presente ? '✓' : '✗'}</span>
                            </div>
                          ))}
                        </div>
                        {a.creadoPor && (
                          <p className="text-xs text-gray-400 mt-3">Registrado por: {a.creadoPor}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
