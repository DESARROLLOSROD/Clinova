import { createClient } from '@/utils/supabase/server';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  // Fetch clinic settings (should only have one record)
  const { data: settings } = await supabase.from('clinic_settings').select('*').single();

  // Fetch service prices
  const { data: servicePrices } = await supabase
    .from('service_prices')
    .select('*')
    .order('service_name');

  // Fetch notification templates
  const { data: notificationTemplates } = await supabase
    .from('notification_templates')
    .select('*')
    .order('template_name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-600 text-sm mt-1">
          Gestiona la configuración general de tu clínica
        </p>
      </div>

      <SettingsTabs
        initialSettings={settings}
        initialServicePrices={servicePrices || []}
        initialNotificationTemplates={notificationTemplates || []}
      />
    </div>
  );
}
