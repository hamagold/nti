import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // ============ AUTHORIZATION CHECK ============
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized - No token provided" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: callerUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callerUser) {
      return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if caller is superadmin
    const { data: callerRoleData, error: callerRoleError } = await supabaseAdmin
      .from("user_roles")
      .select("role, created_at")
      .eq("user_id", callerUser.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (callerRoleError) {
      return new Response(JSON.stringify({ error: "Failed to verify permissions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!callerRoleData || callerRoleData.role !== "superadmin") {
      return new Response(JSON.stringify({ error: "Only superadmins can delete admin accounts" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ INPUT VALIDATION ============
    const { user_id } = await req.json();
    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ DELETE ============
    // Remove role/profile rows first
    const [rolesDelete, profileDelete] = await Promise.all([
      supabaseAdmin.from("user_roles").delete().eq("user_id", user_id),
      supabaseAdmin.from("admin_profiles").delete().eq("user_id", user_id),
    ]);

    if (rolesDelete.error) {
      return new Response(JSON.stringify({ error: rolesDelete.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete user from auth (prevents login)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (deleteUserError) {
      return new Response(JSON.stringify({ error: deleteUserError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Profile delete might already be gone; treat as non-fatal
    if (profileDelete.error) {
      console.warn("Could not delete admin profile:", profileDelete.error);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
