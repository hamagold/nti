import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // ============ AUTHORIZATION CHECK ============
    // Get the calling user's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !callerUser) {
      console.error('Invalid authentication:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if caller is superadmin
    const { data: callerRoleData, error: callerRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .maybeSingle()

    if (callerRoleError) {
      console.error('Error fetching caller role:', callerRoleError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!callerRoleData || callerRoleData.role !== 'superadmin') {
      console.error('Unauthorized: User is not superadmin. User ID:', callerUser.id, 'Role:', callerRoleData?.role)
      return new Response(
        JSON.stringify({ error: 'Only superadmins can create admin accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ============ INPUT VALIDATION ============
    const { email, password, role } = await req.json()

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email length
    if (email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Email must be less than 255 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password.length > 72) {
      return new Response(
        JSON.stringify({ error: 'Password must be less than 72 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    const validRoles = ['superadmin', 'admin', 'staff', 'local_staff']
    const userRole = role || 'staff'
    if (!validRoles.includes(userRole)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be one of: superadmin, admin, staff, local_staff' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ============ CREATE USER ============
    console.log('Creating user:', email, 'with role:', userRole, 'by superadmin:', callerUser.email)

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Assign role to the user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: userRole,
      })

    if (roleError) {
      console.error('Error assigning role:', roleError)
      // Cleanup: delete the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      return new Response(
        JSON.stringify({ error: 'Role assignment failed', details: roleError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store admin email in admin_profiles table
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .insert({
        user_id: userData.user.id,
        email: email,
      })

    if (profileError) {
      console.error('Error creating admin profile:', profileError)
      // Not critical, continue
    }

    console.log('Successfully created user:', userData.user.email, 'with role:', userRole)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User created successfully',
        user: { id: userData.user.id, email: userData.user.email, role: userRole }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
