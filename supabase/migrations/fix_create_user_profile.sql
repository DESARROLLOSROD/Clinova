-- ============================================================================
-- FIX: Create User Profile - Manual Version
-- ============================================================================
-- INSTRUCTIONS:
-- 1. First, get your user ID by running this query in the SQL Editor:
--    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
-- 
-- 2. Copy your user ID from the results
-- 
-- 3. Replace 'YOUR_USER_ID_HERE' below with your actual user ID
-- 
-- 4. Run this script
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID_HERE'; -- REPLACE THIS WITH YOUR ACTUAL USER ID
    v_user_email TEXT;
    v_clinic_id UUID;
BEGIN
    -- Validate user ID was changed
    IF v_user_id::text = 'YOUR_USER_ID_HERE' THEN
        RAISE EXCEPTION 'Please replace YOUR_USER_ID_HERE with your actual user ID from auth.users table';
    END IF;
    
    -- Get user email
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;
    
    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'User ID % not found in auth.users table', v_user_id;
    END IF;
    
    RAISE NOTICE 'Creating profile for user: % (%)', v_user_email, v_user_id;
    
    -- Check if clinic exists, if not create one
    SELECT id INTO v_clinic_id
    FROM public.clinics
    LIMIT 1;
    
    IF v_clinic_id IS NULL THEN
        RAISE NOTICE 'No clinic found, creating default clinic...';
        INSERT INTO public.clinics (name, slug, email)
        VALUES ('Clínica Principal', 'clinica-principal', v_user_email)
        RETURNING id INTO v_clinic_id;
        RAISE NOTICE 'Created clinic with ID: %', v_clinic_id;
    ELSE
        RAISE NOTICE 'Using existing clinic with ID: %', v_clinic_id;
    END IF;
    
    -- Create or update user profile
    INSERT INTO public.user_profiles (
        id,
        role,
        clinic_id,
        full_name,
        is_active
    )
    VALUES (
        v_user_id,
        'clinic_manager',
        v_clinic_id,
        COALESCE(
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = v_user_id),
            v_user_email
        ),
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        clinic_id = EXCLUDED.clinic_id,
        is_active = true,
        updated_at = NOW();
    
    RAISE NOTICE '✅ User profile created/updated successfully!';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Email: %', v_user_email;
    RAISE NOTICE 'Role: clinic_manager';
    RAISE NOTICE 'Clinic ID: %', v_clinic_id;
    
END $$;

-- Verify the results
SELECT 
    up.id,
    up.full_name,
    up.role,
    up.clinic_id,
    c.name as clinic_name,
    up.is_active,
    up.created_at,
    au.email
FROM public.user_profiles up
LEFT JOIN public.clinics c ON c.id = up.clinic_id
LEFT JOIN auth.users au ON au.id = up.id
ORDER BY up.created_at DESC
LIMIT 5;
