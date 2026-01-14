
import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { Enquiry, DocCategory, DocStatus, EnquiryStatus, DocumentFile, ExtractedData, VerificationGroup } from './types';
import { classifyDocument, extractDocumentData } from './services/geminiService';
import VerificationWizard from './components/VerificationWizard';
import { FileText, CheckCircle, Clock, Plus, ArrowLeft, ArrowRight, Eye, Upload, Trash2, ShieldCheck, Loader2, History, AlertTriangle, User, Briefcase, GraduationCap, Languages, FileBarChart, Lock } from 'lucide-react';

const EnquiryList = ({ enquiries }: { enquiries: Enquiry[] }) => (
  <div className="max-w-7xl mx-auto p-12">
    <div className="flex justify-between items-end mb-14">
      <div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Ingestion <span className="text-blue-600">Engine</span></h1>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">Education & Visa Services Hub</p>
      </div>
      <Link to="/create" className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black flex items-center shadow-2xl transition-all transform hover:-translate-y-1 uppercase text-xs tracking-widest">
        <Plus size={20} className="mr-3 text-sky-400" /> Create New Enquiry
      </Link>
    </div>

    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50/50 border-b">
          <tr>
            <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prospect Name</th>
            <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Point</th>
            <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
            <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</th>
            <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {enquiries.map(enquiry => (
            <tr key={enquiry.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group">
              <td className="px-10 py-8">
                <p className="font-black text-slate-900 text-lg tracking-tight">{enquiry.firstName} {enquiry.lastName}</p>
                {enquiry.verifiedFields.first_name && !enquiry.verifiedFields.first_name.isUserProvided && (
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center mt-1">
                    <CheckCircle size={10} className="mr-1" /> Doc-Sourced Identity
                  </span>
                )}
              </td>
              <td className="px-10 py-8 text-slate-600 font-bold text-sm tracking-tight">{enquiry.email}</td>
              <td className="px-10 py-8">
                <span className="bg-sky-50 text-blue-600 text-[10px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border border-sky-100">
                  {enquiry.documents.length} Files
                </span>
              </td>
              <td className="px-10 py-8">
                {enquiry.status === EnquiryStatus.VERIFIED ? (
                  <span className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={16} className="mr-2" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center text-rose-500 text-[10px] font-black uppercase tracking-widest">
                    <AlertTriangle size={16} className="mr-2" /> Unverified
                  </span>
                )}
              </td>
              <td className="px-10 py-8 text-right">
                <Link to={`/details/${enquiry.id}`} className="text-slate-900 group-hover:text-blue-600 font-black text-[10px] uppercase tracking-widest inline-flex items-center transition-all">
                  Manage <Eye size={16} className="ml-2 group-hover:scale-110 transition-transform" />
                </Link>
              </td>
            </tr>
          ))}
          {enquiries.length === 0 && (
            <tr>
              <td colSpan={5} className="px-10 py-32 text-center text-slate-300 font-black uppercase text-xs tracking-[0.2em] italic">No active enquiries in pipeline.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const CreateEnquiry = ({ onSave }: { onSave: (enquiry: Partial<Enquiry>) => void }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) return alert('Essential fields required.');
    setIsProcessing(true);
    onSave({ firstName, lastName, email });
  };

  return (
    <div className="max-w-3xl mx-auto p-12">
      <button onClick={() => navigate('/')} className="mb-10 flex items-center text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] transition-all group">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Global Pipeline
      </button>
      <div className="bg-white p-14 rounded-[40px] border border-slate-100 shadow-2xl relative overflow-hidden">
        <h1 className="text-4xl font-black mb-10 text-slate-900 tracking-tighter uppercase">New Prospect <span className="text-blue-600">Entry</span></h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Given Name *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold" placeholder="First Name" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Family Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold" placeholder="Last Name" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Email Address *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold" placeholder="prospect@domain.com" required />
          </div>
          <div className="pt-10">
            <button type="submit" disabled={isProcessing} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center">
              {isProcessing ? <Loader2 className="animate-spin mr-3" size={20} /> : <Plus size={20} className="mr-3 text-sky-400" />}
              Initialize Ingestion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EnquiryDetails = ({ enquiry, onUpload, onVerify, onRemoveDoc }: any) => {
  const navigate = useNavigate();

  const canVerifyPersonalWork = enquiry.documents.some((d: any) => d.category === DocCategory.RESUME && d.status === DocStatus.EXTRACTED);
  const canVerifyEducation = enquiry.documents.some((d: any) => d.category === DocCategory.TRANSCRIPT && d.status === DocStatus.EXTRACTED);
  const canVerifyLanguage = enquiry.documents.some((d: any) => d.category === DocCategory.LANGUAGE_TEST && d.status === DocStatus.EXTRACTED);
  const canVerifyCOE = enquiry.documents.some((d: any) => d.category === DocCategory.COE && d.status === DocStatus.EXTRACTED);

  const renderField = (label: string, fieldKey: string, isVerified: boolean, customValue?: any) => {
    const vField = enquiry.verifiedFields[fieldKey];
    const displayValue = customValue !== undefined ? customValue : vField?.value;
    const isDocSourced = vField && !vField.isUserProvided;
    
    return (
      <div key={fieldKey} className="group relative">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block group-hover:text-blue-500 transition-colors">
          {label}
        </label>
        <div className={`flex items-center min-h-[3rem] px-5 bg-slate-50/50 rounded-2xl border border-transparent ${isVerified ? 'border-emerald-100 bg-emerald-50/20' : ''}`}>
          <p className={`text-sm font-bold text-slate-900 truncate flex-1 ${isVerified ? 'opacity-100' : 'opacity-40 italic'}`}>
            {displayValue || 'Pending Verification'}
          </p>
          {isDocSourced && isVerified && (
            <span className="h-6 w-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm" title="Verified from Ingested Doc">
              <CheckCircle size={14} />
            </span>
          )}
          {isVerified && (
            <div className="ml-3 text-slate-300">
               <Lock size={12} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWorkExperiencesSummary = (isVerified: boolean) => {
    const experiences = enquiry.verifiedFields.work_experiences?.value || [];
    if (!experiences.length && !isVerified) {
       return <div className="col-span-2">{renderField('Work Experiences', 'work_experiences', false)}</div>;
    }
    
    return (
      <div className="col-span-2 space-y-4">
        {experiences.map((exp: any, idx: number) => (
          <div key={idx} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 grid grid-cols-3 gap-6">
            <div className="col-span-1">
               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Company</p>
               <p className="text-sm font-bold text-slate-900">{exp.company?.value || 'N/A'}</p>
            </div>
            <div className="col-span-1">
               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Position</p>
               <p className="text-sm font-bold text-slate-900">{exp.title?.value || 'N/A'}</p>
            </div>
            <div className="col-span-1">
               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Duration</p>
               <p className="text-sm font-bold text-slate-900">{exp.duration?.value || 'N/A'}</p>
            </div>
          </div>
        ))}
        {!experiences.length && isVerified && (
           <p className="text-sm font-bold text-slate-300 italic px-5">No work experiences captured.</p>
        )}
      </div>
    );
  };

  const renderFormSection = (title: string, Icon: any, content: React.ReactNode, group: VerificationGroup, canVerify: boolean, continuous: boolean = false) => {
    const isVerified = enquiry.verificationHistory[group] !== null;
    return (
      <div className={`bg-white p-12 rounded-[40px] border border-slate-100 shadow-xl transition-all ${isVerified ? 'ring-4 ring-emerald-500/5' : ''}`}>
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center">
            <div className={`h-16 w-16 rounded-[24px] flex items-center justify-center mr-6 shadow-inner ${isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
              <Icon size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center">
                {title} {isVerified && <ShieldCheck className="ml-4 text-emerald-500" size={26} />}
              </h3>
              {isVerified && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center">
                  <History size={14} className="mr-2" /> Source Context {continuous ? 'Open' : 'Locked'} • {enquiry.verificationHistory[group]?.timestamp}
                </p>
              )}
            </div>
          </div>
          {(!isVerified || continuous) && canVerify && (
            <button onClick={() => onVerify(group)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-2xl transform hover:-translate-y-1 transition-all flex items-center">
              {isVerified ? 'Update Audit' : 'Compare & Verify'} <ArrowRight size={16} className="ml-3" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
          {content}
        </div>
      </div>
    );
  };

  const getStatusLabel = (status: DocStatus) => {
    switch (status) {
      case DocStatus.UPLOADED: return "Uploading...";
      case DocStatus.PROCESSING: return "Extracting Content...";
      case DocStatus.EXTRACTED: return "Extraction Complete";
      case DocStatus.SKIPPED: return "Type: Other (Skipped)";
      case DocStatus.VERIFIED: return "Verified";
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-12">
      <div className="flex justify-between items-center mb-16">
        <button onClick={() => navigate('/')} className="flex items-center text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.3em] transition-all group">
          <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Pipeline Overview
        </button>
        <div className="flex items-center space-x-4">
           {enquiry.status === EnquiryStatus.VERIFIED && (
             <div className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center">
                <ShieldCheck size={18} className="mr-3" /> Integrity Confirmed
             </div>
           )}
        </div>
      </div>

      <div className="bg-sky-50 p-16 rounded-[60px] border border-sky-100 shadow-inner relative overflow-hidden group mb-16">
        <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-all pointer-events-none">
           <Upload size={180} className="text-sky-900" />
        </div>
        <div className="flex justify-between items-center mb-14 relative z-10">
          <div>
            <h2 className="text-4xl font-black flex items-center tracking-tighter text-sky-900 uppercase">
              Ingest Documents
            </h2>
            <p className="text-[11px] font-black text-sky-500 uppercase tracking-[0.3em] mt-3">Artifact Repository for spatial AI extraction</p>
          </div>
          <div>
            <input type="file" multiple id="add-doc-main" className="hidden" onChange={e => e.target.files && onUpload(e.target.files)} />
            <label htmlFor="add-doc-main" className="cursor-pointer bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center shadow-2xl transform hover:-translate-y-1 active:scale-95">
              <Plus size={20} className="mr-3" /> Upload Repository Files
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {enquiry.documents.map((doc: any) => (
            <div key={doc.id} className="flex flex-col p-8 bg-white rounded-[40px] group border border-sky-100 hover:border-blue-400 transition-all shadow-sm hover:shadow-2xl transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 shadow-inner">
                  <FileText size={28} />
                </div>
                <button onClick={() => onRemoveDoc(doc.id)} className="text-slate-200 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl">
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="overflow-hidden mb-6">
                <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{doc.name}</p>
                <span className="text-[9px] font-black text-sky-500 uppercase tracking-[0.2em]">{doc.category || 'Classifying...'}</span>
              </div>
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center">
                  {doc.status === DocStatus.PROCESSING || doc.status === DocStatus.UPLOADED ? (
                    <Loader2 size={12} className="text-blue-500 animate-spin mr-2" />
                  ) : (
                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${doc.status === DocStatus.VERIFIED ? 'bg-emerald-500' : doc.status === DocStatus.EXTRACTED ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                  )}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {getStatusLabel(doc.status)}
                  </span>
                </div>
                {doc.status === DocStatus.EXTRACTED && (
                  <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                    Ready
                  </span>
                )}
              </div>
            </div>
          ))}
          {enquiry.documents.length === 0 && (
             <div className="col-span-full py-24 text-center border-4 border-dashed border-sky-200 rounded-[50px] bg-white/60">
               <p className="text-[11px] font-black text-sky-300 uppercase tracking-[0.5em] italic">No documents ingested • Waiting for Repository Files</p>
             </div>
          )}
        </div>
      </div>

      <div className="space-y-12">
        {/* PERSONAL/WORK - Continuous Verification - Source: Resume */}
        {renderFormSection('Personal & Professional History', Briefcase, (
          <>
            <div className="col-span-2 grid grid-cols-2 gap-x-12 gap-y-10 border-b border-slate-50 pb-10">
              {renderField('First Name', 'first_name', enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] !== null)}
              {renderField('Last Name', 'last_name', enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] !== null)}
              {renderField('Primary Email', 'email', enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] !== null)}
              {renderField('Phone (Incl. Country Code)', 'phone_with_country_code', enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] !== null)}
              {renderField('Biological Gender', 'gender', enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] !== null)}
              {renderField('Home Address', 'address', enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] !== null)}
            </div>
            <div className="col-span-2 pt-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Documented Career Path (Resume-Sourced)</label>
              {renderWorkExperiencesSummary(enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] !== null)}
            </div>
          </>
        ), VerificationGroup.PERSONAL_WORK, canVerifyPersonalWork, true)}

        {/* EDUCATION - Individual Verification - Source: Transcript */}
        {renderFormSection('Educational Profile', GraduationCap, (
          <>
            {renderField('Level of Education', 'level_of_education', enquiry.verificationHistory[VerificationGroup.EDUCATION] !== null)}
            {renderField('Degree Type', 'degree', enquiry.verificationHistory[VerificationGroup.EDUCATION] !== null)}
            {renderField('Field of Study', 'course', enquiry.verificationHistory[VerificationGroup.EDUCATION] !== null)}
            {renderField('Awarding Institution', 'institution', enquiry.verificationHistory[VerificationGroup.EDUCATION] !== null)}
            {renderField('Academic Duration', 'edu_duration', enquiry.verificationHistory[VerificationGroup.EDUCATION] !== null)}
            {renderField('GPA / Percentage', 'gpa_or_percentage', enquiry.verificationHistory[VerificationGroup.EDUCATION] !== null)}
            {renderField('Year Conferred', 'year_of_completion', enquiry.verificationHistory[VerificationGroup.EDUCATION] !== null)}
          </>
        ), VerificationGroup.EDUCATION, canVerifyEducation)}

        {/* LANGUAGE - Individual Verification - Source: Language Test */}
        {renderFormSection('Language Competency', Languages, (
          <>
            {renderField('Exam Standard', 'test_type', enquiry.verificationHistory[VerificationGroup.LANGUAGE] !== null)}
            {renderField('Listening Score', 'listening_score', enquiry.verificationHistory[VerificationGroup.LANGUAGE] !== null)}
            {renderField('Reading Score', 'reading_score', enquiry.verificationHistory[VerificationGroup.LANGUAGE] !== null)}
            {renderField('Writing Score', 'writing_score', enquiry.verificationHistory[VerificationGroup.LANGUAGE] !== null)}
            {renderField('Speaking Score', 'speaking_score', enquiry.verificationHistory[VerificationGroup.LANGUAGE] !== null)}
            {renderField('Overall Result', 'overall_score', enquiry.verificationHistory[VerificationGroup.LANGUAGE] !== null)}
          </>
        ), VerificationGroup.LANGUAGE, canVerifyLanguage)}

        {/* COE - Individual Verification - Source: COE */}
        {renderFormSection('Application Summary', FileBarChart, (
          <>
            {renderField('Commencement Date', 'course_start_date', enquiry.verificationHistory[VerificationGroup.COE] !== null)}
            {renderField('Estimated Completion', 'course_end_date', enquiry.verificationHistory[VerificationGroup.COE] !== null)}
            {renderField('Initial Fee Deposit', 'initial_tuition_fee', enquiry.verificationHistory[VerificationGroup.COE] !== null)}
            {renderField('Total Course Liability', 'total_tuition_fee', enquiry.verificationHistory[VerificationGroup.COE] !== null)}
          </>
        ), VerificationGroup.COE, canVerifyCOE)}
      </div>
    </div>
  );
};

const App = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  const handleSaveEnquiry = (enquiryData: Partial<Enquiry>) => {
    const newEnquiry: Enquiry = {
      id: Math.random().toString(36).substring(2, 11),
      firstName: enquiryData.firstName || '',
      lastName: enquiryData.lastName || '',
      email: enquiryData.email || '',
      status: EnquiryStatus.UNVERIFIED,
      documents: [],
      verifiedFields: {
        first_name: { value: enquiryData.firstName, isUserProvided: true },
        last_name: { value: enquiryData.lastName, isUserProvided: true },
        email: { value: enquiryData.email, isUserProvided: true },
      },
      verificationHistory: {
        [VerificationGroup.PERSONAL_WORK]: null,
        [VerificationGroup.EDUCATION]: null,
        [VerificationGroup.LANGUAGE]: null,
        [VerificationGroup.COE]: null,
      },
    };
    setEnquiries(prev => [...prev, newEnquiry]);
    window.location.hash = '/';
  };

  const handleUpload = async (enquiryId: string, files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const fileId = Math.random().toString(36).substring(2, 11);
      
      const promise = new Promise<void>((resolve, reject) => {
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string).split(',')[1];
          const docFile: DocumentFile = {
            id: fileId,
            name: file.name,
            category: DocCategory.OTHER,
            status: DocStatus.UPLOADED,
            base64,
            mimeType: file.type,
          };
          
          setEnquiries(prev => prev.map(enq => 
            enq.id === enquiryId ? { ...enq, documents: [...enq.documents, docFile] } : enq
          ));

          try {
            setEnquiries(prev => prev.map(enq => 
              enq.id === enquiryId ? { 
                ...enq, 
                documents: enq.documents.map(d => d.id === fileId ? { ...d, status: DocStatus.PROCESSING } : d) 
              } : enq
            ));

            const category = await classifyDocument(base64, file.type);
            
            setEnquiries(prev => prev.map(enq => 
              enq.id === enquiryId ? { 
                ...enq, 
                documents: enq.documents.map(d => d.id === fileId ? { ...d, category, status: category === DocCategory.OTHER ? DocStatus.SKIPPED : DocStatus.PROCESSING } : d) 
              } : enq
            ));

            if (category !== DocCategory.OTHER) {
              const extractedData = await extractDocumentData(category, base64, file.type);
              setEnquiries(prev => prev.map(enq => 
                enq.id === enquiryId ? { 
                  ...enq, 
                  documents: enq.documents.map(d => d.id === fileId ? { ...d, status: DocStatus.EXTRACTED, extractedData } : d) 
                } : enq
              ));
            }
          } catch (error) {
            console.error("Gemini Pipeline Failure", error);
          }
          resolve();
        };
        reader.onerror = (e) => reject(e);
      });
      reader.readAsDataURL(file);
      await promise;
    }
  };

  const handleRemoveDoc = (enquiryId: string, docId: string) => {
    setEnquiries(prev => prev.map(enq => 
      enq.id === enquiryId ? { ...enq, documents: enq.documents.filter(d => d.id !== docId) } : enq
    ));
  };

  const handleVerificationComplete = (enquiryId: string, group: VerificationGroup, verifiedData: any, docIds: string[]) => {
    setEnquiries(prev => prev.map(enq => {
      if (enq.id !== enquiryId) return enq;

      const updatedVerifiedFields = { ...enq.verifiedFields };
      Object.entries(verifiedData).forEach(([key, val]: [string, any]) => {
        if (val && typeof val === 'object' && 'value' in val) {
          updatedVerifiedFields[key] = {
            value: val.value,
            isUserProvided: false,
            verifiedAt: new Date().toISOString(),
          };
        } else {
            updatedVerifiedFields[key] = {
                value: val,
                isUserProvided: false,
                verifiedAt: new Date().toISOString()
            }
        }
      });

      const updatedHistory = {
        ...enq.verificationHistory,
        [group]: { timestamp: new Date().toLocaleString(), docs: docIds }
      };

      // VERIFIED only when Personal/Work AND Educational Background are completed.
      let status = EnquiryStatus.UNVERIFIED;
      if (updatedHistory[VerificationGroup.PERSONAL_WORK] !== null && updatedHistory[VerificationGroup.EDUCATION] !== null) {
        status = EnquiryStatus.VERIFIED;
      }

      return {
        ...enq,
        verifiedFields: updatedVerifiedFields,
        verificationHistory: updatedHistory,
        status,
        documents: enq.documents.map(d => docIds.includes(d.id) ? { ...d, status: DocStatus.VERIFIED } : d)
      };
    }));
  };

  const EnquiryDetailsWrapper = () => {
    const { id } = useParams();
    const enquiry = enquiries.find(e => e.id === id);
    const [wizardGroup, setWizardGroup] = useState<VerificationGroup | null>(null);

    if (!enquiry) return <div className="p-20 text-center font-black uppercase text-slate-300">Context Identifier Not Found</div>;

    if (wizardGroup) {
      return (
        <VerificationWizard 
          enquiry={enquiry} 
          group={wizardGroup} 
          onCancel={() => setWizardGroup(null)}
          onComplete={(data, ids) => {
            handleVerificationComplete(enquiry.id, wizardGroup, data, ids);
            setWizardGroup(null);
          }}
        />
      );
    }

    return (
      <EnquiryDetails 
        enquiry={enquiry} 
        onUpload={(files: FileList) => handleUpload(enquiry.id, files)}
        onRemoveDoc={(docId: string) => handleRemoveDoc(enquiry.id, docId)}
        onVerify={(group: VerificationGroup) => setWizardGroup(group)}
      />
    );
  };

  return (
    <HashRouter>
      <nav className="bg-slate-900 border-b border-slate-800 px-10 py-6 sticky top-0 z-[60] shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black group-hover:rotate-6 transition-transform">I</div>
            <div>
              <span className="font-black text-xl tracking-tighter text-white uppercase">Ingestion<span className="text-blue-400">Engine</span></span>
              <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase -mt-1">Production Hub v4.5</p>
            </div>
          </Link>
          <div className="flex items-center space-x-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center bg-blue-900/30 text-blue-400 px-4 py-2 rounded-xl border border-blue-800/50">
               <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 animate-pulse" /> AI Pipeline: Active
            </div>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<EnquiryList enquiries={enquiries} />} />
        <Route path="/create" element={<CreateEnquiry onSave={handleSaveEnquiry} />} />
        <Route path="/details/:id" element={<EnquiryDetailsWrapper />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
