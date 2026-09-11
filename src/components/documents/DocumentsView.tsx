import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Download,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentCategory, DocumentChecklistStatus, DocumentItem } from '../../types';

export const DocumentsView: React.FC = () => {
  const { documents, clients, processes, uploadDocument, updateDocument, deleteDocument, navigateToClientDetail } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  // Upload Form Modal
  const [isUploading, setIsUploading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Identificação');
  const [docNotes, setDocNotes] = useState('');

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(term) ||
      (doc.clientName && doc.clientName.toLowerCase().includes(term)) ||
      doc.category.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'todos' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'todos' || doc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !selectedClientId) return;

    uploadDocument({
      clientId: selectedClientId,
      processId: selectedProcessId || undefined,
      name: docName.trim(),
      category: docCategory,
      fileType: 'application/pdf',
      fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      notes: docNotes.trim() || undefined,
      status: 'Recebido',
    });

    setDocName('');
    setDocNotes('');
    setIsUploading(false);
  };

  const clientAvailableProcesses = processes.filter((p) => p.clientId === selectedClientId);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
            Repositório Central de Documentos
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
            Organização, análise e conferência de peças probatórias, laudos médicos e extratos CNIS.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D4739] hover:bg-[#203429] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Upload className="w-4 h-4 text-[#C5A059]" />
          <span>+ Upload de Documento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8A968F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do documento ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] focus:border-[#2D4739] rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739]"
          >
            <option value="todos">Todas as Categorias</option>
            <option value="Identificação">Identificação</option>
            <option value="Residência">Residência</option>
            <option value="Previdenciário">Previdenciário (CNIS, CTPS, PPP)</option>
            <option value="Médico">Médico (Laudos, Atestados)</option>
            <option value="Renda / Socioeconômico">Renda / Socioeconômico</option>
            <option value="Procuração e Contrato">Procuração e Contrato</option>
            <option value="Outros">Outros</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739]"
          >
            <option value="todos">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Recebido">Recebido</option>
            <option value="Em análise">Em análise</option>
            <option value="Validado">Validado</option>
          </select>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D5DDD8] text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F4]">
              <h3 className="text-sm font-bold text-[#1A2521]">Upload de Novo Documento</h3>
              <button onClick={() => setIsUploading(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-[#1A2521]">Cliente Vinculado *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    setSelectedProcessId('');
                  }}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} (CPF: {c.cpf})</option>
                  ))}
                </select>
              </div>

              {clientAvailableProcesses.length > 0 && (
                <div>
                  <label className="font-semibold text-[#1A2521]">Processo Vinculado (Opcional)</label>
                  <select
                    value={selectedProcessId}
                    onChange={(e) => setSelectedProcessId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  >
                    <option value="">Nenhum (Documento geral do cliente)</option>
                    {clientAvailableProcesses.map((p) => (
                      <option key={p.id} value={p.id}>{p.benefitName} (Prot: {p.protocolNumber})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-semibold text-[#1A2521]">Nome / Descrição do Arquivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Laudo Neurológico Dr. Ramos com CID G40"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Categoria</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                >
                  <option value="Identificação">Identificação</option>
                  <option value="Residência">Residência</option>
                  <option value="Previdenciário">Previdenciário (CNIS, CTPS, PPP)</option>
                  <option value="Médico">Médico (Laudos, Atestados)</option>
                  <option value="Renda / Socioeconômico">Renda / Socioeconômico</option>
                  <option value="Procuração e Contrato">Procuração e Contrato</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Drag and Drop Area */}
              <div className="p-6 border-2 border-dashed border-[#D5DDD8] rounded-xl text-center bg-[#FAFBFB]">
                <Upload className="w-8 h-8 text-[#2D4739] mx-auto mb-2" />
                <p className="font-medium text-[#1A2521]">Arraste arquivos PDF, JPG ou PNG aqui</p>
                <p className="text-[10px] text-[#8A968F] mt-1">Simulador de upload direto para guarda segura (máx 25MB)</p>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Anotações / Parecer da Análise</label>
                <input
                  type="text"
                  placeholder="Ex: Documento legível, contém carimbo e CRM legível..."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F4]">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7770]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D4739] text-white rounded-xl text-xs font-semibold"
                >
                  Confirmar Envio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-[#E2E6E4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F9FA] text-[#4A5750] uppercase text-[11px] font-semibold border-b border-[#E2E6E4]">
              <tr>
                <th className="py-3.5 px-4">Nome do Documento</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tamanho & Data</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F4]">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F9FAF9] transition-colors">
                  {/* Nome do Documento */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#FAF6ED] text-[#9E7B36] border border-[#E8DCC0]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1A2521]">{doc.name}</div>
                        {doc.notes && <div className="text-[11px] text-[#8A968F]">{doc.notes}</div>}
                      </div>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => navigateToClientDetail(doc.clientId)}
                      className="font-medium text-[#2D4739] hover:underline text-left block"
                    >
                      {doc.clientName || 'Cliente'}
                    </button>
                    {doc.processProtocol && (
                      <span className="text-[10px] text-[#8A968F]">Prot: {doc.processProtocol}</span>
                    )}
                  </td>

                  {/* Categoria */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#F1F4F2] text-[#2D4739] text-xs font-medium">
                      {doc.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <select
                      value={doc.status}
                      onChange={(e) =>
                        updateDocument(doc.id, { status: e.target.value as DocumentChecklistStatus })
                      }
                      className={`text-xs py-1 px-2.5 rounded-lg border font-semibold outline-none cursor-pointer ${
                        doc.status === 'Validado'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : doc.status === 'Recebido'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : doc.status === 'Em análise'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Recebido">Recebido</option>
                      <option value="Em análise">Em análise</option>
                      <option value="Validado">Validado</option>
                    </select>
                  </td>

                  {/* Tamanho & Data */}
                  <td className="py-3.5 px-4 text-xs text-[#6B7770]">
                    <div>{doc.uploadDate}</div>
                    <div className="text-[10px] text-[#8A968F]">{doc.fileSize}</div>
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-[#2D4739] hover:bg-[#EBF1ED] rounded-lg transition-colors"
                        title="Visualizar documento"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Excluir o documento "${doc.name}"?`)) {
                            deleteDocument(doc.id);
                          }
                        }}
                        className="p-1.5 text-[#8A968F] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B7770]">
                    Nenhum documento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#D5DDD8] text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F4]">
              <div>
                <h3 className="text-sm font-bold text-[#1A2521]">{previewDoc.name}</h3>
                <span className="text-[10px] text-[#6B7770]">
                  {previewDoc.clientName} • Categoria: {previewDoc.category}
                </span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <div className="h-64 rounded-xl bg-[#F8F9FA] border border-[#E2E6E4] flex flex-col items-center justify-center p-6 text-center space-y-3">
              <FileText className="w-16 h-16 text-[#2D4739]/40 stroke-1" />
              <div>
                <p className="font-semibold text-sm text-[#1A2521]">{previewDoc.name}</p>
                <p className="text-xs text-[#6B7770] mt-0.5">Formato: {previewDoc.fileType} • Tamanho: {previewDoc.fileSize}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Status: {previewDoc.status}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#F1F3F4]">
              <span className="text-[11px] text-[#6B7770]">Enviado em {previewDoc.uploadDate}</span>
              <button
                onClick={() => {
                  alert('Download simulado do arquivo com sucesso.');
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 bg-[#2D4739] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Baixar Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
