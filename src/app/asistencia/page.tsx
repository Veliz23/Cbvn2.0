'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import Navbar from '@/components/Navbar'
import { getMiembros, addAsistencia } from '@/lib/firestore'
import { useAuth } from '@/context/AuthContext'
import type { Miembro, RegistroAsistencia } from '@/types'
import { CheckSquare, Square, Users, Save, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const CLASES = ['Escuela Dominical', 'Club Bíblico', 'Campamento', 'Evento Especial']

export default function AsistenciaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [clase, setClase] = useState(CLASES[0])
  const [registros, setRegistros] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getMiembros().then(data => {
      const activos = data.filter(m => m.activo)
      setMiembros(activos)
      const initial: Record<string, boolean> = {}
      activos.forEach(m => { initial[m.id] = false })
      setRegistros(initial)
      setLoading(false)
    })
  }, [])

  function toggle(id: string) {
    setRegistros(r => ({ ...r, [id]: !r[id] }))
  }

  function marcarTodos(presente: boolean) {
    const updated: Record<string, boolean> = {}
    miembros.forEach(m => { updated[m.id] = presente })
    setRegistros(updated)
  }

  const presentes = Object.values(registros).filter(Boolean).length

  async function handleGuardar() {
    if (!fecha) return toast.error('Selecciona la fecha')
    setSaving(true)
    try {
      const regs: RegistroAsistencia[] = miembros.map(m => ({
        miembroId: m.id,
        nombre: m.nombre,
        presente: registros[m.id] ?? false,
      }))
      await addAsistencia({
        fecha,
        clase,
        registros: regs,
        totalPresentes: presentes,
        totalMiembros: miembros.length,
        creadoPor: user?.email ?? '',
        creadoEn: new Date().toISOString(),
      })
      toast.success('Asistencia guardada exitosamente')
      router.push('/asistencia/historial')
    } catch {
      toast.error('Error al guardar la asistencia')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Registro de Asistencia</h1>
          <p className="text-gray-500 mt-1">Marca la asistencia para la clase de hoy</p>
        </div>

        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de clase *</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Tipo de clase</label>
              <select value={clase} onChange={e => setClase(e.target.value)} className="input">
                {CLASES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">Lista de asistencia</h2>
              <span className="badge-blue">{presentes} / {miembros.length}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => marcarTodos(true)}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                Todos
              </button>
              <button
                onClick={() => marcarTodos(false)}
                className="btn-secondary text-sm"
              >
                Ninguno
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : miembros.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              No hay miembros activos. Agrega miembros primero.
            </p>
          ) : (
            <div className="space-y-2">
              {miembros.map(m => {
                const presente = registros[m.id] ?? false
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 text-left transition-all ${
                      presente
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    {presente ? (
                      <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${presente ? 'text-green-800' : 'text-gray-700'}`}>
                        {m.nombre}
                      </p>
                      <p className="text-xs text-gray-500">{m.grupo} · {m.edad} años</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      presente ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {presente ? 'Presente' : 'Ausente'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {miembros.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">{presentes}</span> presentes de{' '}
                <span className="font-semibold">{miembros.length}</span> miembros
                {miembros.length > 0 && (
                  <span className="ml-2 text-gray-400">
                    ({Math.round((presentes / miembros.length) * 100)}%)
                  </span>
                )}
              </div>
              <button
                onClick={handleGuardar}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar asistencia'}
              </button>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
