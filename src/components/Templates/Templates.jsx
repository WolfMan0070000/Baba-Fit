import { useState, useEffect } from 'react';
import { Plus, Play, FileText, Edit2, Share2, Download, FolderOpen, ChevronDown, ChevronUp, Trash2, FolderPlus, FolderInput, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import TemplateBuilder from './TemplateBuilder';
import { api } from '../../services/api';
import { program } from '../../data/program';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function Templates({ onStartWorkout, user, hasActiveSession }) {
    const { t, isRTL } = useLanguage();
    const [folders, setFolders] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importCode, setImportCode] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [activeSessionData, setActiveSessionData] = useState(null);

    // Default Template States
    const [expandDefault, setExpandDefault] = useState(true);
    const [previewDay, setPreviewDay] = useState(null);

    // Folder & Builder States
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isBuilding, setIsBuilding] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [expandedFolders, setExpandedFolders] = useState({});
    const [expandedTemplateId, setExpandedTemplateId] = useState(null);

    // Move Template State
    const [moveTargetId, setMoveTargetId] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);

    // Folder Edit States
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editFolderName, setEditFolderName] = useState('');

    useEffect(() => {
        fetchData();
        checkActiveSession();
    }, []);

    const checkActiveSession = () => {
        const saved = localStorage.getItem('active_workout_session');
        if (saved) {
            const parsed = JSON.parse(saved);
            const today = new Date().toISOString().split('T')[0];
            if (parsed.date === today) {
                setActiveSessionData(parsed);
            } else {
                setActiveSessionData(null);
            }
        } else {
            setActiveSessionData(null);
        }
    };

    const fetchData = async () => {
        const userId = user?.id || 1;
        try {
            setLoading(true);
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

    const handleUpdateFolder = async () => {
        if (!editFolderName.trim() || !editingFolderId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/folders/${editingFolderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editFolderName, userId: user?.id || 1 })
            });
            if (res.ok) {
                setEditingFolderId(null);
                setEditFolderName('');
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteFolder = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm(t('delete_folder_confirm'))) return;
        try {
            await fetch(`${API_BASE_URL}/folders/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id || 1 })
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTemplate = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm(t('remove_exercise_confirm'))) return; // Reusing remove_exercise_confirm or add new key
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
    };

    const openEditFolder = (folder, e) => {
        e.stopPropagation();
        setEditingFolderId(folder.id);
        setEditFolderName(folder.name);
    };

    const handleMoveTemplate = async (folderId) => {
        if (!moveTargetId) return;
        try {
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
                alert(t('invalid_share_code'));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = (code, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        alert(t('share_copied') + code);
    };

    if (isBuilding) {
        return (
            <div className="animate-fade-in" style={{ padding: '20px' }}>
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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="container"
            style={{ paddingBottom: '120px' }}
        >
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('workouts')}</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowCreateFolder(true)}
                        className="btn-icon"
                        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    >
                        <FolderPlus size={24} color="var(--text-secondary)" />
                    </button>
                    <button
                        onClick={() => setShowImport(true)}
                        className="btn-icon"
                        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    >
                        <Download size={24} color="var(--primary)" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedTemplate(null);
                            setIsBuilding(true);
                        }}
                        className="btn btn-primary"
                        style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </motion.div>

            {/* Modals and other UI... (unchanged logic, updated styles/translations) */}
            <AnimatePresence>
                {showImport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowImport(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel modal-content" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 700 }}>{t('import_workout')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input className="input-elegant" placeholder={t('enter_share_code')} value={importCode} onChange={e => setImportCode(e.target.value)} />
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={handleImport} className="btn btn-primary" style={{ flex: 1 }}>{t('import')}</button>
                                    <button onClick={() => setShowImport(false)} className="btn btn-outline" style={{ flex: 1 }}>{t('cancel')}</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showCreateFolder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowCreateFolder(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel modal-content" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 700 }}>{t('create_folder')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input className="input-elegant" placeholder={t('folder_name')} value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={handleCreateFolder} className="btn btn-primary" style={{ flex: 1 }}>{t('create')}</button>
                                    <button onClick={() => setShowCreateFolder(false)} className="btn btn-outline" style={{ flex: 1 }}>{t('cancel')}</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {editingFolderId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setEditingFolderId(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel modal-content" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 700 }}>{t('edit_folder')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input className="input-elegant" placeholder={t('folder_name')} value={editFolderName} onChange={e => setEditFolderName(e.target.value)} />
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={handleUpdateFolder} className="btn btn-primary" style={{ flex: 1 }}>{t('save')}</button>
                                    <button onClick={() => setEditingFolderId(null)} className="btn btn-outline" style={{ flex: 1 }}>{t('cancel')}</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showMoveModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowMoveModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel modal-content" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', padding: '32px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 700 }}>{t('move_to_folder')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={() => handleMoveTemplate(null)}
                                    className="btn btn-outline"
                                    style={{ justifyContent: 'flex-start', padding: '16px', borderStyle: 'dashed' }}
                                >
                                    <FileText size={18} /> {t('uncategorized')} (Root)
                                </button>
                                {folders.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => handleMoveTemplate(f.id)}
                                        className="btn btn-secondary"
                                        style={{ justifyContent: 'flex-start', padding: '16px' }}
                                    >
                                        <FolderOpen size={18} color="var(--primary)" /> <span style={{ marginLeft: '12px' }}>{f.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowMoveModal(false)} className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>{t('cancel')}</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Layout Grid for Desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>

                {/* Default Templates Folder - Spans full width potentially or fits grid */}
                <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '0', gridColumn: '1 / -1', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div
                        onClick={() => setExpandDefault(!expandDefault)}
                        style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                <FolderOpen size={24} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('specialization_program')}</h3>
                        </div>
                        {expandDefault ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>

                    <AnimatePresence>
                        {expandDefault && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                    {Object.values(program.days).map(day => (
                                        <div key={day.id} className="glass-panel" style={{ padding: '20px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer' }} onClick={() => setPreviewDay(previewDay === day.id ? null : day.id)}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FileText size={22} />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{isRTL ? day.title_fa : day.title_en}</h4>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{isRTL ? day.subtitle_fa : day.subtitle_en}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {previewDay === day.id && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                                {day.exercises.map(e => (
                                                                    <li key={e.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>{isRTL ? e.name_fa : e.name_en}</span>
                                                                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{e.sets} x {e.reps}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const templateData = {
                                                        name: isRTL ? day.title_fa : day.title_en,
                                                        notes: isRTL ? day.subtitle_fa : day.subtitle_en,
                                                        exercises: day.exercises.map(e => ({
                                                            id: e.id,
                                                            name: isRTL ? e.name_fa : e.name_en,
                                                            target_sets: e.sets,
                                                            target_reps: e.reps,
                                                            notes: isRTL ? e.note_fa : e.note_en
                                                        }))
                                                    };
                                                    onStartWorkout(templateData);
                                                }}
                                                className="btn btn-primary"
                                                style={{ width: '100%', padding: '12px' }}
                                            >
                                                <Play size={16} fill="black" />
                                                <span style={{ marginLeft: '8px' }}>
                                                    {activeSessionData?.workout_name === (isRTL ? day.title_fa : day.title_en) ? t('resume') : t('start')}
                                                </span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Custom Templates Header */}
                <motion.h3 variants={itemVariants} style={{ fontSize: '1.4rem', fontWeight: 800, margin: '24px 0 12px 0', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
                    {t('your_templates')}
                </motion.h3>

                {/* User Folders */}
                {folders.map(folder => {
                    const folderTemplates = templates.filter(t => t.folder_id === folder.id || t.folderId === folder.id);
                    const isExpanded = expandedFolders[folder.id];

                    return (
                        <motion.div key={folder.id} variants={itemVariants} className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div
                                onClick={() => toggleFolder(folder.id)}
                                style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FolderOpen size={20} color="var(--accent)" />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{folder.name}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({folderTemplates.length})</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button onClick={(e) => openEditFolder(folder, e)} className="btn-icon"><Edit2 size={16} color="var(--text-muted)" /></button>
                                    <button onClick={(e) => handleDeleteFolder(folder.id, e)} className="btn-icon"><Trash2 size={16} color="var(--error)" /></button>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
                                            {folderTemplates.map(tData => (
                                                <div key={tData.id} className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => setExpandedTemplateId(expandedTemplateId === tData.id ? null : tData.id)}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <FileText size={18} />
                                                            </div>
                                                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{tData.name}</h3>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button onClick={(e) => handleEdit(tData.id, e)} className="btn-icon"><Edit2 size={16} color="var(--text-muted)" /></button>
                                                            <button onClick={(e) => openMoveModal(tData.id, e)} className="btn-icon"><FolderInput size={16} color="var(--primary)" /></button>
                                                            <button onClick={(e) => handleDeleteTemplate(tData.id, e)} className="btn-icon"><Trash2 size={16} color="var(--error)" /></button>
                                                            <div className="btn-icon">{expandedTemplateId === tData.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedTemplateId === tData.id && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                                <div style={{ padding: '24px 24px 40px 24px' }}>
                                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                                        <button onClick={(e) => { e.stopPropagation(); handleStart(tData.id); }} className="btn btn-primary" style={{ flex: 1 }}>
                                                                            <Play size={14} fill="black" /> {activeSessionData?.workout_name === tData.name ? t('resume') : t('start')}
                                                                        </button>
                                                                        {tData.share_code && (
                                                                            <button onClick={(e) => handleShare(tData.share_code, e)} className="btn btn-outline" style={{ padding: '0 16px' }} title="Share Workout"><Share2 size={16} color="var(--primary)" /></button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                            {folderTemplates.length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>{t('empty_folder')}</div>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}

                {/* Uncategorized Templates */}
                {uncategorizedTemplates.map(tData => (
                    <motion.div
                        key={tData.id}
                        variants={itemVariants}
                        className="glass-panel"
                        style={{ padding: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                        whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.03)' }}
                        onClick={() => setExpandedTemplateId(expandedTemplateId === tData.id ? null : tData.id)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={22} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{tData.name}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={(e) => handleEdit(tData.id, e)} className="btn-icon"><Edit2 size={18} color="var(--text-muted)" /></button>
                                <button onClick={(e) => openMoveModal(tData.id, e)} className="btn-icon"><FolderInput size={18} color="var(--primary)" /></button>
                                <button onClick={(e) => handleDeleteTemplate(tData.id, e)} className="btn-icon"><Trash2 size={18} color="var(--error)" /></button>
                                <div className="btn-icon">{expandedTemplateId === tData.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedTemplateId === tData.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '20px 0 0 0' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button onClick={(e) => { e.stopPropagation(); handleStart(tData.id); }} className="btn btn-primary" style={{ flex: 1, padding: '14px' }}>
                                                <Play size={16} fill="black" /> {activeSessionData?.workout_name === tData.name ? t('resume') : t('start')}
                                            </button>
                                            {tData.share_code && (
                                                <button onClick={(e) => handleShare(tData.share_code, e)} className="btn btn-outline" style={{ padding: '0 20px' }} title="Share Workout"><Share2 size={18} color="var(--primary)" /></button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}

                {uncategorizedTemplates.length === 0 && folders.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', gridColumn: '1 / -1' }}>
                        <div style={{ marginBottom: '16px' }}><FileText size={48} opacity={0.2} /></div>
                        {t('no_custom_templates')}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
