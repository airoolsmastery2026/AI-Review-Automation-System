import React, { useState } from "react";
import { Button } from './common/Button';
import { Card, CardHeader, CardTitle, CardDescription } from './common/Card';
import { 
  Play, 
  Trash,
  Plus,
  Upload,
  Server
} from "./LucideIcons";
import type { VideoIdea, IdeaStatus } from '../types';
import { useI18n } from "../hooks/useI18n";

interface AutomationProps {
    videoIdeas: VideoIdea[];
    setVideoIdeas: React.Dispatch<React.SetStateAction<VideoIdea[]>>;
}

export const Automation: React.FC<AutomationProps> = ({ videoIdeas, setVideoIdeas }) => {
    const [newIdea, setNewIdea] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tech");
    const { t } = useI18n();

    const handleAddIdea = () => {
        if (newIdea.trim()) {
          const newIdeaObj: VideoIdea = {
            id: Date.now(),
            title: newIdea,
            category: selectedCategory,
            status: "Generated"
          };
          setVideoIdeas(prev => [newIdeaObj, ...prev]);
          setNewIdea("");
        }
    };

    const handleDeleteIdea = (id: number) => {
        setVideoIdeas(videoIdeas.filter(idea => idea.id !== id));
    };
    
    const handleUpdateStatus = (id: number, newStatus: IdeaStatus) => {
        setVideoIdeas(videoIdeas.map(idea => 
          idea.id === id ? {...idea, status: newStatus} : idea
        ));
    };

    const categories = ["Tech", "Health", "Lifestyle", "Finance"];

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary-500/10">
                            <Server className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <CardTitle>{t('automation.engineTitle')}</CardTitle>
                            <CardDescription>{t('automation.engineDescription')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <label htmlFor="automation-engine" className="font-medium text-slate-700">
                            {t('automation.engineMode')}
                        </label>
                        <div className="relative inline-flex items-center cursor-not-allowed">
                            <input
                                type="checkbox"
                                id="automation-engine"
                                className="sr-only peer"
                                disabled
                            />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 opacity-50"></div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        <strong>{t('automation.engineNote')}</strong>
                    </p>
                </div>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle>{t('automation.title')}</CardTitle>
                  <CardDescription>{t('automation.description')}</CardDescription>
                </CardHeader>
                <div className="p-4 space-y-4 md:space-y-0 md:flex md:gap-2">
                    <input
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      placeholder={t('automation.placeholder')}
                      className="w-full md:flex-1 bg-white/50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <select 
                        value={selectedCategory} 
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full md:w-32 bg-white/50 border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{t(`automation.${cat}`)}</option>)}
                    </select>
                    <Button onClick={handleAddIdea} className="w-full md:w-auto" icon={<Plus className="h-4 w-4" />}> {t('automation.addIdea')}</Button>
                </div>
                 <div className="p-4 space-y-3">
                    {videoIdeas.map((idea) => (
                      <div 
                        key={idea.id} 
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="mb-4 sm:mb-0">
                          <h3 className="font-medium text-slate-800">{idea.title}</h3>
                          <div className="mt-1 flex items-center space-x-2 text-sm text-slate-700">
                            <span className="rounded-full bg-slate-200 px-2 py-1 text-xs">
                              {t(`automation.${idea.category}`)}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              idea.status === "Generated" 
                                ? "bg-blue-100 text-blue-800" 
                                : idea.status === "In Production" 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : "bg-green-100 text-green-800"
                            }`}>
                              {t(`automation.${idea.status}`)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {idea.status === "Generated" && (
                            <Button size="sm" onClick={() => handleUpdateStatus(idea.id, 'In Production')} icon={<Play className="h-4 w-4" />}>
                                {t('automation.start')}
                            </Button>
                          )}
                          {idea.status === "In Production" && (
                            <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(idea.id, 'Published')} icon={<Upload className="h-4 w-4" />}>
                                {t('automation.publish')}
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteIdea(idea.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-100"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
            </Card>
        </div>
    );
};