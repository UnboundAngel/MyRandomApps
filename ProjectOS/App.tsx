import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Terminal,
  Folder,
  Code,
  Activity,
  Settings,
  Save,
  Play,
  Plus,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  FileText,
  Layout,
  Maximize2,
  X,
  Trash2,
  CheckCircle2,
  Download,
  Upload,
  User,
  Bell,
  Shield,
  PieChart,
  BarChart3,
  Calendar,
  ArrowRight,
  Lock, // Import Lock icon
  ListTodo,
  FileEdit,
  Type,
  AlignLeft,
  AlertCircle,
  Library,
  Search,
  Command,
  Copy,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';

declare global {
  interface Window {
    electron: {
      openDirectory: (hideDotFiles: boolean) => Promise<FileNode>;
      getFileContent: (filePath: string) => Promise<string>;
      isDirectory: (path: string) => Promise<boolean>;
      openDroppedDirectory: (dirPath: string, hideDotFiles: boolean) => Promise<FileNode>;
      saveFile: (filePath: string, content: string) => Promise<void>;
      getImageAsBase64: (filePath: string) => Promise<string>;
    }
  }
}


// --- Types ---
type ProjectStatus = 'Idea' | 'Working' | 'Finished';
type Tab = 'dashboard' | 'editor' | 'analytics' | 'settings' | 'roadmap' | 'vault';
type AmbientSound = 'none' | 'rain' | 'hum' | 'static';

interface Project {
  id: string;
  name: string;
  language: string;
  status: ProjectStatus;
  progress: number;
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; 
  children?: FileNode[];
  isOpen?: boolean;
}

interface RoadmapPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  description: string;
  details: string; 
  objectives: { id: string; text: string; done: boolean }[];
  dependsOn?: string[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ActivityLog {
  id: string;
  action: string;
  target: string;
  timestamp: Date;
}

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
}

interface CommandAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
}

// --- Initial Data ---
const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'Neural Net Visualizer', language: 'Python', status: 'Working', progress: 65 },
  { id: '2', name: 'Portfolio V3', language: 'React', status: 'Finished', progress: 100 },
  { id: '3', name: 'Crypto Bot', language: 'Node.js', status: 'Idea', progress: 0 },
];

const INITIAL_FILES: FileNode[] = [];

const INITIAL_PHASES: RoadmapPhase[] = [
  {
    id: '1', 
    name: 'Concept & Design', 
    status: 'completed', 
    description: 'Initial planning phase.',
    details: '## Core Requirements\n- Must use Electron for window management.\n- Dark mode is mandatory.',
    objectives: [
      { id: 'o1', text: 'Create high-fidelity mockups', done: true },
      { id: 'o2', text: 'Select tech stack', done: true }
    ]
  },
  {
    id: '2', 
    name: 'Core Development', 
    status: 'active', 
    description: 'Building the engine.',
    details: 'Currently working on the file system integration.',
    objectives: [
      { id: 'o4', text: 'Implement file tree recursion', done: true },
      { id: 'o5', text: 'Connect Monaco Editor', done: false }
    ]
  }
];

const INITIAL_SNIPPETS: Snippet[] = [
  {
    id: 's1',
    title: 'React Functional Component',
    language: 'React',
    code: "const Component = () => {\n  return (\n    <div>\n      Hello World\n    </div>\n  );\n};"
  },
  {
    id: 's2',
    title: 'Python API Request',
    language: 'Python',
    code: "import requests\n\ndef fetch_data(url):\n    response = requests.get(url)\n    return response.json()"
  },
  {
    id: 's3',
    title: 'Tailwind Grid Layout',
    language: 'CSS',
    code: '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">\n  {/* Items here */}\n</div>'
  }
];

// --- Helper Components ---

const GlowButton = ({ children, onClick, icon: Icon, variant = 'primary', className = '', type = 'button' }: any) => (
  <button 
    type={type}
    onClick={onClick}
    className={`
      relative group flex items-center justify-center gap-2 px-4 py-2 font-mono text-sm transition-all duration-300 rounded-sm
      ${variant === 'primary' 
        ? 'bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-red-400 hover:border-red-900/30'}
      ${className}
    `}
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
);

// Updated BarChart to accept dynamic data
const BarChart = ({ data }: { data: { label: string, value: number }[] }) => {
  const max = Math.max(...data.map(d => d.value), 10); // Minimum scale of 10
  
  return (
    <div className="h-40 flex items-end gap-2 justify-between px-2">
      {data.map((item, i) => (
        <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-crosshair">
           <div 
             className="w-full bg-red-900/30 border-t border-red-500/50 rounded-t-sm transition-all duration-500 hover:bg-red-600 relative group-hover:shadow-[0_0_10px_rgba(220,38,38,0.5)]"
             style={{ height: `${(item.value / max) * 100}%`, minHeight: '4px' }}
           >
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
               {item.value} Actions
             </div>
           </div>
           <div className="text-[10px] text-neutral-600 font-mono">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

const LanguageDonut = () => {
  return (
    <div className="relative w-32 h-32 rounded-full border-4 border-neutral-900 flex items-center justify-center">
      {/* CSS Conic Gradient for the chart */}
      <div 
        className="absolute inset-0 rounded-full opacity-80"
        style={{
          background: `conic-gradient(
            #ef4444 0% 45%,
            #3b82f6 45% 75%,
            #eab308 75% 100%
          )`
        }}
      ></div>
      {/* Inner Cutout */}
      <div className="absolute inset-4 bg-neutral-950 rounded-full flex items-center justify-center flex-col z-10">
        <span className="text-2xl font-bold text-white">3</span>
        <span className="text-[10px] text-neutral-500 uppercase">Langs</span>
      </div>
    </div>
  );
};

const calculatePhaseProgress = (phase: RoadmapPhase) => {
  if (!phase.objectives || phase.objectives.length === 0) {
    if (phase.status === 'completed') return 100;
    return 0;
  }
  const completedObjectives = phase.objectives.filter(obj => obj.done).length;
  return Math.round((completedObjectives / phase.objectives.length) * 100);
};

const areDependenciesMet = (phase: RoadmapPhase, allPhases: RoadmapPhase[]) => {
  if (!phase.dependsOn || phase.dependsOn.length === 0) {
    return true;
  }
  return phase.dependsOn.every(depId => {
    const depPhase = allPhases.find(p => p.id === depId);
    return depPhase && depPhase.status === 'completed';
  });
};

const getIncompleteDependencies = (phase: RoadmapPhase, allPhases: RoadmapPhase[]) => {
  if (!phase.dependsOn || phase.dependsOn.length === 0) {
    return [];
  }
  return phase.dependsOn
    .map(depId => allPhases.find(p => p.id === depId))
    .filter(depPhase => depPhase && depPhase.status !== 'completed')
    .map(depPhase => depPhase.name);
};

const getIncomingDependencies = (phaseId: string, allPhases: RoadmapPhase[]) => {
  return allPhases
    .filter(p => p.dependsOn?.includes(phaseId))
    .map(p => p.name);
};

const getPhaseBorderColor = (phase: RoadmapPhase, allPhases: RoadmapPhase[], activePhaseId: string) => {
  if (activePhaseId === phase.id) {
    return 'border-red-500';
  }
  // Simplified as requested. No dependency based color coding for the main border.
  return 'border-neutral-800'; 
};

const RecursiveFileTree = ({ nodes, level = 0, onSelect, activeId }: { nodes: FileNode[], level?: number, onSelect: (node: FileNode) => void, activeId: string | null }) => {
  return (
    <>
      {nodes.map(node => (
        <div key={node.id} className="select-none">
          <div 
            className={`
              flex items-center gap-2 py-1 px-2 cursor-pointer transition-colors duration-200 border-l-2
              ${activeId === node.id ? 'border-red-500 bg-red-900/10 text-red-400' : 'border-transparent hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200'}
            `}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => onSelect(node)}
          >
            {node.type === 'folder' && (
              <span className="opacity-70">
                {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
            {node.type === 'folder' ? <Folder size={14} /> : <FileText size={14} />}
            <span className="text-sm font-mono truncate">{node.name}</span>
          </div>
          
          {node.type === 'folder' && node.isOpen && node.children && (
            <div className="ml-0">
              <RecursiveFileTree nodes={node.children} level={level + 1} onSelect={onSelect} activeId={activeId} />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES); 
  const [focusMode, setFocusMode] = useState(false);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null); 
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["System initialized..."]);
  
  // Real Analytics State
  // Pre-fill history with some random data so the chart isn't empty on first load
  const [activityHistory, setActivityHistory] = useState<Record<string, number>>(() => {
    const history: Record<string, number> = {};
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Random activity between 5 and 30 for demo purposes
      history[d.toISOString().split('T')[0]] = Math.floor(Math.random() * 25) + 5;
    }
    return history;
  });
  const [systemLogs, setSystemLogs] = useState<ActivityLog[]>([]);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // Settings
  const [username, setUsername] = useState("Dev_Unit_01");
  const [autoSave, setAutoSave] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hideDotFiles, setHideDotFiles] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Roadmap
  const [phases, setPhases] = useState<RoadmapPhase[]>(INITIAL_PHASES);
  const [activePhaseId, setActivePhaseId] = useState<string>(INITIAL_PHASES[1].id);
  const [draggedPhaseId, setDraggedPhaseId] = useState<string | null>(null);
  const [draggedObjectiveId, setDraggedObjectiveId] = useState<string | null>(null);

  // Vault
  const [snippets, setSnippets] = useState<Snippet[]>(INITIAL_SNIPPETS);
  const [activeSnippetId, setActiveSnippetId] = useState<string>(INITIAL_SNIPPETS[0].id);

  // Command Palette
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const cmdInputRef = useRef<HTMLInputElement>(null);

  // Ambient Systems
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');

  // Drag Drop
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Forms
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLang, setNewProjectLang] = useState('React');
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>('Idea');

  // --- CORE LOGIC & TRACKING ---

  useEffect(() => {
    const savedState = localStorage.getItem('project-os-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      setProjects(state.projects || INITIAL_PROJECTS);
      setFiles(state.files || INITIAL_FILES);
      setPhases(state.phases || INITIAL_PHASES);
      setSnippets(state.snippets || INITIAL_SNIPPETS);
      setUsername(state.username || "Dev_Unit_01");
      setAutoSave(state.autoSave !== undefined ? state.autoSave : true);
      setNotificationsEnabled(state.notificationsEnabled !== undefined ? state.notificationsEnabled : true);
      setHideDotFiles(state.hideDotFiles !== undefined ? state.hideDotFiles : true);
    }
  }, []);

  useEffect(() => {
    const state = {
      projects,
      files,
      phases,
      snippets,
      username,
      autoSave,
      notificationsEnabled,
      hideDotFiles
    };
    localStorage.setItem('project-os-state', JSON.stringify(state));
  }, [projects, files, phases, snippets, username, autoSave, notificationsEnabled, hideDotFiles]);

  const handleSaveFile = async () => {
    if (activeFile) {
      await window.electron.saveFile(activeFile.id, editorContent);
      showToast('File Saved', 'success');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFile, editorContent]);

  const handleOpenDirectory = async () => {
    const directory = await window.electron.openDirectory(hideDotFiles);
    if (directory) {
      setFiles(prevFiles => [...prevFiles, directory]);
    }
  };

  const recordActivity = (action: string, target: string) => {
    const today = new Date().toISOString().split('T')[0];
    setActivityHistory(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));

    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      target,
      timestamp: new Date()
    };
    setSystemLogs(prev => [newLog, ...prev].slice(0, 50)); 
  };

  useEffect(() => {
    const savedTime = localStorage.getItem('project_os_uptime');
    if (savedTime) setUptimeSeconds(parseInt(savedTime, 10));

    const interval = setInterval(() => {
      setUptimeSeconds(prev => {
        const newVal = prev + 1;
        localStorage.setItem('project_os_uptime', newVal.toString());
        return newVal;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedUptime = (uptimeSeconds / 3600).toFixed(1);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    if (!notificationsEnabled) return;
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Handle Ambient Sound Changes
  useEffect(() => {
    if (ambientSound !== 'none') {
      addLog(`Initializing Audio Engine: ${ambientSound}.mp3...`);
      // In a real app, this is where you would instantiate new Audio()
    } else {
      addLog("Audio Engine: Standby");
    }
  }, [ambientSound]);

  // --- COMMAND PALETTE LOGIC ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsCmdPaletteOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isCmdPaletteOpen && cmdInputRef.current) {
      cmdInputRef.current.focus();
    }
  }, [isCmdPaletteOpen]);

  const commands: CommandAction[] = [
    { id: '1', label: 'Go to Dashboard', icon: Layout, action: () => setActiveTab('dashboard') },
    { id: '2', label: 'Open Editor', icon: Code, action: () => setActiveTab('editor') },
    { id: '3', label: 'Open Roadmap', icon: Calendar, action: () => setActiveTab('roadmap') },
    { id: '4', label: 'Open The Vault', icon: Library, action: () => setActiveTab('vault') },
    { id: '5', label: 'Toggle Focus Mode', icon: Maximize2, action: () => toggleFocusMode() },
    { id: '6', label: 'Create New Project', icon: Plus, action: () => setIsModalOpen(true) },
    { id: '7', label: 'Play Cyber Rain', icon: Music, action: () => setAmbientSound('rain') },
    { id: '8', label: 'Stop Ambient Sound', icon: VolumeX, action: () => setAmbientSound('none') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  const executeCommand = (cmd: CommandAction) => {
    cmd.action();
    setIsCmdPaletteOpen(false);
    setCmdQuery('');
    showToast(`Executed: ${cmd.label}`, 'info');
  };

  // --- ANALYTICS CALCULATIONS ---

  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.language] = (counts[p.language] || 0) + 1;
    });
    const total = projects.length;
    return Object.entries(counts).map(([lang, count]) => ({
      lang,
      percent: Math.round((count / total) * 100),
      color: lang === 'React' ? '#ef4444' : lang === 'Python' ? '#3b82f6' : '#eab308'
    }));
  }, [projects]);

  const heatmapGrid = useMemo(() => {
    const grid = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (52 * 7));

    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * 7) + d);
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = activityHistory[dateStr] || 0;
        
        let intensity = 0;
        if (count > 0) intensity = 0.2;
        if (count > 5) intensity = 0.5;
        if (count > 10) intensity = 0.8;
        if (count > 20) intensity = 1.0;

        week.push({ date: dateStr, intensity });
      }
      grid.push(week);
    }
    return grid;
  }, [activityHistory]);

  // Derived Weekly Stats for Bar Chart
  const weeklyStats = useMemo(() => {
    const stats = [];
    const today = new Date();
    let totalActions = 0;
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const value = activityHistory[dateStr] || 0;
      totalActions += value;
      stats.push({
        label: i === 0 ? 'Today' : `Day -${i}`,
        value
      });
    }
    
    const avg = Math.round(totalActions / 7);
    const trend = '+12%'; // Mock calculation for now, could be real if we had prev week data
    
    return { data: stats, avg, trend };
  }, [activityHistory]);

  // --- COMPONENT LOGIC ---

  const handleFileSelect = async (file: FileNode) => {
    if (file.type === 'folder') {
      const toggleNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === file.id) return { ...node, isOpen: !node.isOpen };
          if (node.children) return { ...node, children: toggleNode(node.children) };
          return node;
        });
      };
      setFiles(toggleNode(files));
    } else {
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (imageExtensions.includes(extension)) {
        const imageBase64 = await window.electron.getImageAsBase64(file.id);
        setActiveImage(imageBase64);
        setActiveFile(file);
        setEditorContent('');
      } else {
        const content = await window.electron.getFileContent(file.id);
        setActiveFile(file);
        setActiveImage(null);
        setEditorContent(content);
      }
      setActiveTab('editor');
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      language: newProjectLang,
      status: newProjectStatus,
      progress: 0
    };
    setProjects([...projects, newProject]);

    const newFolder: FileNode = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      type: 'folder',
      isOpen: true,
      children: [
        {
          id: `file-${Date.now()}`,
          name: newProjectLang === 'Python' ? 'main.py' : 'index.js',
          type: 'file',
          content: newProjectLang === 'Python' ? "print('Hello World')" : "console.log('Hello World');"
        },
        {
          id: `readme-${Date.now()}`,
          name: 'README.md',
          type: 'file',
          content: `# ${newProjectName}\nCreated: ${new Date().toLocaleDateString()}`
        }
      ]
    };
    setFiles(prev => [...prev, newFolder]);

    recordActivity("Created Project", newProjectName);
    setIsModalOpen(false);
    setNewProjectName('');
    addLog(`Created new project: ${newProjectName}`);
    showToast("Project Initialized Successfully", "success");
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const projName = projects.find(p => p.id === id)?.name || "Unknown";
    setProjects(prev => prev.filter(p => p.id !== id));
    recordActivity("Deleted Project", projName);
    addLog(`Deleted project ${id}`);
    showToast("Project Deleted", "error");
  };



  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const path = droppedFiles[0].path;
      const isDirectory = await window.electron.isDirectory(path);
      if (isDirectory) {
        const directory = await window.electron.openDroppedDirectory(path, hideDotFiles);
        setFiles(prevFiles => [...prevFiles, directory]);
        showToast(`Added directory: ${path}`, 'info');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
    if (Math.random() > 0.9) {
      recordActivity("Code Edit", activeFile?.name || "file");
    }
  };

  const toggleFocusMode = () => {
    if (!focusMode) {
      setActiveTab('editor');
      showToast("Focus Mode Activated", "info");
    } else {
      showToast("Focus Mode Deactivated", "info");
    }
    setFocusMode(!focusMode);
  };

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-4), msg]);
  };

  // --- Roadmap Logic ---
  const handleAddPhase = () => {
    const newPhase: RoadmapPhase = {
      id: Date.now().toString(),
      name: 'New Roadmap Phase',
      status: 'pending',
      description: 'Short description here...',
      details: '# Phase Details\nAdd your detailed notes, requirements, and technical specifications here.',
      objectives: []
    };
    setPhases([...phases, newPhase]);
    setActivePhaseId(newPhase.id);
    addLog("Added new roadmap phase.");
    showToast("New Phase Created", "info");
  };

  const updatePhase = (id: string, field: keyof RoadmapPhase, value: any) => {
    setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleObjective = (phaseId: string, objId: string) => {
    const phase = phases.find(p => p.id === phaseId); 
    if (!phase) return; 
    
    const newObjectives = phase.objectives.map(o => 
      o.id === objId ? { ...o, done: !o.done } : o
    );
    updatePhase(phaseId, 'objectives', newObjectives);
  };

  const addObjective = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return; 
    
    const newObj = { id: Date.now().toString(), text: 'New Objective', done: false };
    updatePhase(phaseId, 'objectives', [...phase.objectives, newObj]);
  };

  const handleDeletePhase = (id: string) => {
    setPhases(phases.filter(p => p.id !== id));
    if (activePhaseId === id) setActivePhaseId(phases[0]?.id || '');
    showToast("Phase Deleted", "error");
  };

  const handlePhaseDrop = (e: React.DragEvent, targetPhaseId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('phaseId');
    if (!draggedId || draggedId === targetPhaseId) return;

    const currentPhases = [...phases];
    const draggedPhaseIndex = currentPhases.findIndex(p => p.id === draggedId);
    const targetPhaseIndex = currentPhases.findIndex(p => p.id === targetPhaseId);

    if (draggedPhaseIndex === -1 || targetPhaseIndex === -1) return;

    const [removed] = currentPhases.splice(draggedPhaseIndex, 1);
    currentPhases.splice(targetPhaseIndex, 0, removed);

    setPhases(currentPhases);
    setDraggedPhaseId(null);
  };

  const handleObjectiveDrop = (e: React.DragEvent, targetObjectiveId: string, phaseId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('objectiveId');
    if (!draggedId || draggedId === targetObjectiveId) return;

    const phaseToUpdate = phases.find(p => p.id === phaseId);
    if (!phaseToUpdate) return;

    const currentObjectives = [...phaseToUpdate.objectives];
    const draggedIndex = currentObjectives.findIndex(o => o.id === draggedId);
    const targetIndex = currentObjectives.findIndex(o => o.id === targetObjectiveId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = currentObjectives.splice(draggedIndex, 1);
    currentObjectives.splice(targetIndex, 0, removed);

    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        return { ...p, objectives: currentObjectives };
      }
      return p;
    });

    setPhases(updatedPhases);
    setDraggedObjectiveId(null);
  };

  // --- Vault Logic ---
  const handleCopySnippet = (code: string) => {
    // In a real app this uses navigator.clipboard, but we use a mock for the iframe
    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast("Snippet Copied to Clipboard", "success");
  };

  const handleAddSnippet = () => {
    const newSnippet: Snippet = {
      id: Date.now().toString(),
      title: 'New Snippet',
      language: 'JavaScript',
      code: '// Paste your code here'
    };
    setSnippets([...snippets, newSnippet]);
    setActiveSnippetId(newSnippet.id);
    showToast("New Snippet Created", "info");
  };

  const updateSnippet = (id: string, field: keyof Snippet, value: string) => {
    setSnippets(snippets.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSnippet = (id: string) => {
    setSnippets(snippets.filter(s => s.id !== id));
    if (activeSnippetId === id) setActiveSnippetId(snippets[0]?.id || '');
    showToast("Snippet Deleted", "error");
  };

  // Custom Scrollbar Style Injection
  const ScrollbarStyles = () => (
    <style>{`
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: #0a0a0a; }
      ::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; border: 2px solid #0a0a0a; }
      ::-webkit-scrollbar-thumb:hover { background: #7f1d1d; }
      ::-webkit-scrollbar-corner { background: transparent; }
      * { scrollbar-width: thin; scrollbar-color: #262626 #0a0a0a; }
    `}</style>
  );

  const containerClass = `relative w-full h-screen bg-black overflow-hidden flex text-neutral-200 font-sans selection:bg-red-900 selection:text-white ${isDragging ? 'border-2 border-dashed border-red-500' : ''}`;

  const activePhase = phases.find(p => p.id === activePhaseId) || phases[0];
  const activeSnippet = snippets.find(s => s.id === activeSnippetId) || snippets[0];

  const hasUnmetDependencies = activePhase && !areDependenciesMet(activePhase, phases);

  return (
    <div
      className={containerClass}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <ScrollbarStyles />
      
      {/* COMMAND PALETTE */}
      {isCmdPaletteOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-32 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-neutral-950 border border-red-900/50 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-neutral-800 gap-3">
              <Search className="text-neutral-500" size={20} />
              <input 
                ref={cmdInputRef}
                className="bg-transparent outline-none text-lg text-white font-mono w-full placeholder:text-neutral-600"
                placeholder="Type a command..."
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
              />
              <div className="text-xs text-neutral-600 font-mono border border-neutral-800 rounded px-1.5 py-0.5">ESC</div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-neutral-600 text-sm font-mono">No commands found.</div>
              ) : (
                filteredCommands.map(cmd => (
                  <button 
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-900/10 hover:text-red-400 group transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 text-neutral-300 group-hover:text-red-400">
                      <cmd.icon size={16} />
                      <span className="font-mono text-sm">{cmd.label}</span>
                    </div>
                    {cmd.shortcut && <span className="text-xs text-neutral-600 font-mono">{cmd.shortcut}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS CONTAINER */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto min-w-[250px] p-4 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] border flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-neutral-900 border-green-900 text-green-400' : toast.type === 'error' ? 'bg-neutral-900 border-red-900 text-red-400' : 'bg-neutral-900 border-blue-900 text-blue-400'}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Bell size={18} />}
            <span className="text-xs font-mono font-bold">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* NEW PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-red-900/50 w-full max-w-md p-6 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-mono text-xl text-white font-bold">NEW_PROJECT</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-red-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-500 mb-1 uppercase">Project Name</label>
                <input autoFocus type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-500 rounded p-2 text-white outline-none font-mono" placeholder="e.g. Doomsday Device" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-500 mb-1 uppercase">Language</label>
                  <select value={newProjectLang} onChange={(e) => setNewProjectLang(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-500 rounded p-2 text-white outline-none font-mono">
                    <option>React</option><option>Python</option><option>Node.js</option><option>Rust</option><option>C++</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-500 mb-1 uppercase">Status</label>
                  <select value={newProjectStatus} onChange={(e) => setNewProjectStatus(e.target.value as ProjectStatus)} className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-500 rounded p-2 text-white outline-none font-mono">
                    <option value="Idea">Idea</option><option value="Working">Working</option><option value="Finished">Finished</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <GlowButton type="submit" className="flex-1" icon={CheckCircle2}>INITIALIZE</GlowButton>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-transparent hover:bg-neutral-900 text-neutral-500 rounded font-mono text-sm transition-colors">CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className={`w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col transition-all duration-500 flex-shrink-0 ${focusMode ? '-ml-64 opacity-0' : 'ml-0 opacity-100'}`}>
        <div className="h-14 border-b border-neutral-800 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_10px_red]"></div>
          <span className="font-mono font-bold tracking-wider text-red-500">PROJECT_OS</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-6">
            <h3 className="text-xs font-bold text-neutral-600 mb-2 uppercase tracking-widest">Modules</h3>
            <div className="space-y-1">
              <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-red-900/20 text-red-500' : 'hover:bg-neutral-900 text-neutral-400'}`}><Layout size={16} /> Dashboard</button>
              <button onClick={() => setActiveTab('editor')} className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 transition-all ${activeTab === 'editor' ? 'bg-red-900/20 text-red-500' : 'hover:bg-neutral-900 text-neutral-400'}`}><Code size={16} /> Code Editor</button>
              <button onClick={() => setActiveTab('analytics')} className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 transition-all ${activeTab === 'analytics' ? 'bg-red-900/20 text-red-500' : 'hover:bg-neutral-900 text-neutral-400'}`}><Activity size={16} /> Analytics</button>
              <button onClick={() => setActiveTab('roadmap')} className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 transition-all ${activeTab === 'roadmap' ? 'bg-red-900/20 text-red-500' : 'hover:bg-neutral-900 text-neutral-400'}`}><Calendar size={16} /> Roadmap</button>
              <button onClick={() => setActiveTab('vault')} className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 transition-all ${activeTab === 'vault' ? 'bg-red-900/20 text-red-500' : 'hover:bg-neutral-900 text-neutral-400'}`}><Library size={16} /> The Vault</button>
            </div>
          </div>
          <div className="px-2">
            <h3 className="px-2 text-xs font-bold text-neutral-600 mb-2 uppercase tracking-widest">Explorer</h3>
            <RecursiveFileTree nodes={files} onSelect={handleFileSelect} activeId={activeFile?.id || null} />
          </div>
        </div>
        <div className="h-14 border-t border-neutral-800 flex items-center px-4 justify-between bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-neutral-400">System Online</span>
          </div>
          <Settings size={16} className={`cursor-pointer transition-colors ${activeTab === 'settings' ? 'text-red-500' : 'text-neutral-500 hover:text-red-500'}`} onClick={() => setActiveTab('settings')} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col bg-neutral-950 relative min-w-0 overflow-hidden">
        <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950/80 backdrop-blur-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-mono text-neutral-300 uppercase">
              {activeTab === 'dashboard' ? 'COMMAND_CENTER' : 
               activeTab === 'editor' ? 'EDITOR_VIEW' : 
               activeTab === 'analytics' ? 'SYSTEM_ANALYTICS' : 
               activeTab === 'roadmap' ? 'PROJECT_ROADMAP' : 
               activeTab === 'vault' ? 'CODE_VAULT' : 'SYSTEM_CONFIG'}
            </h2>
            {activeTab === 'editor' && activeFile && <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400 border border-neutral-700">{activeFile.name}</span>}
          </div>
          <div className="flex items-center gap-3">
            {/* AMBIENT SOUND WIDGET */}
            <div className="flex items-center gap-2 mr-2 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-full">
              {ambientSound === 'none' ? <Volume2 size={14} className="text-neutral-500" /> : <Music size={14} className="text-red-500 animate-pulse" />}
              <select 
                value={ambientSound}
                onChange={(e) => setAmbientSound(e.target.value as AmbientSound)}
                className="bg-transparent border-none outline-none text-xs font-mono text-neutral-400 w-20 cursor-pointer"
              >
                <option value="none">Silence</option>
                <option value="rain">Cyber Rain</option>
                <option value="hum">Server Hum</option>
                <option value="static">Static</option>
              </select>
            </div>

            <GlowButton icon={Save} variant="secondary" onClick={handleSaveFile}>SAVE</GlowButton>
            <GlowButton icon={Folder} variant="secondary" onClick={handleOpenDirectory}>OPEN DIRECTORY</GlowButton>
            <GlowButton icon={Maximize2} variant="secondary" onClick={toggleFocusMode}>{focusMode ? 'EXIT FOCUS' : 'FRAME MODE'}</GlowButton>
            <GlowButton icon={Plus} onClick={() => setIsModalOpen(true)}>NEW PROJECT</GlowButton>
          </div>
        </header>

        <main className={`flex-1 min-w-0 overflow-hidden flex flex-col ${activeTab === 'roadmap' ? 'p-0' : 'p-6 overflow-y-auto'}`}>
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg">
                  <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Total Projects</div>
                  <div className="text-2xl font-mono text-red-500">{projects.length}</div>
                </div>
                <div className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg">
                  <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Total Uptime</div>
                  <div className="text-2xl font-mono text-white">{formattedUptime} <span className="text-sm text-neutral-500">hrs</span></div>
                </div>
                <div className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg flex flex-col justify-center">
                   <div className="flex justify-between items-end mb-2">
                     <div className="text-xs text-neutral-500 uppercase tracking-wider">Activity</div>
                     <div className="text-xs text-red-400">Last 52 Weeks</div>
                   </div>
                   {/* FUNCTIONAL HEATMAP */}
                   <div className="h-full w-full flex gap-1 overflow-hidden opacity-80">
                      {heatmapGrid.map((week, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          {week.map((day, j) => (
                            <div 
                              key={j} 
                              title={day.date}
                              className="w-2 h-2 rounded-sm transition-colors duration-500"
                              style={{ 
                                backgroundColor: day.intensity === 0 ? '#171717' : `rgba(220, 38, 38, ${day.intensity})`
                              }} 
                            />
                          ))}
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {(['Idea', 'Working', 'Finished'] as const).map(status => (
                  <div key={status} 
                    className={`flex flex-col h-full rounded-lg transition-colors duration-200 ${draggedProject ? 'bg-neutral-900/20 border-neutral-800' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-2">
                      <h3 className="font-mono text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'Working' ? 'bg-red-500' : status === 'Finished' ? 'bg-neutral-600' : 'bg-neutral-700'}`}></div>
                        {status}
                      </h3>
                      <span className="text-xs text-neutral-600 font-mono">{projects.filter(p => p.status === status).length}</span>
                    </div>
                    <div className="space-y-3 flex-1 min-h-[200px] p-2 rounded-lg bg-neutral-900/20 border border-neutral-800/50">
                      {projects.filter(p => p.status === status).map(project => (
                        <div key={project.id} draggable onDragStart={(e) => { setDraggedProject(project.id); e.dataTransfer.setData('text/plain', project.id); }} className="group relative p-4 bg-neutral-950 border border-neutral-800 hover:border-red-900/60 rounded cursor-grab active:cursor-grabbing transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/10">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-bold text-neutral-200 group-hover:text-red-400 transition-colors">{project.name}</span>
                            <div className="flex gap-2">
                              <MoreVertical size={14} className="text-neutral-600 hover:text-white cursor-pointer" />
                              <Trash2 size={14} className="text-neutral-600 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDeleteProject(project.id, e)} />
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">{project.language}</span>
                            {status === 'Working' && <button className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-white" onClick={() => addLog(`Starting ${project.name}...`)}><Play size={14} /></button>}
                          </div>
                          {status === 'Working' && <div className="mt-3 h-1 w-full bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-red-600" style={{ width: `${project.progress}%` }}></div></div>}
                        </div>
                      ))}
                      <button onClick={() => { setNewProjectStatus(status); setIsModalOpen(true); }} className="w-full py-3 border border-dashed border-neutral-800 text-neutral-600 hover:text-red-500 hover:border-red-900/50 rounded flex items-center justify-center gap-2 text-sm transition-all"><Plus size={14} /> Add {status}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDITOR VIEW */}
          {activeTab === 'editor' && (
            <div className="h-full flex flex-col animate-in fade-in duration-300">
              {activeImage ? (
                <div className="flex-1 flex items-center justify-center">
                  <img src={activeImage} alt={activeFile?.name} className="max-w-full max-h-full" />
                </div>
              ) : activeFile ? (
                <div className="flex-1 bg-neutral-950 rounded-lg border border-neutral-800 p-0 font-mono text-sm relative overflow-hidden flex">
                  <div className="w-12 bg-neutral-900/50 border-r border-neutral-800 flex flex-col items-end pr-3 pt-4 text-neutral-600 select-none">
                    {Array.from({length: editorContent.split('\n').length}).map((_, i) => <div key={i} className="leading-6 text-xs">{i+1}</div>)}
                  </div>
                  <textarea
                    className="flex-1 bg-transparent text-neutral-300 p-4 leading-6 outline-none resize-none font-mono selection:bg-red-900/50"
                    spellCheck={false}
                    value={editorContent}
                    onChange={handleEditorChange}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-neutral-600 font-mono">
                  <div>
                    <p>Open a directory to get started</p>
                    <p className="text-sm text-neutral-700">or select a file from the explorer</p>
                  </div>
                </div>
              )}
              <div className="h-32 mt-4 bg-black border border-neutral-800 rounded-lg p-3 font-mono text-xs text-neutral-400 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2 border-b border-neutral-800 pb-1">
                  <Terminal size={12} /> <span className="font-bold">TERMINAL</span>
                </div>
                <div className="space-y-1">
                  {terminalLogs.map((log, i) => (
                    <p key={i}><span className="text-neutral-600 mr-2">{'>'}</span>{log}</p>
                  ))}
                  <div className="animate-pulse text-red-500 ml-3">_</div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-mono text-neutral-200">CODE_FREQUENCY</h3>
                      <p className="text-xs text-neutral-500">Weekly keystroke density</p>
                    </div>
                    {/* Updated BarChart Component Usage */}
                    <BarChart data={weeklyStats.data} />
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-neutral-500 font-mono border-t border-neutral-900 pt-4">
                     <span>Avg: {weeklyStats.avg} actions/day</span>
                     <span className="text-red-400">{weeklyStats.trend} from last week</span>
                  </div>
                </div>
                <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-mono text-neutral-200">LANGUAGE_DISTRIBUTION</h3>
                      <p className="text-xs text-neutral-500">Project composition</p>
                    </div>
                    <PieChart className="text-red-500" />
                  </div>
                  <div className="flex items-center gap-8 justify-center h-40">
                    <LanguageDonut />
                    <div className="space-y-2 text-xs font-mono">
                      {languageStats.map(stat => (
                        <div key={stat.lang} className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stat.color }}></div> 
                           <span className="text-neutral-300">{stat.lang} ({stat.percent}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-lg">
                <h3 className="text-lg font-mono text-neutral-200 mb-4">ACTIVITY_LOG</h3>
                <div className="space-y-2 font-mono text-sm max-h-[300px] overflow-y-auto">
                  {systemLogs.length === 0 && <div className="text-neutral-600 italic">No activity recorded yet. Start working!</div>}
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-neutral-900/30 rounded border border-neutral-900 hover:border-red-900/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Activity size={14} className="text-red-500" />
                        <span className="text-neutral-300">
                          <span className="text-neutral-500 mr-2">{log.action}:</span> 
                          {log.target}
                        </span>
                      </div>
                      <span className="text-neutral-600 text-xs">
                        {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* ROADMAP VIEW */}
          {activeTab === 'roadmap' && (
            <div className="h-full flex flex-col animate-in fade-in duration-500 gap-0 overflow-hidden">
              <div className="flex-shrink-0 bg-neutral-950 border-b border-neutral-800 flex flex-col w-full">
                 <div className="px-6 py-2 border-b border-neutral-900 bg-neutral-950 text-[10px] text-neutral-500 uppercase font-mono flex items-center justify-between">
                    <span>Timeline Progression</span>
                    <div className="flex items-center gap-4">
                        <span className="text-neutral-700">Scroll for more →</span>
                      </div>
                 </div>
                 <div className="h-60 w-full overflow-x-auto p-6 flex items-center gap-8 custom-scrollbar">
                    {phases.map((phase, index) => (
                                            <React.Fragment key={phase.id}>
                                              <div 
                                                draggable
                                                onDragStart={(e) => {
                                                  setDraggedPhaseId(phase.id);
                                                  e.dataTransfer.setData('phaseId', phase.id);
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => handlePhaseDrop(e, phase.id)}
                                                onClick={() => setActivePhaseId(phase.id)} 
                                                className={`w-72 h-40 flex-shrink-0 relative rounded-lg border-2 p-4 cursor-grab transition-all duration-300 flex flex-col justify-between ${getPhaseBorderColor(phase, phases, activePhaseId)} ${activePhaseId === phase.id ? 'bg-neutral-900/80 shadow-[0_0_20px_rgba(220,38,38,0.2)] scale-100 z-10' : 'bg-neutral-900/30 hover:bg-neutral-900/50 scale-95 opacity-80 hover:opacity-100'} ${draggedPhaseId === phase.id ? 'opacity-50 border-dashed' : ''}`}
                                              >
                                                {/* Lock icon overlay for unmet dependencies */}
                                                {!areDependenciesMet(phase, phases) && (
                                                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                                                    <Lock size={48} className="text-red-500" />
                                                  </div>
                                                )}
                                                 <div className="flex justify-between items-start">
                                                   <div className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${phase.status === 'completed' ? 'text-green-400 border-green-900 bg-green-900/20' : phase.status === 'active' ? 'text-red-400 border-red-900 bg-red-900/20' : 'text-neutral-500 border-neutral-800 bg-neutral-800'}`}>{phase.status}</div>
                                                   {activePhaseId === phase.id && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></div>}
                                                 </div>
                                                 <div className="mt-2">
                                                   <h4 className={`font-mono font-bold text-sm truncate ${activePhaseId === phase.id ? 'text-white' : 'text-neutral-400'}`}>{phase.name}</h4>
                                                   <p className="text-xs text-neutral-600 truncate mt-1">{phase.description}</p>
                                                 </div>
                                                 <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden mt-3">
                                                   <div 
                                                     className={`h-full ${calculatePhaseProgress(phase) === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                                                     style={{ width: `${calculatePhaseProgress(phase)}%` }}
                                                   ></div>
                                                 </div>
                                              </div>
                                              {index < phases.length - 1 && <div className="text-neutral-800 flex-shrink-0"><ArrowRight size={24} /></div>}
                                            </React.Fragment>
                    ))}
                    <button onClick={handleAddPhase} className="w-16 h-40 flex-shrink-0 rounded-lg border-2 border-dashed border-neutral-800 hover:border-red-900 hover:text-red-500 text-neutral-700 flex items-center justify-center transition-all ml-4 mr-6"><Plus size={24} /></button>
                 </div>
              </div>

              <div className="flex-1 flex gap-6 min-h-0 overflow-hidden px-6 py-6 w-full">
                <div className="flex-1 bg-neutral-900/20 border border-neutral-800 rounded-lg flex flex-col overflow-hidden min-w-0">
                   <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex flex-col gap-2 flex-shrink-0">
                     <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-mono uppercase"><FileEdit size={12} /> Phase Configuration</div>
                     <div className="flex gap-4">
                       <div className="flex-1">
                          <label className="text-[10px] text-neutral-600 uppercase font-mono block mb-1">Phase Name</label>
                          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 focus-within:border-red-500/50 transition-colors">
                            <Type size={14} className="text-neutral-500" />
                            <input type="text" value={activePhase.name} onChange={(e) => { const val = e.target.value; setPhases(phases.map(p => p.id === activePhase.id ? { ...p, name: val } : p)); }} className="bg-transparent border-none outline-none text-sm text-white font-mono w-full" />
                          </div>
                       </div>
                       <div className="flex-[2]">
                          <label className="text-[10px] text-neutral-600 uppercase font-mono block mb-1">Short Description</label>
                          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 focus-within:border-red-500/50 transition-colors">
                            <AlignLeft size={14} className="text-neutral-500" />
                            <input type="text" value={activePhase.description} onChange={(e) => { const val = e.target.value; setPhases(phases.map(p => p.id === activePhase.id ? { ...p, description: val } : p)); }} className="bg-transparent border-none outline-none text-sm text-neutral-400 font-mono w-full" />
                          </div>
                       </div>
                     </div>
                   </div>
                   <textarea className="flex-1 bg-transparent p-6 outline-none text-neutral-300 font-mono text-sm resize-none leading-relaxed w-full custom-scrollbar" value={activePhase.details} onChange={(e) => { const val = e.target.value; setPhases(phases.map(p => p.id === activePhase.id ? { ...p, details: val } : p)); }} placeholder="# Write detailed phase specs here..." />
                </div>

                <div className="w-80 lg:w-96 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pb-4 custom-scrollbar">
                   <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-lg flex-shrink-0">
                      <label className="text-xs font-mono text-neutral-500 uppercase mb-2 block">Phase Status</label>
                      <select 
                        value={activePhase.status} 
                        onChange={(e) => { 
                          const val = e.target.value; 
                          updatePhase(activePhase.id, 'status', val);
                          recordActivity("Updated Phase Status", `${activePhase.name} -> ${val}`); 
                        }} 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-300 outline-none focus:border-red-500 font-mono"
                        disabled={hasUnmetDependencies} // Disable if dependencies are not met
                      >
                         <option value="pending">Pending</option>
                         <option value="active" disabled={hasUnmetDependencies}>Active</option> {/* Disable active if dependencies not met */}
                         <option value="completed">Completed</option>
                      </select>
                      {hasUnmetDependencies && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Unmet dependencies: {getIncompleteDependencies(activePhase, phases).join(', ')}
                        </p>
                      )}
                   </div>
                   <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-lg flex-shrink-0">
                      <label className="text-xs font-mono text-neutral-500 uppercase mb-2 block">Dependencies</label>
                      <p className="text-xs text-neutral-500 mb-2">This phase cannot start until the selected phases are complete.</p>
                      <select
                        multiple
                        value={activePhase.dependsOn || []}
                        onChange={(e) => {
                          const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                          updatePhase(activePhase.id, 'dependsOn', selectedIds);
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-300 outline-none focus:border-red-500 font-mono h-24"
                      >
                        {phases
                          .filter(p => p.id !== activePhase.id) // Can't depend on itself
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {activePhase.dependsOn && activePhase.dependsOn.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-xs font-mono text-neutral-500 uppercase">Depends on:</h4>
                          <ul className="list-disc list-inside text-xs text-neutral-400">
                            {activePhase.dependsOn.map(id => {
                              const dep = phases.find(p => p.id === id);
                              return dep ? <li key={id}>{dep.name} <span className={`font-bold ${dep.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>({dep.status})</span></li> : null;
                            })}
                          </ul>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => updatePhase(activePhase.id, 'dependsOn', [])}
                        className="mt-4 w-full p-2 text-xs font-mono text-red-500 hover:bg-red-900/20 rounded border border-red-900/50"
                      >
                        Clear Dependencies
                      </button>
                    </div>
                    {getIncomingDependencies(activePhase.id, phases).length > 0 && (
                      <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-lg flex-shrink-0">
                        <h4 className="text-xs font-mono text-neutral-500 uppercase mb-2">Is a dependency for:</h4>
                        <ul className="list-disc list-inside text-xs text-neutral-400">
                          {getIncomingDependencies(activePhase.id, phases).map(phaseName => (
                            <li key={phaseName}>{phaseName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                   <div className="flex-1 bg-neutral-900/30 border border-neutral-800 rounded-lg p-4 flex flex-col min-h-[300px]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2"><ListTodo size={16} className="text-red-500" /><span className="text-sm font-bold text-neutral-300 font-mono">OBJECTIVES</span></div>
                        <button onClick={() => addObjective(activePhase.id)} className="text-neutral-500 hover:text-white"><Plus size={16} /></button>
                      </div>
                      <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                        {activePhase.objectives.length === 0 && <div className="text-center text-xs text-neutral-600 italic py-4">No objectives set.</div>}
                        {activePhase.objectives.map((obj) => (
                           <div 
                             key={obj.id}
                             draggable
                             onDragStart={(e) => {
                               setDraggedObjectiveId(obj.id);
                               e.dataTransfer.setData('objectiveId', obj.id);
                             }}
                             onDragOver={(e) => e.preventDefault()}
                             onDrop={(e) => handleObjectiveDrop(e, obj.id, activePhase.id)}
                             className={`flex items-start gap-3 p-2 hover:bg-neutral-900/50 rounded group cursor-grab ${draggedObjectiveId === obj.id ? 'opacity-50' : ''}`}
                           >
                              <div onClick={() => toggleObjective(activePhase.id, obj.id)} className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border cursor-pointer flex items-center justify-center transition-colors ${obj.done ? 'bg-red-500 border-red-500' : 'border-neutral-700 hover:border-red-500'}`}>{obj.done && <CheckCircle2 size={10} className="text-black" />}</div>
                              <input value={obj.text} onChange={(e) => { const val = e.target.value; setPhases(phases.map(p => p.id === activePhase.id ? { ...p, objectives: p.objectives.map(o => o.id === obj.id ? { ...o, text: val } : o) } : p)); }} className={`bg-transparent outline-none text-sm w-full font-mono cursor-inherit ${obj.done ? 'text-neutral-600 line-through' : 'text-neutral-300'}`} />
                           </div>
                        ))}
                      </div>
                   </div>
                   <button onClick={() => handleDeletePhase(activePhase.id)} className="p-3 border border-red-900/20 text-red-900 hover:bg-red-900/10 hover:text-red-500 rounded-lg text-xs font-mono flex items-center justify-center gap-2 transition-colors flex-shrink-0"><Trash2 size={14} /> Delete Phase</button>
                </div>
              </div>
            </div>
          )}

          {/* VAULT VIEW */}
          {activeTab === 'vault' && (
            <div className="h-full flex gap-6 animate-in fade-in duration-300 p-0 overflow-hidden">
              <div className="w-72 border-r border-neutral-800 bg-neutral-950 flex flex-col">
                <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
                  <span className="font-mono text-sm font-bold text-neutral-300">SNIPPET_LIB</span>
                  <button onClick={() => handleAddSnippet()} className="text-neutral-500 hover:text-white"><Plus size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {snippets.map(snippet => (
                    <div 
                      key={snippet.id}
                      onClick={() => setActiveSnippetId(snippet.id)}
                      className={`p-3 rounded-md cursor-pointer border transition-all ${activeSnippetId === snippet.id ? 'bg-red-900/10 border-red-900/50 text-white' : 'bg-transparent border-transparent text-neutral-400 hover:bg-neutral-900'}`}
                    >
                      <div className="font-bold text-xs font-mono mb-1">{snippet.title}</div>
                      <div className="text-[10px] uppercase text-neutral-600 bg-neutral-900 inline-block px-1 rounded">{snippet.language}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col min-w-0 pr-6 py-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-t-lg p-4 flex justify-between items-center">
                  <input 
                    className="bg-transparent text-white font-mono font-bold outline-none w-1/2"
                    value={activeSnippet.title}
                    onChange={(e) => updateSnippet(activeSnippet.id, 'title', e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleCopySnippet(activeSnippet.code)} className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"><Copy size={16} /></button>
                    <button onClick={() => deleteSnippet(activeSnippet.id)} className="p-2 hover:bg-red-900/20 rounded text-neutral-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="flex-1 bg-neutral-950 border-x border-b border-neutral-800 rounded-b-lg p-0 relative group">
                  <div className="absolute top-0 left-0 w-12 h-full border-r border-neutral-900 bg-neutral-900/30 flex flex-col items-center pt-4 text-neutral-700 text-xs font-mono select-none">
                    {activeSnippet.code.split('\n').map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
                  </div>
                  <textarea 
                    className="w-full h-full bg-transparent pl-16 pt-4 pr-4 text-sm font-mono text-neutral-300 outline-none resize-none leading-6"
                    value={activeSnippet.code}
                    onChange={(e) => updateSnippet(activeSnippet.id, 'code', e.target.value)}
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-8">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                 <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4"><User className="text-red-500" /><h3 className="text-lg font-mono text-neutral-200">USER_PROFILE</h3></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div><label className="block text-xs font-mono text-neutral-500 mb-2 uppercase">Display Name</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-500 rounded p-2 text-white outline-none font-mono" /></div>
                   <div><label className="block text-xs font-mono text-neutral-500 mb-2 uppercase">Role</label><div className="p-2 bg-neutral-900/50 border border-neutral-800 rounded text-neutral-400 font-mono text-sm">Full Stack Developer</div></div>
                 </div>
              </div>
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                 <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4"><Shield className="text-red-500" /><h3 className="text-lg font-mono text-neutral-200">SYSTEM_PREFERENCES</h3></div>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-neutral-900/20 rounded">
                      <div className="flex items-center gap-3"><Bell size={16} className="text-neutral-400" /><span className="text-sm font-mono text-neutral-300">System Notifications</span></div>
                      <div onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-10 h-5 rounded-full relative cursor-pointer border transition-colors ${notificationsEnabled ? 'bg-red-900/50 border-red-500/30' : 'bg-neutral-800 border-neutral-700'}`}><div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${notificationsEnabled ? 'right-1 bg-red-500 shadow-[0_0_10px_red]' : 'left-1 bg-neutral-500'}`}></div></div>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-neutral-900/20 rounded">
                      <div className="flex items-center gap-3"><Save size={16} className="text-neutral-400" /><span className="text-sm font-mono text-neutral-300">Auto-Save Projects</span></div>
                      <div onClick={() => setAutoSave(!autoSave)} className={`w-10 h-5 rounded-full relative cursor-pointer border transition-colors ${autoSave ? 'bg-red-900/50 border-red-500/30' : 'bg-neutral-800 border-neutral-700'}`}><div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${autoSave ? 'right-1 bg-red-500 shadow-[0_0_10px_red]' : 'left-1 bg-neutral-500'}`}></div></div>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-neutral-900/20 rounded">
                      <div className="flex items-center gap-3"><Folder size={16} className="text-neutral-400" /><span className="text-sm font-mono text-neutral-300">Hide Dotfiles</span></div>
                      <div onClick={() => setHideDotFiles(!hideDotFiles)} className={`w-10 h-5 rounded-full relative cursor-pointer border transition-colors ${hideDotFiles ? 'bg-red-900/50 border-red-500/30' : 'bg-neutral-800 border-neutral-700'}`}><div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${hideDotFiles ? 'right-1 bg-red-500 shadow-[0_0_10px_red]' : 'left-1 bg-neutral-500'}`}></div></div>
                   </div>
                 </div>
              </div>
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
                 <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4"><Save className="text-red-500" /><h3 className="text-lg font-mono text-neutral-200">DATA_MANAGEMENT</h3></div>
                 <div className="flex gap-4"><GlowButton icon={Download} className="flex-1">EXPORT DATA</GlowButton><GlowButton icon={Upload} variant="secondary" className="flex-1">IMPORT DATA</GlowButton></div>
                 <div className="mt-6 pt-6 border-t border-neutral-900"><button className="text-xs text-red-500 hover:text-red-400 flex items-center gap-2"><Trash2 size={12} /> DELETE ALL LOCAL DATA</button></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}