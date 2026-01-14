
export enum DocCategory {
  RESUME = 'Resume',
  TRANSCRIPT = 'Transcript',
  COE = 'Certificate of Enrollment (COE)',
  LANGUAGE_TEST = 'Language Test Result',
  OTHER = 'Other'
}

export enum DocStatus {
  UPLOADED = 'Uploaded',
  PROCESSING = 'Processing',
  EXTRACTED = 'Extracted',
  SKIPPED = 'Skipped',
  VERIFIED = 'Verified'
}

export enum EnquiryStatus {
  UNVERIFIED = 'Unverified',
  VERIFIED = 'Verified'
}

export enum VerificationGroup {
  PERSONAL_WORK = 'Personal & Professional History',
  EDUCATION = 'Educational Background',
  LANGUAGE = 'Language Test',
  COE = 'COE'
}

export interface BoundingBox {
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Confidence {
  value: any;
  confidence_score: number;
  confidence_label: 'Green' | 'Yellow' | 'Red';
  bounding_box?: BoundingBox;
}

export interface VerifiedField {
  value: any;
  isUserProvided: boolean;
  verifiedAt?: string;
  sourceDoc?: DocCategory;
}

export interface WorkExperience {
  company?: Confidence;
  title?: Confidence;
  duration?: Confidence;
}

export interface ExtractedData {
  // Personal Information (from Resume)
  first_name?: Confidence;
  last_name?: Confidence;
  email?: Confidence;
  phone_with_country_code?: Confidence;
  gender?: Confidence;
  address?: Confidence;
  
  // Work History (from Resume)
  work_experiences?: WorkExperience[];

  // Educational Background (from Transcript)
  level_of_education?: Confidence;
  degree?: Confidence;
  course?: Confidence;
  institution?: Confidence;
  edu_duration?: Confidence;
  gpa_or_percentage?: Confidence;
  year_of_completion?: Confidence;

  // Language Test Scores
  test_type?: Confidence;
  listening_score?: Confidence;
  reading_score?: Confidence;
  writing_score?: Confidence;
  speaking_score?: Confidence;
  overall_score?: Confidence;

  // Application Summary (from COE)
  course_start_date?: Confidence;
  course_end_date?: Confidence;
  initial_tuition_fee?: Confidence;
  total_tuition_fee?: Confidence;
}

export interface DocumentFile {
  id: string;
  name: string;
  category: DocCategory;
  status: DocStatus;
  base64: string;
  mimeType: string;
  extractedData?: ExtractedData;
}

export interface Enquiry {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  status: EnquiryStatus;
  documents: DocumentFile[];
  verifiedFields: Record<string, VerifiedField>;
  verificationHistory: Record<VerificationGroup, { timestamp: string; docs: string[] } | null>;
}
