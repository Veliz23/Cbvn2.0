export interface Miembro {
  id: string
  nombre: string
  edad: number
  grupo: string
  activo: boolean
  fechaIngreso: string
}

export interface RegistroAsistencia {
  miembroId: string
  nombre: string
  presente: boolean
}

export interface Asistencia {
  id: string
  fecha: string
  clase: string
  registros: RegistroAsistencia[]
  totalPresentes: number
  totalMiembros: number
  creadoPor: string
  creadoEn: string
}

export interface Ofrenda {
  id: string
  fecha: string
  clase: string
  monto: number
  notas: string
  creadoPor: string
  creadoEn: string
}
