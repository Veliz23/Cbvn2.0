'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import Navbar from '@/components/Navbar'
import { addOfrenda } from '@/lib/firestore'
import { useAuth } from '@/context/AuthContext'
import { DollarSign, Save, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const CLASES = ['Escuela Dominical', 'Club Bíblico', 'Campamento', 'Evento Especial']

export default function OfrendaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    clase: CLASES[0],
    monto: '',
    notas: '',
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.monto || Number(form.monto) <= 0) return toast.error('Ingresa un monto válido')
    setSaving(true)
    try {
      await addOfrenda({
        fecha: form.fecha,
        clase: form.clase,
        monto: Number(form.monto),
        notas: form.notas.trim(),
        creadoPor: user?.email ?? '',
        creadoEn: new Date().toISOString(),
      })
      toast.success('Ofrenda registrada exitosamente')
      router.push('/ofrenda/historial')
    } catch {
      toast.error('Error al registrar la ofrenda')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Registrar Ofrenda</h1>
          <p className="text-gray-500 mt-1">Registra la ofrenda recolectada en clase</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha de clase *</label>
                <input
                  type="date"
                  required
                  value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Tipo de clase</label>
                <select
                  value={form.clase}
                  onChange={e => setForm(f => ({ ...f, clase: e.target.value }))}
                  className="input"
                >
                  {CLASES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Monto recolectado *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.monto}
                  onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                  placeholder="0.00"
                  className="input pl-9 text-lg font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="label">Notas adicionales</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <textarea
                  value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  rows={3}
                  placeholder="Observaciones, detalles especiales..."
                  className="input pl-9 resize-none"
                />
              </div>
            </div>

            {form.monto && Number(form.monto) > 0 && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-700">Se registrará una ofrenda de:</p>
                <p className="text-3xl font-bold text-green-800 mt-1">
                  ${Number(form.monto).toFixed(2)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {form.clase} · {form.fecha}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar ofrenda'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AuthGuard>
  )
}
