'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Navbar from '@/components/Navbar'
import { getMiembros, addMiembro, updateMiembro, deleteMiembro } from '@/lib/firestore'
import type { Miembro } from '@/types'
import { Plus, Pencil, Trash2, UserCheck, UserX, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'

const GRUPOS = ['Caminantes', 'Exploradores', 'Aventureros', 'Conquistadores']

const emptyForm = {
  nombre: '',
  edad: '',
  grupo: GRUPOS[0],
  activo: true,
  fechaIngreso: new Date().toISOString().split('T')[0],
}

export default function MiembrosPage() {
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Miembro | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await getMiembros()
    setMiembros(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(m: Miembro) {
    setEditing(m)
    setForm({ nombre: m.nombre, edad: String(m.edad), grupo: m.grupo, activo: m.activo, fechaIngreso: m.fechaIngreso })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre.trim()) return toast.error('El nombre es obligatorio')
    setSaving(true)
    try {
      const data = {
        nombre: form.nombre.trim(),
        edad: Number(form.edad),
        grupo: form.grupo,
        activo: form.activo,
        fechaIngreso: form.fechaIngreso,
      }
      if (editing) {
        await updateMiembro(editing.id, data)
        toast.success('Miembro actualizado')
      } else {
        await addMiembro(data)
        toast.success('Miembro agregado')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(m: Miembro) {
    if (!confirm(`¿Eliminar a ${m.nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await deleteMiembro(m.id)
      toast.success('Miembro eliminado')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  async function toggleActivo(m: Miembro) {
    await updateMiembro(m.id, { activo: !m.activo })
    toast.success(m.activo ? 'Marcado como inactivo' : 'Marcado como activo')
    load()
  }

  const filtered = miembros.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.grupo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Miembros</h1>
            <p className="text-gray-500 mt-1">{miembros.filter(m => m.activo).length} activos de {miembros.length} total</p>
          </div>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar miembro
          </button>
        </div>

        <div className="card">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o grupo..."
              className="input pl-9"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No hay miembros registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Nombre</th>
                    <th className="pb-3 font-medium">Grupo</th>
                    <th className="pb-3 font-medium text-center">Edad</th>
                    <th className="pb-3 font-medium text-center">Estado</th>
                    <th className="pb-3 font-medium">Ingreso</th>
                    <th className="pb-3 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{m.nombre}</td>
                      <td className="py-3">
                        <span className="badge-blue">{m.grupo}</span>
                      </td>
                      <td className="py-3 text-center text-gray-600">{m.edad}</td>
                      <td className="py-3 text-center">
                        {m.activo ? (
                          <span className="badge-green">Activo</span>
                        ) : (
                          <span className="badge-red">Inactivo</span>
                        )}
                      </td>
                      <td className="py-3 text-gray-500">{m.fechaIngreso}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => toggleActivo(m)}
                            title={m.activo ? 'Desactivar' : 'Activar'}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                          >
                            {m.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-lg">{editing ? 'Editar miembro' : 'Nuevo miembro'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Nombre completo *</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="input"
                  placeholder="Nombre del niño"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Edad</label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={form.edad}
                    onChange={e => setForm(f => ({ ...f, edad: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Grupo</label>
                  <select
                    value={form.grupo}
                    onChange={e => setForm(f => ({ ...f, grupo: e.target.value }))}
                    className="input"
                  >
                    {GRUPOS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Fecha de ingreso</label>
                <input
                  type="date"
                  value={form.fechaIngreso}
                  onChange={e => setForm(f => ({ ...f, fechaIngreso: e.target.value }))}
                  className="input"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activo"
                  checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">Miembro activo</label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
