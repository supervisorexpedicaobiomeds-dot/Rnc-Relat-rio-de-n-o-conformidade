import React, { useState } from 'react';
import { LabelData, LabelField } from '../types';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Sparkles, 
  Upload, 
  FileText, 
  Layers, 
  Hash, 
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

interface BatchDataEditorProps {
  data: LabelData[];
  fields: LabelField[];
  onChangeData: (newData: LabelData[]) => void;
  onResetSample: () => void;
}

export const BatchDataEditor: React.FC<BatchDataEditorProps> = ({
  data,
  fields,
  onChangeData,
  onResetSample,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSequentialModal, setShowSequentialModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Sequential Generator state
  const [seqPrefix, setSeqPrefix] = useState('LOTE-');
  const [seqSuffix, setSeqSuffix] = useState('');
  const [seqStart, setSeqStart] = useState(1);
  const [seqEnd, setSeqEnd] = useState(10);
  const [seqDigits, setSeqDigits] = useState(4);
  const [seqTargetField, setSeqTargetField] = useState('code');
  const [seqTitle, setSeqTitle] = useState('Identificação Padrão');
  const [seqCopies, setSeqCopies] = useState(1);
  const [seqMode, setSeqMode] = useState<'append' | 'replace'>('append');

  // CSV Import state
  const [csvText, setCsvText] = useState('');
  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';' | '\t'>(';');
  const [importHasHeader, setImportHasHeader] = useState(true);

  // Filtered rows for search
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some((val) =>
      String(val || '').toLowerCase().includes(term)
    );
  });

  // Total label units taking copies into account
  const totalLabelUnits = data.reduce((acc, curr) => acc + (Number(curr.copies) || 1), 0);

  // Add a single blank record
  const handleAddNew = () => {
    const newItem: LabelData = {
      id: String(Date.now()),
      copies: 1,
    };
    fields.forEach((f) => {
      newItem[f.key] = f.value || '';
    });
    // Set a default code or title if empty
    if (newItem.code === undefined) newItem.code = `ID-${Math.floor(1000 + Math.random() * 9000)}`;
    if (newItem.title === undefined) newItem.title = `Nova Etiqueta ${data.length + 1}`;

    onChangeData([...data, newItem]);
    setEditingItemIndex(data.length);
  };

  // Duplicate an item
  const handleDuplicate = (index: number) => {
    const target = data[index];
    const duplicated: LabelData = {
      ...target,
      id: String(Date.now()),
      code: target.code ? `${target.code}-CÓPIA` : `ID-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    const updated = [...data];
    updated.splice(index + 1, 0, duplicated);
    onChangeData(updated);
  };

  // Remove an item
  const handleRemove = (index: number) => {
    if (data.length <= 1) {
      alert('É necessário manter pelo menos 1 etiqueta na lista.');
      return;
    }
    const updated = data.filter((_, i) => i !== index);
    onChangeData(updated);
  };

  // Update item field
  const handleUpdateField = (index: number, key: string, value: any) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    onChangeData(updated);
  };

  // Execute sequential generation
  const handleGenerateSequential = () => {
    const generated: LabelData[] = [];
    const count = Math.max(1, Math.min(500, seqEnd - seqStart + 1));

    for (let i = seqStart; i <= seqEnd; i++) {
      const formattedNum = String(i).padStart(seqDigits, '0');
      const generatedCode = `${seqPrefix}${formattedNum}${seqSuffix}`;

      const item: LabelData = {
        id: `seq-${Date.now()}-${i}`,
        copies: Number(seqCopies) || 1,
        title: seqTitle ? `${seqTitle} #${formattedNum}` : `Item ${formattedNum}`,
        code: generatedCode,
        assetTag: generatedCode,
        tracking: generatedCode,
        passId: generatedCode,
        ean: formattedNum.padStart(13, '7890000000000').slice(0, 13),
        lot: `LT-${formattedNum}`,
        date: new Date().toLocaleDateString('pt-BR'),
        sector: 'Geral',
      };

      // Set target field explicitly
      item[seqTargetField] = generatedCode;

      generated.push(item);
    }

    if (seqMode === 'replace') {
      onChangeData(generated);
    } else {
      onChangeData([...data, ...generated]);
    }

    setShowSequentialModal(false);
  };

  // Execute CSV Import
  const handleImportCsv = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length === 0) return;

    let headers: string[] = [];
    let startIdx = 0;

    if (importHasHeader && lines.length > 1) {
      headers = lines[0].split(csvDelimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
      startIdx = 1;
    } else {
      // Map to existing field keys in order
      headers = fields.map((f) => f.key);
    }

    const imported: LabelData[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells = line.split(csvDelimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const item: LabelData = {
        id: `csv-${Date.now()}-${i}`,
        copies: 1,
      };

      headers.forEach((header, idx) => {
        if (cells[idx] !== undefined) {
          // Normalize header key to match fields if possible
          const matchedField = fields.find(
            (f) =>
              f.key.toLowerCase() === header.toLowerCase() ||
              f.label.toLowerCase() === header.toLowerCase()
          );
          const keyName = matchedField ? matchedField.key : header;
          item[keyName] = cells[idx];
        }
      });

      // Ensure mandatory fields
      if (!item.title && cells[0]) item.title = cells[0];
      if (!item.code && (cells[1] || cells[0])) item.code = cells[1] || cells[0];

      imported.push(item);
    }

    if (imported.length > 0) {
      onChangeData([...data, ...imported]);
      setShowImportModal(false);
      setCsvText('');
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        // Auto-detect delimiter
        if (content.includes(';') && !content.includes('\t')) setCsvDelimiter(';');
        else if (content.includes('\t')) setCsvDelimiter('\t');
        else if (content.includes(',')) setCsvDelimiter(',');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Adicionar Etiqueta
          </button>

          <button
            onClick={() => setShowSequentialModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Gerar Série / Lote
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Importar Planilha
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Counter */}
          <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>
              <strong>{data.length}</strong> itens (Total: <strong>{totalLabelUnits}</strong> etiquetas)
            </span>
          </div>

          <button
            onClick={onResetSample}
            title="Restaurar dados de exemplo originais"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por código, nome, lote ou destinatário..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Interactive Data List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 w-20 text-center">Cópias</th>
                {fields.slice(0, 4).map((f) => (
                  <th key={f.id} className="py-2.5 px-3 min-w-[140px]">
                    {f.label}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.map((item, index) => {
                const originalIndex = data.findIndex((d) => d.id === item.id);
                return (
                  <tr
                    key={item.id || index}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={item.copies || 1}
                        onChange={(e) =>
                          handleUpdateField(originalIndex, 'copies', Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-14 text-center py-1 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    {fields.slice(0, 4).map((f) => (
                      <td key={f.id} className="py-2 px-3">
                        <input
                          type="text"
                          value={item[f.key] !== undefined ? item[f.key] : ''}
                          onChange={(e) => handleUpdateField(originalIndex, f.key, e.target.value)}
                          placeholder={`Digitar ${f.label.toLowerCase()}...`}
                          className="w-full py-1 px-2 bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-blue-400 rounded outline-none text-slate-800 text-xs transition-all"
                        />
                      </td>
                    ))}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicate(originalIndex)}
                          title="Duplicar esta etiqueta"
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(originalIndex)}
                          title="Excluir etiqueta"
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SEQUENTIAL GENERATOR */}
      {showSequentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base text-slate-900">Gerador Automático de Série / Lote</h3>
              </div>
              <button
                onClick={() => setShowSequentialModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <p className="text-slate-500 leading-relaxed">
                Crie dezenas ou centenas de etiquetas numeradas sequencialmente com códigos de barras e QR codes únicos em segundos.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Prefixo do Código</label>
                  <input
                    type="text"
                    value={seqPrefix}
                    onChange={(e) => setSeqPrefix(e.target.value)}
                    placeholder="Ex: LAB-2026-"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Sufixo (Opcional)</label>
                  <input
                    type="text"
                    value={seqSuffix}
                    onChange={(e) => setSeqSuffix(e.target.value)}
                    placeholder="Ex: -BR"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Nº Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={seqStart}
                    onChange={(e) => setSeqStart(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Nº Final</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={seqEnd}
                    onChange={(e) => setSeqEnd(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Dígitos (Zeros)</label>
                  <select
                    value={seqDigits}
                    onChange={(e) => setSeqDigits(parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="2">2 (ex: 01)</option>
                    <option value="3">3 (ex: 001)</option>
                    <option value="4">4 (ex: 0001)</option>
                    <option value="5">5 (ex: 00001)</option>
                    <option value="6">6 (ex: 000001)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Título / Descrição Base</label>
                  <input
                    type="text"
                    value={seqTitle}
                    onChange={(e) => setSeqTitle(e.target.value)}
                    placeholder="Ex: Amostra Clínica"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Cópias por Etiqueta</label>
                  <input
                    type="number"
                    min="1"
                    value={seqCopies}
                    onChange={(e) => setSeqCopies(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              {/* Preview of first & last generated code */}
              <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 flex items-center justify-between text-indigo-900">
                <div>
                  <span className="font-semibold block text-[11px]">Prévia da numeração gerada:</span>
                  <span className="font-mono font-bold text-xs">
                    {seqPrefix}
                    {String(seqStart).padStart(seqDigits, '0')}
                    {seqSuffix} ... até ... {seqPrefix}
                    {String(seqEnd).padStart(seqDigits, '0')}
                    {seqSuffix}
                  </span>
                </div>
                <div className="text-right font-bold text-indigo-700">
                  {Math.max(0, seqEnd - seqStart + 1)} etiquetas
                </div>
              </div>

              {/* Append vs Replace Mode */}
              <div className="flex gap-4 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="seqMode"
                    checked={seqMode === 'append'}
                    onChange={() => setSeqMode('append')}
                    className="text-indigo-600"
                  />
                  <span>Adicionar à lista existente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="seqMode"
                    checked={seqMode === 'replace'}
                    onChange={() => setSeqMode('replace')}
                    className="text-indigo-600"
                  />
                  <span>Substituir lista atual</span>
                </label>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowSequentialModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateSequential}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Gerar Sequência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CSV / EXCEL IMPORT */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <Upload className="w-5 h-5" />
                <h3 className="text-base text-slate-900">Importar Dados do Excel ou CSV</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <p className="text-slate-500 leading-relaxed">
                Copie e cole os dados de uma planilha (Excel, Google Sheets) ou selecione um arquivo <code>.csv</code>.
              </p>

              {/* Upload file button */}
              <div className="flex items-center justify-between p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                <span className="text-slate-600">Subir arquivo de planilha:</span>
                <label className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded-lg text-slate-700 font-semibold cursor-pointer shadow-xs transition-colors">
                  Escolher Arquivo .csv
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Delimiter & Header Options */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-700">Separador:</label>
                  <select
                    value={csvDelimiter}
                    onChange={(e) => setCsvDelimiter(e.target.value as any)}
                    className="p-1.5 border border-slate-300 rounded bg-white text-xs outline-none"
                  >
                    <option value=";">Ponto e vírgula (;)</option>
                    <option value=",">Vírgula (,)</option>
                    <option value={"\t"}>Tabulação (Excel / Tab)</option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importHasHeader}
                    onChange={(e) => setImportHasHeader(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Primeira linha contém cabeçalhos</span>
                </label>
              </div>

              {/* Textarea */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Cole o texto aqui:
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Exemplo:\nNome do Produto;Código SKU;Lote;Validade\nTampão Fosfato Bio;BIO-991;LT-2026-01;12/2026\nReagente Enzimático;BIO-992;LT-2026-02;10/2026`}
                  className="w-full p-2.5 font-mono text-[11px] border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={!csvText.trim()}
                onClick={handleImportCsv}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" /> Importar para Lista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
