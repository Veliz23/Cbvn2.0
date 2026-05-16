import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Miembro, Asistencia, Ofrenda } from '@/types'

// ── Miembros ──────────────────────────────────────────────
export async function getMiembros(): Promise<Miembro[]> {
  const q = query(collection(db, 'miembros'), orderBy('nombre'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Miembro))
}

export async function addMiembro(data: Omit<Miembro, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'miembros'), data)
  return ref.id
}

export async function updateMiembro(id: string, data: Partial<Miembro>): Promise<void> {
  await updateDoc(doc(db, 'miembros', id), data)
}

export async function deleteMiembro(id: string): Promise<void> {
  await deleteDoc(doc(db, 'miembros', id))
}

// ── Asistencias ───────────────────────────────────────────
export async function getAsistencias(): Promise<Asistencia[]> {
  const q = query(collection(db, 'asistencias'), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Asistencia))
}

export async function getAsistencia(id: string): Promise<Asistencia | null> {
  const snap = await getDoc(doc(db, 'asistencias', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Asistencia
}

export async function addAsistencia(data: Omit<Asistencia, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'asistencias'), {
    ...data,
    creadoEn: new Date().toISOString(),
  })
  return ref.id
}

export async function updateAsistencia(id: string, data: Partial<Asistencia>): Promise<void> {
  await updateDoc(doc(db, 'asistencias', id), data)
}

export async function deleteAsistencia(id: string): Promise<void> {
  await deleteDoc(doc(db, 'asistencias', id))
}

// ── Ofrendas ──────────────────────────────────────────────
export async function getOfrendas(): Promise<Ofrenda[]> {
  const q = query(collection(db, 'ofrendas'), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Ofrenda))
}

export async function addOfrenda(data: Omit<Ofrenda, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'ofrendas'), {
    ...data,
    creadoEn: new Date().toISOString(),
  })
  return ref.id
}

export async function updateOfrenda(id: string, data: Partial<Ofrenda>): Promise<void> {
  await updateDoc(doc(db, 'ofrendas', id), data)
}

export async function deleteOfrenda(id: string): Promise<void> {
  await deleteDoc(doc(db, 'ofrendas', id))
}
