'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import Navbar from '@/components/Navbar'
import { getMiembros } from '@/lib/firestore'
import { getAsistencias } from '@/lib/firestore'
import { getOfrendas } from '@/lib/firestore'
import type { Miembro, Asistencia, Ofrenda } from '@/types'
import {
  Users,
  CheckSquare,
  DollarSign,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [ofrendas, setOfrendas] = useState<Ofrenda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMiembros(), getAsistencias(), getOfrendas()]).then(
      ([m, a, o]) => {
        setMiembros(m)
        setAsistencias(a)
        setOfrendas(o)
        setLoading(false)
      }
    )
  }, [])

  const miembrosActivos = miembros.filter(m => m.activo).length
  const ultimaAsistencia = asistencias[0]
  const totalOfrenda = ofrendas.reduce((s, o) => s + o.monto, 0)
  const promedioAsistencia =
    asistencias.length > 0
      ? Math.round(
          asistencias.reduce((s, a) => s + (a.totalPresentes / a.totalMiembros) * 100, 0) /
            asistencias.length
        )
      : 0

  const stats = [
    {
      label: 'Miembros activos',
      value: miembrosActivos,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      href: '/miembros',
    },
    {
      label: 'Clases registradas',
      value: asistencias.length,
      icon: CheckSquare,
      color: 'bg-green-50 text-green-600',
      href: '/asistencia/historial',
    },
    {
      label: 'Ofrenda total',
      value: `$${totalOfrenda.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-50 text-yellow-600',
      href: '/ofrenda/historial',
    },
    {
      label: 'Promedio asistencia',
      value: `${promedioAsistencia}%`,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      href: '/asistencia/historial',
    },
  ]

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen general de clases de niños</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map(s => (
                <Link key={s.label} href={s.href} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </Link>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  Asistencia
                </h2>
                {ultimaAsistencia ? (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Última clase</p>
                    <p className="font-medium">{ultimaAsistencia.clase}</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(ultimaAsistencia.fecha), "d 'de' MMMM yyyy", { locale: es })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge-green">
                        {ultimaAsistencia.totalPresentes} presentes
                      </span>
                      <span className="text-xs text-gray-400">
                        de {ultimaAsistencia.totalMiembros}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">Aún no hay registros</p>
                )}
                <div className="flex gap-2">
                  <Link href="/asistencia" className="btn-primary flex items-center gap-1.5 text-sm">
                    <PlusCircle className="w-4 h-4" />
                    Nueva clase
                  </Link>
                  <Link href="/asistencia/historial" className="btn-secondary text-sm">
                    Ver historial
                  </Link>
                </div>
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  Ofrenda
                </h2>
                {ofrendas.length > 0 ? (
                  <div className="mb-4">
                    <div className="space-y-2">
                      {ofrendas.slice(0, 3).map(o => (
                        <div key={o.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{o.clase}</p>
                            <p className="text-xs text-gray-500">
                              {format(parseISO(o.fecha), "d MMM yyyy", { locale: es })}
                            </p>
                          </div>
                          <span className="font-semibold text-green-600">${o.monto.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">Aún no hay registros</p>
                )}
                <div className="flex gap-2">
                  <Link href="/ofrenda" className="btn-primary flex items-center gap-1.5 text-sm">
                    <PlusCircle className="w-4 h-4" />
                    Nueva ofrenda
                  </Link>
                  <Link href="/ofrenda/historial" className="btn-secondary text-sm">
                    Ver historial
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent attendance */}
            {asistencias.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Últimas clases
                  </h2>
                  <Link href="/asistencia/historial" className="text-sm text-blue-600 hover:underline">
                    Ver todo
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-medium">Fecha</th>
                        <th className="pb-2 font-medium">Clase</th>
                        <th className="pb-2 font-medium text-center">Presentes</th>
                        <th className="pb-2 font-medium text-center">Total</th>
                        <th className="pb-2 font-medium text-center">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {asistencias.slice(0, 5).map(a => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="py-2.5 text-gray-600">
                            {format(parseISO(a.fecha), "d MMM yyyy", { locale: es })}
                          </td>
                          <td className="py-2.5 font-medium">{a.clase}</td>
                          <td className="py-2.5 text-center">
                            <span className="badge-green">{a.totalPresentes}</span>
                          </td>
                          <td className="py-2.5 text-center text-gray-500">{a.totalMiembros}</td>
                          <td className="py-2.5 text-center font-medium">
                            {Math.round((a.totalPresentes / a.totalMiembros) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </AuthGuard>
  )
}
