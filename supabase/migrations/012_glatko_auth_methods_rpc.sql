-- ============================================================================
-- 012_glatko_auth_methods_rpc.sql
-- G-AUTH-2: Account linking — RPC that returns auth methods for an email.
--
-- Use case: when the login page's password sign-in fails with
-- invalid_credentials, the client calls this RPC to detect OAuth-only
-- accounts and shows a smart inline alert ("Use Google to sign in")
-- instead of the generic "wrong password" message — Stripe-style.
--
-- Also used by /settings/security to pick "Set password" (no password yet)
-- vs. "Change password" (existing password) and to render linked providers.
--
-- Security:
--   - SECURITY DEFINER (anon role cannot read auth.* directly).
--   - Granted to anon + authenticated so the login page can call it
--     before completing sign-in.
--   - Returns no rows when the email does not exist, so the endpoint
--     does not on its own distinguish "no account" from "wrong password".
--   - Email is lowercased for case-insensitive lookup, matching how
--     supabase.auth.signInWithPassword normalizes the email server-side.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_methods(p_email text)
RETURNS TABLE (
    has_password boolean,
    oauth_providers text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Look up the auth user for this email (case-insensitive).
    SELECT u.id INTO v_user_id
    FROM auth.users u
    WHERE LOWER(u.email) = LOWER(p_email)
    LIMIT 1;

    IF v_user_id IS NULL THEN
        -- No account; return no rows so the caller cannot distinguish
        -- "no account" from "wrong password" via this endpoint alone.
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        EXISTS (
            SELECT 1
            FROM auth.users u
            WHERE u.id = v_user_id
              AND u.encrypted_password IS NOT NULL
              AND length(u.encrypted_password) > 0
        ) AS has_password,
        (
            SELECT COALESCE(array_agg(DISTINCT i.provider), ARRAY[]::text[])
            FROM auth.identities i
            WHERE i.user_id = v_user_id
              AND i.provider <> 'email'
        ) AS oauth_providers;
END;
$$;

REVOKE ALL ON FUNCTION public.get_auth_methods(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_methods(text) TO anon, authenticated;

COMMENT ON FUNCTION public.get_auth_methods(text) IS
'G-AUTH-2: Returns has_password + oauth_providers for an email. SECURITY DEFINER. Used by login page to detect OAuth-only accounts and show smart inline alerts, and by /settings/security to choose Set vs. Change password.';

-- Verification queries (run after applying):
--   SELECT * FROM public.get_auth_methods('rohat7746@gmail.com');
--   -- expected: has_password=false, oauth_providers={google}
--
--   SELECT * FROM public.get_auth_methods('does-not-exist@example.com');
--   -- expected: 0 rows
