import { useState, useEffect } from 'react';
import { getAccessToken } from '../lib/firebase';
import { FileIcon, FolderIcon, HardDrive, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export function DriveFiles({ accessToken }: { accessToken: string | null }) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=20&orderBy=modifiedTime desc', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Error fetching files from Drive');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchFiles();
    }
  }, [accessToken]);

  if (!accessToken) {
    return (
      <div className="p-6 text-center text-slate-400">
        <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">Inicia sesión con Google para ver tus archivos de Drive.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0 sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-400" /> Mi Unidad
        </h3>
        <button 
          onClick={fetchFiles} 
          disabled={loading}
          className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={clsx("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {error ? (
        <div className="p-4 m-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
          {error}
        </div>
      ) : loading && files.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">Cargando archivos...</div>
      ) : files.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">No se encontraron archivos.</div>
      ) : (
        <div className="p-3 space-y-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors group cursor-pointer">
              <div className="p-2 rounded-lg bg-indigo-900/30 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                {file.mimeType.includes('folder') ? (
                  <FolderIcon className="w-4 h-4" />
                ) : (
                  <FileIcon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate font-medium">{file.name}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider mt-0.5">
                  {file.mimeType.split('.').pop()?.replace('vnd.google-apps.', '')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
