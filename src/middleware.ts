import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Apenas rotas baseadas em sistema são abertas
  const isPublicPath = path === '/login' || path.startsWith('/api/login');

  const token = request.cookies.get('auth_token')?.value || '';

  // Sem token = Bloquedo (exceto API ou Login)
  if (!token && !isPublicPath && !path.startsWith('/api/sync') && !path.startsWith('/api/publico')) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  let role = '';
  if (token) {
     try {
       // Extrai JWT Payload no Edge
       const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
       const decodedJson = atob(payloadBase64);
       role = JSON.parse(decodedJson).role;
     } catch(e) {}
  }

  // Lógica de Redirecionamento Autenticado
  if (token && (path === '/login' || path === '/')) {
      if (role === 'TV') return NextResponse.redirect(new URL('/tv', request.nextUrl));
      if (role === 'COMUM') return NextResponse.redirect(new URL('/publico', request.nextUrl));
      return NextResponse.redirect(new URL('/admin', request.nextUrl));
  }

  // Proteção de Rota Restrita (RBAC)
  if (path.startsWith('/admin') && role !== 'ADMIN') {
      if (role === 'TV') return NextResponse.redirect(new URL('/tv', request.nextUrl));
      return NextResponse.redirect(new URL('/publico', request.nextUrl));
  }

  // A TV só pode ser vista pela 'TV' ou 'ADMIN'
  if (path === '/tv' && role === 'COMUM') {
      return NextResponse.redirect(new URL('/publico', request.nextUrl));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
