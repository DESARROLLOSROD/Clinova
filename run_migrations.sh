#!/bin/bash

# Este script ejecuta todas las migraciones de Supabase en orden.

# Salir si algún comando falla
set -e

# Directorio de migraciones
MIGRATIONS_DIR="supabase/migrations"

# Ejecutar migraciones
echo "Ejecutando migraciones de Supabase..."

# 1. Crear nuevas tablas
psql $SUPABASE_DB_URL -f "$MIGRATIONS_DIR/01_new_tables.sql"

# 2. Añadir clinic_id a tablas existentes
psql $SUPABASE_DB_URL -f "$MIGRATIONS_DIR/02_add_clinic_id.sql"

# 3. Aplicar políticas RLS
psql $SUPABASE_DB_URL -f "$MIGRATIONS_DIR/03_rls_policies.sql"

# 4. Crear función make_user_admin
psql $SUPABASE_DB_URL -f "$MIGRATIONS_DIR/04_make_user_admin.sql"

echo "Migraciones de Supabase completadas exitosamente."
