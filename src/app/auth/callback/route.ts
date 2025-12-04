import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin
    const cookieStore = await cookies()

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    },
                },
            }
        )

        // 1. Exchange Code for Session (Set Cookies)
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('❌ OAuth error:', error.message)
            return NextResponse.redirect(`${origin}/login?error=auth_failed`)
        }

        if (data.session) {
            console.log('✅ OAuth Success! User:', data.session.user.email)

            // 2. Check & Assign Guest Role
            const { data: existingRoles } = await supabase
                .from('user_roles')
                .select('id')
                .eq('user_id', data.session.user.id)
                .limit(1)

            if (!existingRoles || existingRoles.length === 0) {
                console.log('👤 New OAuth user - assigning default guest role...')

                const { data: guestRole } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('name', 'guest')
                    .single()

                if (guestRole) {
                    await supabase
                        .from('user_roles')
                        .insert({
                            user_id: data.session.user.id,
                            role_id: guestRole.id
                        })
                    console.log('✅ Assigned guest role to new user')
                }
            }
        }
    }

    // 3. Redirect to Chatbot
    return NextResponse.redirect(`${origin}/chatbot`)
}
