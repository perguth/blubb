// routes/dashboard/index.tsx
import { redirect } from '@/utils/http.ts'
import { Handlers } from '$fresh/server.ts'

export const handler: Handlers = {
  GET() {
    return redirect('/dashboard/stats')
  },
}
