import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's auth to verify they are admin
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Use service role to check if user is admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { action, ...params } = await req.json();

    switch (action) {
      case "get_pending_users": {
        // Get pending profiles with email from auth.users
        const { data: profiles, error } = await supabaseAdmin
          .from("profiles")
          .select("id, user_id, full_name, years_of_experience, approval_status, created_at")
          .eq("approval_status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Get emails for each user
        const usersWithEmail = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
            return {
              ...profile,
              email: userData?.user?.email || "Unknown",
            };
          })
        );

        return new Response(JSON.stringify({ data: usersWithEmail }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "approve_user": {
        const { profileId } = params;
        if (!profileId) {
          return new Response(JSON.stringify({ error: "Profile ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ approval_status: "approved" })
          .eq("id", profileId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reject_user": {
        const { profileId } = params;
        if (!profileId) {
          return new Response(JSON.stringify({ error: "Profile ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ approval_status: "rejected" })
          .eq("id", profileId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_all_users": {
        const { data: profiles, error } = await supabaseAdmin
          .from("profiles")
          .select("id, user_id, full_name, years_of_experience, approval_status, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Get emails and roles for each user
        const usersWithDetails = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
            const { data: roleData } = await supabaseAdmin
              .from("user_roles")
              .select("role")
              .eq("user_id", profile.user_id);
            
            return {
              ...profile,
              email: userData?.user?.email || "Unknown",
              roles: roleData?.map(r => r.role) || [],
            };
          })
        );

        return new Response(JSON.stringify({ data: usersWithDetails }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "set_admin": {
        const { targetUserId, isAdmin } = params;
        if (!targetUserId) {
          return new Response(JSON.stringify({ error: "Target user ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (isAdmin) {
          // Add admin role
          const { error } = await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id: targetUserId, role: "admin" }, { onConflict: "user_id,role" });
          
          if (error) throw error;
        } else {
          // Remove admin role
          const { error } = await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", targetUserId)
            .eq("role", "admin");
          
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin operation error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
