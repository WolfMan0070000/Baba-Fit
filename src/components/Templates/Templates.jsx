import { useState, useEffect } from 'react';
import { Plus, Play, FileText, Edit2, Share2, Download, FolderOpen, ChevronDown, ChevronUp, Trash2, FolderPlus, FolderInput } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import TemplateBuilder from './TemplateBuilder';
import { api } from '../../services/api';
import { program } from '../../data/program';
import { motion, AnimatePresence } from 'framer-motion';

export default function Templates({ onStartWorkout, user }) {
    const [folders, setFolders] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importCode, setImportCode] = useState('');
    const [showImport, setShowImport] = useState(false);

    // Default Template States
    const [expandDefault, setExpandDefault] = useState(true);
    const [previewDay, setPreviewDay] = useState(null);

    // Folder & Builder States
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isBuilding, setIsBuilding] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [expandedFolders, setExpandedFolders] = useState({});

    // Move Template State
    const [moveTargetId, setMoveTargetId] = useState(null); // Template ID to move
    const [showMoveModal, setShowMoveModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const userId = user?.id || 1;
        try {
            const [resF, resT] = await Promise.all([
                fetch(`${API_BASE_URL}/folders?userId=${userId}`),
                fetch(`${API_BASE_URL}/templates?userId=${userId}`)
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

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            const res = await fetch(`${API_BASE_URL}/folders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newFolderName, userId: user?.id || 1 })
            });
            if (res.ok) {
                setNewFolderName('');
                setShowCreateFolder(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTemplate = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this workout?')) return;
        try {
            await fetch(`${API_BASE_URL}/templates/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const openMoveModal = (tId, e) => {
        e.stopPropagation();
        setMoveTargetId(tId);
        setShowMoveModal(true);
    }

    const handleMoveTemplate = async (folderId) => {
        if (!moveTargetId) return;
        try {
            // Fetch current template data first to preserve other fields
            const current = templates.find(t => t.id === moveTargetId);
            if (!current) return;

            const res = await fetch(`${API_BASE_URL}/templates/${moveTargetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...current, folder_id: folderId, userId: user?.id || 1 })
            });

            if (res.ok) {
                setShowMoveModal(false);
                setMoveTargetId(null);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const handleStart = async (templateId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/templates/${templateId}`);
            const data = await res.json();
            if (data.data) {
                onStartWorkout(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = async (templateId, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${API_BASE_URL}/templates/${templateId}`);
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
            ? `${API_BASE_URL}/templates/${selectedTemplate.id}`
            : `${API_BASE_URL}/templates`;

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
            const res = await fetch(`${API_BASE_URL}/templates/import`, {
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

    const handleShare = (code, e) => {
        e.stopPropagation();
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

    const uncategorizedTemplates = templates.filter(t => !t.folder_id && !t.folderId);

    return (
        <div style={{ padding: '16px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Workouts</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowCreateFolder(true)}
                        className="btn-icon"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                        title="New Folder"
                    >
                        <FolderPlus size={20} color="var(--text-secondary)" />
                    </button>
                    <button
                        onClick={() => setShowImport(true)}
                        className="btn-icon"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                        title="Import"
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

            {/* Modals */}
            <AnimatePresence>
                {showImport && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
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
                    </motion.div>
                )}

                {showCreateFolder && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
                        <h4 style={{ marginBottom: '12px' }}>Create Folder</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                className="input-elegant"
                                style={{ flex: 1 }}
                                placeholder="Folder Name"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                            />
                            <button onClick={handleCreateFolder} className="btn-primary" style={{ padding: '8px 16px' }}>Create</button>
                            <button onClick={() => setShowCreateFolder(false)} className="btn-icon">×</button>
                        </div>
                    </motion.div>
                )}

                {showMoveModal && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="glass-panel" style={{ padding: '16px', marginBottom: '20px', border: '1px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '12px' }}>Move to Folder...</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => handleMoveTemplate(null)}
                                className="btn-secondary"
                                style={{ justifyContent: 'flex-start', padding: '10px' }}
                            >
                                <FileText size={16} /> Uncategorized (Root)
                            </button>
                            {folders.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => handleMoveTemplate(f.id)}
                                    className="btn-secondary"
                                    style={{ justifyContent: 'flex-start', padding: '10px' }}
                                >
                                    <FolderOpen size={16} /> {f.name}
                                </button>
                            ))}
                            <button onClick={() => setShowMoveModal(false)} className="btn-icon" style={{ alignSelf: 'flex-end', marginTop: '8px' }}>Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Default Templates Folder */}
            <div className="glass-panel" style={{ padding: '0', marginBottom: '24px', overflow: 'hidden' }}>
                <div
                    onClick={() => setExpandDefault(!expandDefault)}
                    style={{
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.03)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FolderOpen size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>12-Week Specialization</h3>
                    </div>
                    {expandDefault ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                <AnimatePresence>
                    {expandDefault && (
                        <motion.div
                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Object.values(program.days).map(day => (
                                    <div
                                        key={day.id}
                                        className="glass-panel"
                                        style={{
                                            padding: '16px',
                                            border: '1px solid var(--border-light)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            background: previewDay === day.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'
                                        }}
                                        onClick={() => setPreviewDay(previewDay === day.id ? null : day.id)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.05)', color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{day.title_en}</h3>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{day.subtitle_en}</p>
                                                </div>
                                            </div>
                                            {previewDay === day.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>

                                        <AnimatePresence>
                                            {previewDay === day.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.8 }}>Exercises:</h4>
                                                        <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                            {day.exercises.map(e => (
                                                                <li key={e.id} style={{ marginBottom: '4px' }}>
                                                                    {e.name_en} <span style={{ opacity: 0.5 }}>({e.sets} x {e.reps})</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const templateData = {
                                                                name: day.title_en,
                                                                notes: day.subtitle_en,
                                                                exercises: day.exercises.map(e => ({
                                                                    id: e.id,
                                                                    name: e.name_en,
                                                                    target_sets: e.sets,
                                                                    target_reps: e.reps,
                                                                    notes: e.note_en
                                                                }))
                                                            };
                                                            onStartWorkout(templateData);
                                                        }}
                                                        className="btn-primary"
                                                        style={{
                                                            width: '100%',
                                                            marginTop: '12px', padding: '12px', fontSize: '0.9rem',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                        }}
                                                    >
                                                        <Play size={16} fill="black" />
                                                        Start Workout
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Custom Templates */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                Your Templates
            </h3>

            {/* User Folders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {folders.map(folder => {
                    const folderTemplates = templates.filter(t => t.folder_id === folder.id || t.folderId === folder.id);
                    const isExpanded = expandedFolders[folder.id];

                    return (
                        <div key={folder.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            <div
                                onClick={() => toggleFolder(folder.id)}
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.03)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FolderOpen size={20} color="var(--accent)" />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{folder.name}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({folderTemplates.length})</span>
                                </div>
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
                                            {folderTemplates.map(t => (
                                                <div key={t.id} className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-light)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '8px',
                                                                background: 'rgba(255,255,255,0.05)', color: 'white',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                <FileText size={18} />
                                                            </div>
                                                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.name}</h3>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button onClick={(e) => handleEdit(t.id, e)} className="btn-icon">
                                                                <Edit2 size={16} color="var(--text-muted)" />
                                                            </button>
                                                            <button onClick={(e) => openMoveModal(t.id, e)} className="btn-icon" title="Move to Folder">
                                                                <FolderInput size={16} color="var(--primary)" />
                                                            </button>
                                                            <button onClick={(e) => handleDeleteTemplate(t.id, e)} className="btn-icon">
                                                                <Trash2 size={16} color="#ef4444" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button
                                                            onClick={(e) => handleStart(t.id)}
                                                            className="btn-primary"
                                                            style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                        >
                                                            <Play size={14} fill="black" />
                                                            Start
                                                        </button>
                                                        {t.share_code && (
                                                            <button
                                                                onClick={(e) => handleShare(t.share_code, e)}
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
                                            {folderTemplates.length === 0 && (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                                                    Empty Folder
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                {/* Uncategorized Templates */}
                {uncategorizedTemplates.map(t => (
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
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={(e) => handleEdit(t.id, e)} className="btn-icon">
                                    <Edit2 size={18} color="var(--text-muted)" />
                                </button>
                                <button onClick={(e) => openMoveModal(t.id, e)} className="btn-icon" title="Move to Folder">
                                    <FolderInput size={18} color="var(--primary)" />
                                </button>
                                <button onClick={(e) => handleDeleteTemplate(t.id, e)} className="btn-icon">
                                    <Trash2 size={18} color="#ef4444" />
                                </button>
                            </div>
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
                                    onClick={(e) => handleShare(t.share_code, e)}
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

                {uncategorizedTemplates.length === 0 && folders.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '40px' }}>
                        No custom templates found. Create one above.
                    </div>
                )}
            </div>
        </div>
    );
}
