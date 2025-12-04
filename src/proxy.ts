import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Public routes that don't require auth
    const publicRoutes = ['/chatbot', '/login', '/signup', '/auth/callback']
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    // 1. Root path handling
    if (request.nextUrl.pathname === '/') {
        if (user) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 2. Allow access to public routes
    if (isPublicRoute) {
        // If user is logged in and tries to access login/signup, redirect to dashboard
        if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return supabaseResponse
    }

    // 3. Protect all other routes -> Redirect to Login
    if (!user) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
