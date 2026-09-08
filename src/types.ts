export type LabelCategory =
  | 'quarentena'
  | 'logistica'
  | 'laboratorio'
  | 'patrimonio'
  | 'cracha'
  | 'varejo'
  | 'cabos'
  | 'personalizado';

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'CODE39' | 'UPC' | 'ITF14';

export interface LabelField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'badge' | 'date' | 'number' | 'barcode' | 'qrcode' | 'image' | 'key-value';
  value?: string;
  prefix?: string;
  suffix?: string;
  fontSize?: number; // pt
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontColor?: string;
  alignment?: 'left' | 'center' | 'right';
  visible: boolean;
  isHeader?: boolean;
  isCode?: boolean;
  highlight?: boolean;
}

export interface LabelData {
  id: string;
  copies?: number;
  [key: string]: any;
}

export interface LabelStyleConfig {
  widthMm: number;
  heightMm: number;
  borderRadiusMm: number;
  borderWidthPx: number;
  borderColor: string;
  showBorder: boolean;
  showCutLines: boolean;
  backgroundColor: string;
  headerColor: string;
  headerTextColor: string;
  textColor: string;
  secondaryTextColor: string;
  accentColor: string;
  fontFamily: 'sans' | 'mono' | 'serif';
  showHeader: boolean;
  headerTitle: string;
  headerSubtitle?: string;
  logoUrl?: string;
  logoPosition: 'left' | 'center' | 'right' | 'none';
  logoHeightMm: number;
  barcodeType: BarcodeFormat;
  barcodeField: string;
  barcodeHeightMm: number;
  showBarcodeText: boolean;
  qrcodeField: string;
  qrcodeSizeMm: number;
  showQrCode: boolean;
  showBarcode: boolean;
  layoutMode: 'standard' | 'compact' | 'split' | 'badge-id' | 'shipping-box' | 'quarantine';
}

export interface PaperSheetPreset {
  id: string;
  name: string;
  code?: string; // e.g. Pimaco 6180
  category: 'a4_cartela' | 'termica_bobina' | 'carta' | 'personalizado';
  paperWidthMm: number;
  paperHeightMm: number;
  cols: number;
  rows: number;
  labelWidthMm: number;
  labelHeightMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  gapXmm: number;
  gapYmm: number;
  description: string;
  isContinuousRoll?: boolean;
}

export interface LabelTemplate {
  id: string;
  title: string;
  category: LabelCategory;
  description: string;
  recommendedPaperId: string;
  style: LabelStyleConfig;
  fields: LabelField[];
  sampleData: LabelData[];
}
