# Configuración – CBVN Clases de Niños

## 1. Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un nuevo proyecto (ej. `cbvn-ninos`)
3. En **Authentication** → Iniciar sesión → habilita **Correo/Contraseña**
4. Crea el usuario administrador con email y contraseña
5. En **Firestore Database** → Crear base de datos → modo producción
6. Agrega estas reglas en **Reglas de Firestore**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

7. En **Configuración del proyecto** → Tus apps → Agrega app web → copia la configuración

## 2. Variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto con los valores de Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## 4. Despliegue en Vercel

1. Sube el repositorio a GitHub
2. En [vercel.com](https://vercel.com) → Import Project → selecciona el repo
3. En **Environment Variables** agrega todas las variables de `.env.local`
4. Deploy → ¡Listo!

## Grupos disponibles

Puedes cambiar los grupos en:
- `src/app/miembros/page.tsx` → array `GRUPOS`

## Tipos de clase disponibles

Puedes cambiar los tipos de clase en:
- `src/app/asistencia/page.tsx` → array `CLASES`
- `src/app/ofrenda/page.tsx` → array `CLASES`
