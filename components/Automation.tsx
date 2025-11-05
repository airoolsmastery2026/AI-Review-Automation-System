import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { Server, Bot, CheckCircle } from "./LucideIcons";
import type { AutomationSettings } from '../types';
import { useI18n } from "../hooks/useI18n";

interface AutomationProps {
    settings: AutomationSettings;
    onSettingsChange: (settings: AutomationSettings) => void;
}

const ToggleSwitch: React.FC<{
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-medium text-gray-200">
            {label}
        </label>
        <div className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                id={id}
                className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-300 after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </div>
    </div>
);

export const Automation: React.FC<AutomationProps> = ({ settings, onSettingsChange }) => {
    const { t } = useI18n();

    const handleMasterToggle = (checked: boolean) => {
        onSettingsChange({ ...settings, masterEnabled: checked });
    };

    const handleSettingChange = (agent: keyof AutomationSettings, field: string, value: any) => {
        if (agent === 'scoutAgent') {
            onSettingsChange({
                ...settings,
                scoutAgent: {
                    ...settings.scoutAgent,
                    [field]: value
                }
            });
        } else {
             onSettingsChange({
                ...settings,
                [field]: value
            });
        }
    };

    const frequencyOptions = [
        { labelKey: 'automationControl.freq_5m', value: 5 },
        { labelKey: 'automationControl.freq_30m', value: 30 },
        { labelKey: 'automationControl.freq_1h', value: 60 },
        { labelKey: 'automationControl.freq_4h', value: 240 },
        { labelKey: 'automationControl.freq_12h', value: 720 },
        { labelKey: 'automationControl.freq_24h', value: 1440 },
    ];
    
    const [isCustomFrequency, setIsCustomFrequency] = useState(false);

    useEffect(() => {
        const isPredefined = frequencyOptions.some(opt => opt.value === settings.scoutAgent.frequencyMinutes);
        setIsCustomFrequency(!isPredefined);
    }, [settings.scoutAgent.frequencyMinutes]);


    const handleFrequencySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'custom') {
            setIsCustomFrequency(true);
        } else {
            setIsCustomFrequency(false);
            handleSettingChange('scoutAgent', 'frequencyMinutes', parseInt(value));
        }
    };


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary-500/10">
                            <Server className="h-6 w-6 text-primary-400" />
                        </div>
                        <div>
                            <CardTitle>{t('automationControl.title')}</CardTitle>
                            <CardDescription>{t('automationControl.description')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <div className="p-4 border-t border-gray-700">
                    <ToggleSwitch
                        id="master-automation-switch"
                        label={t('automationControl.masterSwitch')}
                        checked={settings.masterEnabled}
                        onChange={handleMasterToggle}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                       {t('automationControl.masterDescription')}
                    </p>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Bot className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle>{t('automationControl.scoutAgentTitle')}</CardTitle>
                                <CardDescription>{t('automationControl.scoutAgentDescription')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <div className="p-4 border-t border-gray-700 space-y-4">
                        <ToggleSwitch
                            id="scout-agent-toggle"
                            label={t('automationControl.enabled')}
                            checked={settings.scoutAgent.enabled}
                            onChange={(checked) => handleSettingChange('scoutAgent', 'enabled', checked)}
                        />
                        
                        <div>
                            <label htmlFor="scout-frequency" className="block text-sm font-medium text-gray-300 mb-2">
                               {t('automationControl.runFrequency')}
                            </label>
                            <select 
                                id="scout-frequency"
                                value={isCustomFrequency ? 'custom' : settings.scoutAgent.frequencyMinutes}
                                onChange={handleFrequencySelectChange}
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                                {frequencyOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                                ))}
                                <option value="custom">{t('automationControl.freq_custom')}</option>
                            </select>
                        </div>

                        {isCustomFrequency && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div>
                                    <label htmlFor="custom-frequency" className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('automationControl.customMinutes')}
                                    </label>
                                    <input
                                        id="custom-frequency"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={settings.scoutAgent.frequencyMinutes}
                                        onChange={(e) => handleSettingChange('scoutAgent', 'frequencyMinutes', parseInt(e.target.value) || 1)}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                            </motion.div>
                        )}

                         <div>
                            <label htmlFor="scout-topic" className="block text-sm font-medium text-gray-300 mb-2">
                               {t('automationControl.defaultTopic')}
                            </label>
                            <input
                                id="scout-topic"
                                type="text"
                                value={settings.scoutAgent.defaultTopic}
                                onChange={(e) => handleSettingChange('scoutAgent', 'defaultTopic', e.target.value)}
                                placeholder={t('productScout.nichePlaceholder')}
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-3 py-2 text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </Card>
                 <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <CheckCircle className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <CardTitle>{t('automationControl.autoApprovalTitle')}</CardTitle>
                                <CardDescription>{t('automationControl.autoApprovalDescription')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <div className="p-4 border-t border-gray-700 space-y-4">
                        <div>
                            <label htmlFor="auto-approve-threshold" className="block text-sm font-medium text-gray-300 mb-2">
                               {t('automationControl.autoApproveThreshold')}
                            </label>
                             <div className="flex items-center space-x-4">
                                <input
                                    id="auto-approve-threshold"
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={settings.autoApproveThreshold}
                                    onChange={(e) => handleSettingChange('autoApproveThreshold', 'autoApproveThreshold', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="font-bold text-gray-200 w-12 text-center">{settings.autoApproveThreshold}</span>
                            </div>
                             <p className="text-xs text-gray-400 mt-2">
                               {t('automationControl.thresholdDescription')}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
            
        </div>
    );
};