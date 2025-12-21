import { useState, useEffect } from 'react';
import { Plus, Play, FileText, Edit2, Share2, Download } from 'lucide-react';
import TemplateBuilder from './TemplateBuilder';
import { api } from '../../services/api';
import { program } from '../../data/program';

export default function Templates({ onStartWorkout, user }) {
    const [folders, setFolders] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importCode, setImportCode] = useState('');
    const [showImport, setShowImport] = useState(false);

    // Simplified States
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isBuilding, setIsBuilding] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const userId = user?.id || 1;
        try {
            const [resF, resT] = await Promise.all([
                fetch(`http://localhost:3001/api/folders?userId=${userId}`),
                fetch(`http://localhost:3001/api/templates?userId=${userId}`)
            ]);
            const dataF = await resF.json();
            const dataT = await resT.json();
            setFolders(dataF.data || []);
            setTemplates(dataT.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleStart = async (templateId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/templates/${templateId}`);
            const data = await res.json();
            if (data.data) {
                onStartWorkout(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = async (templateId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/templates/${templateId}`);
            const data = await res.json();
            if (data.data) {
                setSelectedTemplate(data.data);
                setIsBuilding(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveTemplate = async (payload) => {
        const userId = user?.id || 1;
        const method = selectedTemplate ? 'PUT' : 'POST';
        const url = selectedTemplate
            ? `http://localhost:3001/api/templates/${selectedTemplate.id}`
            : 'http://localhost:3001/api/templates';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, userId })
            });
            if (res.ok) {
                setIsBuilding(false);
                setSelectedTemplate(null);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleImport = async () => {
        if (!importCode) return;
        try {
            const res = await fetch('http://localhost:3001/api/templates/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shareCode: importCode, userId: user?.id || 1 })
            });
            if (res.ok) {
                setImportCode('');
                setShowImport(false);
                fetchData();
            } else {
                alert('Invalid Share Code');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = (code) => {
        navigator.clipboard.writeText(code);
        alert('Share code copied to clipboard: ' + code);
    };

    if (isBuilding) {
        return (
            <div style={{ padding: '16px' }}>
                <TemplateBuilder
                    template={selectedTemplate}
                    onBack={() => {
                        setIsBuilding(false);
                        setSelectedTemplate(null);
                    }}
                    onSave={handleSaveTemplate}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '16px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Workouts</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowImport(true)}
                        className="btn-icon"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                        <Download size={20} color="var(--primary)" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedTemplate(null);
                            setIsBuilding(true);
                        }}
                        className="btn-primary"
                        style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {showImport && (
                <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
                    <h4 style={{ marginBottom: '12px' }}>Import Workout</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            className="input-elegant"
                            style={{ flex: 1 }}
                            placeholder="Enter Share Code"
                            value={importCode}
                            onChange={e => setImportCode(e.target.value)}
                        />
                        <button onClick={handleImport} className="btn-primary" style={{ padding: '8px 16px' }}>Import</button>
                        <button onClick={() => setShowImport(false)} className="btn-icon">×</button>
                    </div>
                </div>
            )}

            {/* Templates List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {templates.map(t => (
                    <div key={t.id} className="glass-panel" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.05)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <FileText size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.name}</h3>
                            </div>
                            <button onClick={() => handleEdit(t.id)} className="btn-icon">
                                <Edit2 size={18} color="var(--text-muted)" />
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => handleStart(t.id)}
                                className="btn-primary"
                                style={{ flex: 1, padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Play size={16} fill="black" />
                                Start Workout
                            </button>
                            {t.share_code && (
                                <button
                                    onClick={() => handleShare(t.share_code)}
                                    className="btn-icon"
                                    style={{ background: 'rgba(0, 242, 254, 0.1)' }}
                                    title="Share Workout"
                                >
                                    <Share2 size={16} color="var(--primary)" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {templates.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                        No templates found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
