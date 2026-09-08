import React, { useState } from 'react';
import { BarcodeFormat, LabelField, LabelStyleConfig } from '../types';
import { 
  Sliders, 
  Type, 
  QrCode, 
  Barcode, 
  Palette, 
  Layout, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface LabelCustomizerProps {
  style: LabelStyleConfig;
  fields: LabelField[];
  onChangeStyle: (newStyle: LabelStyleConfig) => void;
  onChangeFields: (newFields: LabelField[]) => void;
}

export const LabelCustomizer: React.FC<LabelCustomizerProps> = ({
  style,
  fields,
  onChangeStyle,
  onChangeFields,
}) => {
  const [activeTab, setActiveTab] = useState<'dimensoes' | 'cabecalho' | 'codigos' | 'campos' | 'cores'>('dimensoes');

  // Add a new dynamic field
  const handleAddField = () => {
    const newFieldId = `f_${Date.now()}`;
    const newField: LabelField = {
      id: newFieldId,
      key: `custom_${fields.length + 1}`,
      label: `Campo Personalizado ${fields.length + 1}`,
      type: 'text',
      fontSize: 10,
      fontWeight: 'normal',
      visible: true,
    };
    onChangeFields([...fields, newField]);
  };

  // Toggle field visibility
  const handleToggleFieldVisibility = (index: number) => {
    const updated = [...fields];
    updated[index] = {
      ...updated[index],
      visible: !updated[index].visible,
    };
    onChangeFields(updated);
  };

  // Delete field
  const handleDeleteField = (index: number) => {
    if (fields.length <= 1) {
      alert('Mantenha pelo menos um campo visível.');
      return;
    }
    const updated = fields.filter((_, i) => i !== index);
    onChangeFields(updated);
  };

  // Move field up/down
  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }
    const updated = [...fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChangeFields(updated);
  };

  // Update specific field properties
  const handleUpdateFieldProp = (index: number, key: keyof LabelField, val: any) => {
    const updated = [...fields];
    updated[index] = {
      ...updated[index],
      [key]: val,
    };
    onChangeFields(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('dimensoes')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'dimensoes'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" /> Tamanho & Layout
        </button>

        <button
          onClick={() => setActiveTab('cabecalho')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'cabecalho'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layout className="w-3.5 h-3.5" /> Cabeçalho
        </button>

        <button
          onClick={() => setActiveTab('codigos')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'codigos'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Barcode className="w-3.5 h-3.5" /> Código de Barras & QR
        </button>

        <button
          onClick={() => setActiveTab('campos')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'campos'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Type className="w-3.5 h-3.5" /> Campos de Dados ({fields.length})
        </button>

        <button
          onClick={() => setActiveTab('cores')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'cores'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" /> Cores & Bordas
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="p-4 text-xs text-slate-700">
        {/* TAB 1: DIMENSÕES & LAYOUT */}
        {activeTab === 'dimensoes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Largura da Etiqueta (mm)
                </label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  step="0.5"
                  value={style.widthMm}
                  onChange={(e) =>
                    onChangeStyle({ ...style, widthMm: parseFloat(e.target.value) || 100 })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Altura da Etiqueta (mm)
                </label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  step="0.5"
                  value={style.heightMm}
                  onChange={(e) =>
                    onChangeStyle({ ...style, heightMm: parseFloat(e.target.value) || 50 })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Estrutura Visual do Modelo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'quarantine', name: 'Quarentena & Liberação' },
                  { id: 'standard', name: 'Padrão (Lab & Geral)' },
                  { id: 'shipping-box', name: 'Logística / Envio' },
                  { id: 'split', name: 'Patrimônio / Ativo' },
                  { id: 'badge-id', name: 'Crachá de Acesso' },
                  { id: 'compact', name: 'Compacto / Gôndola' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onChangeStyle({ ...style, layoutMode: l.id as any })}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all cursor-pointer ${
                      style.layoutMode === l.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="font-medium text-slate-600">Tipografia Geral:</span>
              <div className="flex gap-2">
                {(['sans', 'mono', 'serif'] as const).map((font) => (
                  <button
                    key={font}
                    onClick={() => onChangeStyle({ ...style, fontFamily: font })}
                    className={`px-3 py-1 rounded border text-xs capitalize cursor-pointer ${
                      style.fontFamily === font
                        ? 'bg-slate-800 text-white border-slate-800 font-bold'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {font === 'sans' ? 'Moderna (Sans)' : font === 'mono' ? 'Técnica (Mono)' : 'Clássica (Serif)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CABEÇALHO */}
        {activeTab === 'cabecalho' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Exibir Faixa Superior de Cabeçalho</span>
                <span className="text-[11px] text-slate-500">
                  Ideal para destacar nome da empresa, setor ou avisos institucionais.
                </span>
              </div>
              <input
                type="checkbox"
                checked={style.showHeader}
                onChange={(e) => onChangeStyle({ ...style, showHeader: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
            </div>

            {style.showHeader && (
              <>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Título do Cabeçalho
                  </label>
                  <input
                    type="text"
                    value={style.headerTitle}
                    onChange={(e) => onChangeStyle({ ...style, headerTitle: e.target.value })}
                    placeholder="Ex: BIOMED LAB • CONTROLE DE QUALIDADE"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Subtítulo / Instrução Secundária (Opcional)
                  </label>
                  <input
                    type="text"
                    value={style.headerSubtitle || ''}
                    onChange={(e) => onChangeStyle({ ...style, headerSubtitle: e.target.value })}
                    placeholder="Ex: ARMAZENAMENTO CLÍNICO CONTROLADO"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Cor de Fundo da Faixa
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={style.headerColor || '#0284c7'}
                        onChange={(e) => onChangeStyle({ ...style, headerColor: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border border-slate-200"
                      />
                      <input
                        type="text"
                        value={style.headerColor}
                        onChange={(e) => onChangeStyle({ ...style, headerColor: e.target.value })}
                        className="flex-1 p-1.5 border border-slate-300 rounded font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Cor do Texto da Faixa
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={style.headerTextColor || '#ffffff'}
                        onChange={(e) => onChangeStyle({ ...style, headerTextColor: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border border-slate-200"
                      />
                      <input
                        type="text"
                        value={style.headerTextColor}
                        onChange={(e) => onChangeStyle({ ...style, headerTextColor: e.target.value })}
                        className="flex-1 p-1.5 border border-slate-300 rounded font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: CÓDIGO DE BARRAS & QR CODE */}
        {activeTab === 'codigos' && (
          <div className="space-y-5">
            {/* Barcode settings */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900">Código de Barras</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={style.showBarcode}
                    onChange={(e) => onChangeStyle({ ...style, showBarcode: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Ativo</span>
                </label>
              </div>

              {style.showBarcode && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Formato</label>
                    <select
                      value={style.barcodeType}
                      onChange={(e) =>
                        onChangeStyle({ ...style, barcodeType: e.target.value as BarcodeFormat })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      <option value="CODE128">Code 128 (Universal)</option>
                      <option value="EAN13">EAN-13 (Comercial)</option>
                      <option value="CODE39">Code 39 (Alfanumérico)</option>
                      <option value="UPC">UPC-A</option>
                      <option value="ITF14">ITF-14 (Caixas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Campo Fonte</label>
                    <select
                      value={style.barcodeField}
                      onChange={(e) => onChangeStyle({ ...style, barcodeField: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      {fields.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label} ({f.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Altura das Barras (mm)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="40"
                      value={style.barcodeHeightMm}
                      onChange={(e) =>
                        onChangeStyle({
                          ...style,
                          barcodeHeightMm: parseInt(e.target.value) || 12,
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* QR Code settings */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900">QR Code Bidimensional</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={style.showQrCode}
                    onChange={(e) => onChangeStyle({ ...style, showQrCode: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Ativo</span>
                </label>
              </div>

              {style.showQrCode && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Campo Fonte do QR</label>
                    <select
                      value={style.qrcodeField}
                      onChange={(e) => onChangeStyle({ ...style, qrcodeField: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      {fields.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label} ({f.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tamanho do QR Code (mm)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={style.qrcodeSizeMm}
                      onChange={(e) =>
                        onChangeStyle({
                          ...style,
                          qrcodeSizeMm: parseInt(e.target.value) || 20,
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CAMPOS DE DADOS */}
        {activeTab === 'campos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 font-medium">
                Personalize os textos, prefixos e visibilidade de cada linha da etiqueta.
              </span>
              <button
                onClick={handleAddField}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Campo
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    field.visible ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => handleToggleFieldVisibility(index)}
                        title={field.visible ? 'Ocultar campo' : 'Mostrar campo'}
                        className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                      >
                        {field.visible ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      </button>

                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateFieldProp(index, 'label', e.target.value)}
                        className="font-bold text-slate-800 text-xs bg-transparent border-b border-transparent focus:border-blue-400 outline-none flex-1"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveField(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveField(index, 'down')}
                        disabled={index === fields.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(index)}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <label className="block text-slate-500 text-[10px]">Prefixo (Ex: "Lote: ")</label>
                      <input
                        type="text"
                        value={field.prefix || ''}
                        onChange={(e) => handleUpdateFieldProp(index, 'prefix', e.target.value)}
                        placeholder="Sem prefixo"
                        className="w-full p-1 bg-white border border-slate-200 rounded text-slate-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[10px]">Tamanho da Fonte (pt)</label>
                      <input
                        type="number"
                        min="7"
                        max="24"
                        value={field.fontSize || 10}
                        onChange={(e) =>
                          handleUpdateFieldProp(index, 'fontSize', parseInt(e.target.value) || 10)
                        }
                        className="w-full p-1 bg-white border border-slate-200 rounded text-slate-700 outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[10px]">Estilo</label>
                      <select
                        value={field.fontWeight || 'normal'}
                        onChange={(e) => handleUpdateFieldProp(index, 'fontWeight', e.target.value)}
                        className="w-full p-1 bg-white border border-slate-200 rounded text-slate-700 outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Negrito (Bold)</option>
                        <option value="black">Black (Pesado)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CORES & BORDAS */}
        {activeTab === 'cores' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Fundo da Etiqueta</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.backgroundColor || '#ffffff'}
                    onChange={(e) => onChangeStyle({ ...style, backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-xs">{style.backgroundColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Cor do Texto Principal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.textColor || '#0f172a'}
                    onChange={(e) => onChangeStyle({ ...style, textColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-xs">{style.textColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Cor de Destaque</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.accentColor || '#2563eb'}
                    onChange={(e) => onChangeStyle({ ...style, accentColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-xs">{style.accentColor}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Contorno da Etiqueta</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={style.showBorder}
                    onChange={(e) => onChangeStyle({ ...style, showBorder: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Exibir Borda</span>
                </label>
              </div>

              {style.showBorder && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Arredondamento (mm)</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="0.5"
                      value={style.borderRadiusMm}
                      onChange={(e) =>
                        onChangeStyle({
                          ...style,
                          borderRadiusMm: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Espessura (px)</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={style.borderWidthPx}
                      onChange={(e) =>
                        onChangeStyle({
                          ...style,
                          borderWidthPx: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Cor da Borda</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={style.borderColor || '#cbd5e1'}
                        onChange={(e) => onChangeStyle({ ...style, borderColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={style.showCutLines}
                  onChange={(e) => onChangeStyle({ ...style, showCutLines: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Exibir marcas / linhas tracejadas de corte para tesoura ou estilete</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
