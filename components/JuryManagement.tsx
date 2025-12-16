import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase-client';
import { PencilSquareIcon, TrashIcon, CheckBadgeIcon, XMarkIcon, DownloadIcon, SearchIcon } from './shared/icons';
import Card from './shared/Card';

interface JuryRegistration {
  id: string;
  nume: string;
  prenume: string;
  email: string;
  telefon: string;
  profesie: string;
  organizatie: string;
  experienta: string;
  domeniu_expertiza: string;
  ani_experienta: number;
  linkedin_url?: string;
  motivatie: string;
  foto_url?: string;
  status: string;
  nota_admin?: string;
  created_at: string;
  updated_at: string;
}

type StatusFilter = 'all' | 'in_asteptare' | 'aprobat' | 'respins';

const JuryManagement: React.FC = () => {
  const [registrations, setRegistrations] = useState<JuryRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<JuryRegistration>>({});
  const [selectedRegistration, setSelectedRegistration] = useState<JuryRegistration | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inscrieri_jurati')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('inscrieri_jurati')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setRegistrations(prev =>
        prev.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg)
      );
    } catch (err: any) {
      alert('Eroare la actualizare status: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți această înscriere?')) return;

    try {
      const { error } = await supabase
        .from('inscrieri_jurati')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRegistrations(prev => prev.filter(reg => reg.id !== id));
    } catch (err: any) {
      alert('Eroare la ștergere: ' + err.message);
    }
  };

  const handleEdit = (registration: JuryRegistration) => {
    setEditingId(registration.id);
    setEditForm(registration);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('inscrieri_jurati')
        .update(editForm)
        .eq('id', editingId);

      if (error) throw error;

      setRegistrations(prev =>
        prev.map(reg => reg.id === editingId ? { ...reg, ...editForm } : reg)
      );
      setEditingId(null);
      setEditForm({});
    } catch (err: any) {
      alert('Eroare la salvare: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nume', 'Prenume', 'Email', 'Telefon', 'Profesie', 'Organizatie', 'Domeniu Expertiza', 'Ani Experienta', 'Status', 'Data Inscriere'];
    const rows = filteredRegistrations.map(reg => [
      reg.nume,
      reg.prenume,
      reg.email,
      reg.telefon,
      reg.profesie,
      reg.organizatie,
      reg.domeniu_expertiza,
      reg.ani_experienta,
      reg.status,
      new Date(reg.created_at).toLocaleDateString('ro-RO')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscrieri-jurati-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.prenume.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.profesie.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: registrations.length,
    in_asteptare: registrations.filter(r => r.status === 'in_asteptare').length,
    aprobat: registrations.filter(r => r.status === 'aprobat').length,
    respins: registrations.filter(r => r.status === 'respins').length
  };

  if (loading) {
    return <div className="text-center py-8">Se încarcă...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Eroare: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ave-dark-blue dark:text-slate-100">
          Înscrieri Jurați
        </h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <DownloadIcon className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card onClick={() => setStatusFilter('all')} className={`cursor-pointer ${statusFilter === 'all' ? 'ring-2 ring-ave-blue' : ''}`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-ave-blue">{statusCounts.all}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">Total Înscrieri</p>
          </div>
        </Card>
        <Card onClick={() => setStatusFilter('in_asteptare')} className={`cursor-pointer ${statusFilter === 'in_asteptare' ? 'ring-2 ring-ave-blue' : ''}`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{statusCounts.in_asteptare}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">În Așteptare</p>
          </div>
        </Card>
        <Card onClick={() => setStatusFilter('aprobat')} className={`cursor-pointer ${statusFilter === 'aprobat' ? 'ring-2 ring-ave-blue' : ''}`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{statusCounts.aprobat}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">Aprobat</p>
          </div>
        </Card>
        <Card onClick={() => setStatusFilter('respins')} className={`cursor-pointer ${statusFilter === 'respins' ? 'ring-2 ring-ave-blue' : ''}`}>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{statusCounts.respins}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">Respins</p>
          </div>
        </Card>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Caută după nume, email sau profesie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-ave-blue"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Nume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Profesie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Experiență
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredRegistrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {registration.nume} {registration.prenume}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {registration.telefon}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-slate-100">{registration.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-slate-100">{registration.profesie}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{registration.organizatie}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-slate-100">{registration.ani_experienta} ani</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{registration.domeniu_expertiza}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={registration.status}
                      onChange={(e) => handleStatusChange(registration.id, e.target.value)}
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        registration.status === 'aprobat'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : registration.status === 'respins'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                      }`}
                    >
                      <option value="in_asteptare">În Așteptare</option>
                      <option value="aprobat">Aprobat</option>
                      <option value="respins">Respins</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {new Date(registration.created_at).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedRegistration(registration)}
                        className="text-ave-blue hover:text-ave-dark-blue"
                        title="Vezi detalii"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(registration)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editează"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(registration.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Șterge"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400">
            Nu există înscrieri {statusFilter !== 'all' ? `cu statusul "${statusFilter}"` : ''}.
          </div>
        )}
      </div>

      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Detalii Înscriere
              </h3>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Nume</label>
                  <p className="text-gray-900 dark:text-slate-100">{selectedRegistration.nume}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Prenume</label>
                  <p className="text-gray-900 dark:text-slate-100">{selectedRegistration.prenume}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</label>
                  <p className="text-gray-900 dark:text-slate-100">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Telefon</label>
                  <p className="text-gray-900 dark:text-slate-100">{selectedRegistration.telefon}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Profesie</label>
                  <p className="text-gray-900 dark:text-slate-100">{selectedRegistration.profesie}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Organizație</label>
                  <p className="text-gray-900 dark:text-slate-100">{selectedRegistration.organizatie}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Domeniu Expertiză</label>
                  <p className="text-gray-900 dark:text-slate-100">{selectedRegistration.domeniu_expertiza}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Ani Experiență</label>
                  <p className="text-gray-900 dark:text-slate-100">{selectedRegistration.ani_experienta} ani</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Experiență Profesională</label>
                <p className="text-gray-900 dark:text-slate-100 whitespace-pre-wrap">{selectedRegistration.experienta}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Motivație</label>
                <p className="text-gray-900 dark:text-slate-100 whitespace-pre-wrap">{selectedRegistration.motivatie}</p>
              </div>

              {selectedRegistration.linkedin_url && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">LinkedIn</label>
                  <a
                    href={selectedRegistration.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ave-blue hover:underline"
                  >
                    {selectedRegistration.linkedin_url}
                  </a>
                </div>
              )}

              {selectedRegistration.foto_url && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Fotografie</label>
                  <a
                    href={selectedRegistration.foto_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ave-blue hover:underline"
                  >
                    Vezi fotografia
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 rounded-lg"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-slate-100">Editează Înscriere</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Nume</label>
                  <input
                    type="text"
                    value={editForm.nume || ''}
                    onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Prenume</label>
                  <input
                    type="text"
                    value={editForm.prenume || ''}
                    onChange={(e) => setEditForm({ ...editForm, prenume: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Telefon</label>
                <input
                  type="tel"
                  value={editForm.telefon || ''}
                  onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Notă Admin (privată)</label>
                <textarea
                  value={editForm.nota_admin || ''}
                  onChange={(e) => setEditForm({ ...editForm, nota_admin: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({});
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-gray-900 dark:text-slate-100"
              >
                Anulează
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-ave-blue hover:bg-ave-dark-blue text-white rounded-lg"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JuryManagement;
