import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Apenas o login e o teste da Solis são públicos temporariamente para teste local.
  const isPublicPath = path === '/login' || path.startsWith('/api/login') || path === '/admin/solis-test';

  const token = request.cookies.get('auth_token')?.value || '';

  if (!token && !isPublicPath) {
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

  // Se acessar a raiz, força ir para o login primeiro
  if (path === '/') {
      return NextResponse.redirect(new URL('/login', request.nextUrl));
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
