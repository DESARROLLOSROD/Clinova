'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClinicSettingsForm } from './ClinicSettingsForm';
import { ServicePricesList } from './ServicePricesList';
import { NotificationTemplatesList } from './NotificationTemplatesList';
import { AuditLogList } from './AuditLogList';

interface SettingsTabsProps {
  initialSettings: any;
  initialServicePrices: any[];
  initialNotificationTemplates: any[];
}

type TabType = 'clinic' | 'services' | 'notifications' | 'security';

export function SettingsTabs({
  initialSettings,
  initialServicePrices,
  initialNotificationTemplates,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('clinic');

  const tabs = [
    { id: 'clinic' as TabType, label: 'Información de la Clínica', icon: '🏥' },
    { id: 'services' as TabType, label: 'Servicios y Precios', icon: '💰' },
    { id: 'notifications' as TabType, label: 'Notificaciones', icon: '📧' },
    { id: 'security' as TabType, label: 'Seguridad y Auditoría', icon: '🛡️' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'clinic' && <ClinicSettingsForm initialSettings={initialSettings} />}
        {activeTab === 'services' && (
          <ServicePricesList initialServicePrices={initialServicePrices} />
        )}
        {activeTab === 'notifications' && (
          <NotificationTemplatesList
            initialNotificationTemplates={initialNotificationTemplates}
          />
        )}
        {activeTab === 'security' && <AuditLogList />}
      </div>
    </div>
  );
}
