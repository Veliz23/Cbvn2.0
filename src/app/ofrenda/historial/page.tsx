'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import Navbar from '@/components/Navbar'
import { getOfrendas, deleteOfrenda, updateOfrenda } from '@/lib/firestore'
import type { Ofrenda } from '@/types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { DollarSign, Trash2, PlusCircle, Pencil, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const CLASES = ['Escuela Dominical', 'Club Bíblico', 'Campamento', 'Evento Especial']

export default function HistorialOfrendaPage() {
  const [ofrendas, setOfrendas] = useState<Ofrenda[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroClase, setFiltroClase] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ monto: '', notas: '', clase: '', fecha: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await getOfrendas()
    setOfrendas(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(o: Ofrenda) {
    if (!confirm(`¿Eliminar ofrenda de $${o.monto} del ${o.fecha}?`)) return
    try {
      await deleteOfrenda(o.id)
      toast.success('Ofrenda eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  function startEdit(o: Ofrenda) {
    setEditingId(o.id)
    setEditForm({ monto: String(o.monto), notas: o.notas, clase: o.clase, fecha: o.fecha })
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    try {
      await updateOfrenda(editingId, {
        monto: Number(editForm.monto),
        notas: editForm.notas,
        clase: editForm.clase,
        fecha: editForm.fecha,
      })
      toast.success('Ofrenda actualizada')
      setEditingId(null)
      load()
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  const clases = [...new Set(ofrendas.map(o => o.clase))]
  const filtered = filtroClase ? ofrendas.filter(o => o.clase === filtroClase) : ofrendas
  const total = filtered.reduce((s, o) => s + o.monto, 0)
  const promedio = filtered.length > 0 ? total / filtered.length : 0

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Ofrenda</h1>
            <p className="text-gray-500 mt-1">{ofrendas.length} registros</p>
          </div>
          <Link href="/ofrenda" className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Nueva ofrenda
          </Link>
        </div>

        {/* Summary */}
        {ofrendas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">${total.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Total recolectado</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-blue-600">{ofrendas.length}</p>
              <p className="text-sm text-gray-500 mt-1">Registros</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-purple-600">${promedio.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Promedio por clase</p>
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
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No hay ofrendas registradas</p>
              <Link href="/ofrenda" className="btn-primary inline-flex items-center gap-2 mt-4">
                <PlusCircle className="w-4 h-4" />
                Registrar primera ofrenda
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(o => (
                <div key={o.id} className="border border-gray-100 rounded-xl p-4">
                  {editingId === o.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Fecha</label>
                          <input
                            type="date"
                            value={editForm.fecha}
                            onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Monto</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.monto}
                            onChange={e => setEditForm(f => ({ ...f, monto: e.target.value }))}
                            className="input"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Clase</label>
                        <select
                          value={editForm.clase}
                          onChange={e => setEditForm(f => ({ ...f, clase: e.target.value }))}
                          className="input"
                        >
                          {CLASES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Notas</label>
                        <input
                          value={editForm.notas}
                          onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(null)} className="btn-secondary flex-1 flex items-center justify-center gap-1">
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                        <button onClick={saveEdit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-1">
                          <Save className="w-4 h-4" />
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-green-50 rounded-lg flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{o.clase}</span>
                          <span className="badge-blue text-xs">{o.clase}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(o.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })}
                        </p>
                        {o.notas && (
                          <p className="text-sm text-gray-600 mt-1 italic">"{o.notas}"</p>
                        )}
                        {o.creadoPor && (
                          <p className="text-xs text-gray-400 mt-1">Por: {o.creadoPor}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-green-600">${o.monto.toFixed(2)}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(o)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(o)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
