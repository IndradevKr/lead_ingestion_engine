
import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { Enquiry, DocCategory, DocStatus, EnquiryStatus, DocumentFile, ExtractedData, VerificationGroup } from './types';
import { classifyDocument, extractDocumentData } from './services/geminiService';
import VerificationWizard from './components/VerificationWizard';
import { 
  FileText, CheckCircle, Plus, ArrowLeft, ArrowRight, Eye, Upload, 
  Trash2, ShieldCheck, Loader2, History, AlertCircle, User, 
  Briefcase, GraduationCap, Languages, FileBarChart, Lock, 
  LayoutGrid, Users, Headphones, Calendar, Settings, FileBox, 
  CheckSquare, Bell, Search, MoreHorizontal, Edit2, Clock, 
  ChevronRight, Share2, ClipboardList
} from 'lucide-react';

// --- Sidebar Component ---
const Sidebar = () => (
  <div className="w-20 flex flex-col items-center py-6 bg-white border-r border-slate-200 h-screen sticky top-0 space-y-8 z-[50]">
    {/* Logo */}
    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    
    {/* Navigation Icons */}
    <div className="flex flex-col space-y-6 w-full items-center">
      <div className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all">
        <LayoutGrid size={24} />
      </div>
      <div className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all">
        <Headphones size={24} />
      </div>
      <div className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all">
        <Users size={24} />
      </div>
      <div className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all">
        <FileBox size={24} />
      </div>
      <div className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all">
        <Calendar size={24} />
      </div>
    </div>

    {/* Bottom Actions */}
    <div className="mt-auto flex flex-col items-center space-y-6">
       <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white ring-1 ring-slate-200">
         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
       </div>
    </div>
  </div>
);

// --- Enquiry List View (Dashboard) ---
const EnquiryList = ({ enquiries }: { enquiries: Enquiry[] }) => (
  <div className="flex-1 p-10 bg-[#F9FAFB] min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
           <div className="flex items-center text-slate-400 text-sm font-semibold mb-2 space-x-2">
              <LayoutGrid size={16} />
              <ChevronRight size={14} />
              <span>CRM</span>
              <ChevronRight size={14} />
              <span className="text-slate-900">Pipeline</span>
           </div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Enquiry Management</h1>
        </div>
        <Link to="/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-200 transition-all text-sm">
          <Plus size={18} className="mr-2" /> New Enquiry
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contact Info</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Documents</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {enquiries.map(enquiry => (
              <tr key={enquiry.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                <td className="px-8 py-5">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-4">
                      {enquiry.firstName[0]}{enquiry.lastName?.[0] || ''}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{enquiry.firstName} {enquiry.lastName}</p>
                      <p className="text-xs text-slate-400 font-medium">ID: E{enquiry.id.slice(0, 4).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600 font-medium">{enquiry.email}</td>
                <td className="px-8 py-5">
                  <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-bold">
                    {enquiry.documents.length} Files
                  </span>
                </td>
                <td className="px-8 py-5">
                  {enquiry.status === EnquiryStatus.VERIFIED ? (
                    <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full w-fit">
                      <ShieldCheck size={14} className="mr-1.5" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600 text-xs font-bold bg-amber-50 px-3 py-1 rounded-full w-fit">
                      <Clock size={14} className="mr-1.5" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-8 py-5 text-right">
                  <Link to={`/details/${enquiry.id}`} className="text-slate-400 hover:text-indigo-600 transition-colors inline-block p-2">
                    <ArrowRight size={20} />
                  </Link>
                </td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-sm font-medium">
                  No active enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// --- Create Enquiry View ---
const CreateEnquiry = ({ onSave }: { onSave: (enquiry: Partial<Enquiry>) => void }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) return;
    setIsProcessing(true);
    onSave({ firstName, lastName, email });
  };

  return (
    <div className="flex-1 p-10 flex items-center justify-center bg-[#F9FAFB]">
      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all">
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">New Enquiry</h1>
        <p className="text-slate-500 text-sm mb-8">Start the ingestion process for a new candidate.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold text-sm" required />
          </div>
          <button type="submit" disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center mt-4">
            {isProcessing ? <Loader2 className="animate-spin mr-2" size={18} /> : <Plus size={18} className="mr-2" />}
            Create Enquiry
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Enquiry Details View (The main CRM UI) ---
const EnquiryDetails = ({ enquiry, onUpload, onVerify, onRemoveDoc }: any) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Details');

  // Verification Checks
  const canVerifyPersonalWork = enquiry.documents.some((d: any) => d.category === DocCategory.RESUME && d.status === DocStatus.EXTRACTED);
  const canVerifyEducation = enquiry.documents.some((d: any) => d.category === DocCategory.TRANSCRIPT && d.status === DocStatus.EXTRACTED);
  const canVerifyLanguage = enquiry.documents.some((d: any) => d.category === DocCategory.LANGUAGE_TEST && d.status === DocStatus.EXTRACTED);
  const canVerifyCOE = enquiry.documents.some((d: any) => d.category === DocCategory.COE && d.status === DocStatus.EXTRACTED);

  // Completion Stats
  const completedSections = [
    enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK],
    enquiry.verificationHistory[VerificationGroup.EDUCATION],
    enquiry.verificationHistory[VerificationGroup.LANGUAGE],
    enquiry.verificationHistory[VerificationGroup.COE]
  ].filter(Boolean).length;
  const progressPercent = (completedSections / 4) * 100;

  // Helper for small side fields
  const SideField = ({ label, value, isVerified }: any) => (
    <div className="mb-4 last:mb-0">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm font-bold ${isVerified ? 'text-slate-800' : 'text-slate-400 italic'}`}>
        {value || 'No Data'}
      </p>
    </div>
  );

  // Helper for Card fields
  const CardField = ({ label, value, isVerified }: any) => (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm font-bold ${isVerified ? 'text-slate-800' : 'text-slate-300 italic'}`}>
        {value || 'No Data'}
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#F9FAFB] min-h-screen overflow-y-auto font-inter">
      {/* 1. Header Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="border-r border-slate-200 pr-4">
             <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
               <LayoutGrid size={20} className="text-slate-600" />
             </button>
          </div>
          <div className="flex items-center text-sm font-medium text-slate-500 space-x-2">
            <span>Office Visit</span>
            <ChevronRight size={16} />
          </div>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
           <ClipboardList size={20} className="hover:text-indigo-600 cursor-pointer" />
           <Share2 size={20} className="hover:text-indigo-600 cursor-pointer" />
           <ShieldCheck size={20} className="hover:text-indigo-600 cursor-pointer" />
           <div className="w-px h-6 bg-slate-200 mx-2" />
           <Search size={20} className="hover:text-indigo-600 cursor-pointer" />
           <div className="relative">
             <Bell size={20} className="hover:text-indigo-600 cursor-pointer" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">2</div>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-8">
        
        {/* 2. Page Title & Status */}
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="mr-4 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mr-4">{enquiry.firstName} {enquiry.lastName}</h1>
          <span className="text-sm font-bold text-slate-400 mr-4">• E{enquiry.id.slice(0, 4).toUpperCase()}</span>
          <div className="flex items-center space-x-2">
             <span className="text-xs font-bold text-slate-400">Status</span>
             <div className="flex items-center bg-white border border-slate-200 rounded-full px-1 py-1 pr-3">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase mr-2">Open</span>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase border border-indigo-100">Contacted</span>
                <ChevronRight size={14} className="ml-1 text-slate-300 rotate-90" />
             </div>
          </div>
        </div>

        {/* 3. Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* --- LEFT COLUMN --- */}
          <div className="col-span-3 space-y-6">
            
            {/* Client Reaction (Position 1) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-slate-900">Client Reaction: <span className="text-blue-500">Cold</span></h3>
               </div>
               <div className="flex justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl cursor-pointer ring-2 ring-blue-200">🥶</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-xl cursor-pointer transition-colors grayscale opacity-60 hover:grayscale-0 hover:opacity-100">😔</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-xl cursor-pointer transition-colors grayscale opacity-60 hover:grayscale-0 hover:opacity-100">😐</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-xl cursor-pointer transition-colors grayscale opacity-60 hover:grayscale-0 hover:opacity-100">😍</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-xl cursor-pointer transition-colors grayscale opacity-60 hover:grayscale-0 hover:opacity-100">🔥</div>
               </div>
            </div>

            {/* Completion Status (Moved Here - Position 2) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Completion Status</h3>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">H</div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">N</div>
                  </div>
               </div>
               <div className="relative pt-2">
                 <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>You've completed {completedSections} out of 4 sections</span>
                    <span className="text-slate-900">{Math.round(progressPercent)}% Completed</span>
                 </div>
                 <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                 </div>
               </div>
            </div>

            {/* Enquiry Meta Data (Position 3) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="text-xs font-bold text-slate-900 mb-4 border-b border-slate-50 pb-2">Enquiry Meta Data</h3>
               <SideField label="Enquiry ID" value={`E${enquiry.id.slice(0, 4).toUpperCase()}`} isVerified={true} />
               <SideField label="Contact ID" value="C7831" isVerified={true} />
               <SideField label="Created date" value={new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} isVerified={true} />
               <SideField label="Campaign" value="Fall Admission" isVerified={true} />
            </div>

          </div>

          {/* --- MIDDLE COLUMN --- */}
          <div className="col-span-6 space-y-6">
            
            {/* Tabs */}
            <div className="flex space-x-8 border-b border-slate-200 px-2">
              {['Details', 'Activity', 'Office Visit', 'Documents'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900 rounded-t-full" />}
                </button>
              ))}
            </div>

            {/* Artifact Repository (Moved Here - Top Card) */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="text-xs font-bold text-slate-500 uppercase">Artifact Repository</h4>
                 <input type="file" multiple id="doc-upload" className="hidden" onChange={e => e.target.files && onUpload(e.target.files)} />
                 <label htmlFor="doc-upload" className="text-indigo-600 text-xs font-bold hover:underline cursor-pointer flex items-center">
                   <Plus size={14} className="mr-1" /> Add
                 </label>
               </div>
               <div className="space-y-3">
                 {enquiry.documents.length === 0 && <p className="text-xs text-slate-400 italic">No documents uploaded.</p>}
                 {enquiry.documents.map((doc: DocumentFile) => (
                   <div key={doc.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start overflow-hidden">
                            <FileText size={16} className="text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-700 truncate block pr-2" title={doc.name}>{doc.name}</span>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {/* Status Badges */}
                                    {doc.status === DocStatus.UPLOADED && (
                                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Uploading</span>
                                    )}
                                    {doc.status === DocStatus.PROCESSING && (
                                    <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded flex items-center">
                                        <Loader2 size={8} className="animate-spin mr-1"/> Processing
                                    </span>
                                    )}
                                    {doc.status === DocStatus.EXTRACTED && (
                                    <>
                                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">Classified</span>
                                        <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 truncate max-w-[100px]">{doc.category}</span>
                                    </>
                                    )}
                                    {doc.status === DocStatus.SKIPPED && (
                                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Other</span>
                                    )}
                                    {doc.status === DocStatus.VERIFIED && (
                                    <>
                                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded flex items-center">
                                            <ShieldCheck size={8} className="mr-1"/> Verified
                                        </span>
                                        <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 truncate max-w-[100px]">{doc.category}</span>
                                    </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onRemoveDoc(doc.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={14} />
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* SECTION 1: Personal Information */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-3">
                     <User size={20} className="text-slate-700" />
                     <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                     {!enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] && <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white"><span className="text-xs font-bold">!</span></div>}
                     <button 
                       onClick={() => canVerifyPersonalWork && onVerify(VerificationGroup.PERSONAL_WORK)}
                       disabled={!canVerifyPersonalWork}
                       className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${canVerifyPersonalWork ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}
                     >
                       Verify
                     </button>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <CardField label="First Name" value={enquiry.verifiedFields.first_name?.value} isVerified={!!enquiry.verifiedFields.first_name?.value} />
                  <CardField label="Last Name" value={enquiry.verifiedFields.last_name?.value} isVerified={!!enquiry.verifiedFields.last_name?.value} />
                  <CardField label="Email" value={enquiry.verifiedFields.email?.value} isVerified={!!enquiry.verifiedFields.email?.value} />
                  <CardField label="Phone" value={enquiry.verifiedFields.phone_with_country_code?.value} isVerified={!!enquiry.verifiedFields.phone_with_country_code?.value} />
                  <CardField label="Gender" value={enquiry.verifiedFields.gender?.value} isVerified={!!enquiry.verifiedFields.gender?.value} />
                  <CardField label="Address" value={enquiry.verifiedFields.address?.value} isVerified={!!enquiry.verifiedFields.address?.value} />
               </div>
            </div>

            {/* SECTION 2: Work Experience */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-3">
                     <Briefcase size={20} className="text-slate-700" />
                     <h3 className="text-sm font-bold text-slate-900">Work Experience</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                     {!enquiry.verificationHistory[VerificationGroup.PERSONAL_WORK] && <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white"><span className="text-xs font-bold">!</span></div>}
                     <button 
                       onClick={() => canVerifyPersonalWork && onVerify(VerificationGroup.PERSONAL_WORK)}
                       disabled={!canVerifyPersonalWork}
                       className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${canVerifyPersonalWork ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}
                     >
                       Verify
                     </button>
                  </div>
               </div>
               <div className="space-y-6">
                  {enquiry.verifiedFields.work_experiences?.value && Array.isArray(enquiry.verifiedFields.work_experiences.value) ? (
                    enquiry.verifiedFields.work_experiences.value.map((exp: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                         <div className="grid grid-cols-2 gap-4">
                            <CardField label="Company" value={exp.company?.value} isVerified={!!exp.company?.value} />
                            <CardField label="Title" value={exp.title?.value} isVerified={!!exp.title?.value} />
                            <CardField label="Duration" value={exp.duration?.value} isVerified={!!exp.duration?.value} />
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-300 italic">No work history recorded.</p>
                  )}
               </div>
            </div>

            {/* SECTION 3: Education Background */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-3">
                     <GraduationCap size={20} className="text-slate-700" />
                     <h3 className="text-sm font-bold text-slate-900">Education Background</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                     {!enquiry.verificationHistory[VerificationGroup.EDUCATION] && <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white"><span className="text-xs font-bold">!</span></div>}
                     <button 
                       onClick={() => canVerifyEducation && onVerify(VerificationGroup.EDUCATION)}
                       disabled={!canVerifyEducation}
                       className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${canVerifyEducation ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}
                     >
                       Verify
                     </button>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <CardField label="Level of Education" value={enquiry.verifiedFields.level_of_education?.value} isVerified={!!enquiry.verifiedFields.level_of_education?.value} />
                  <CardField label="Degree Title" value={enquiry.verifiedFields.degree?.value} isVerified={!!enquiry.verifiedFields.degree?.value} />
                  <CardField label="Course" value={enquiry.verifiedFields.course?.value} isVerified={!!enquiry.verifiedFields.course?.value} />
                  <CardField label="Institution" value={enquiry.verifiedFields.institution?.value} isVerified={!!enquiry.verifiedFields.institution?.value} />
                  <CardField label="Duration" value={enquiry.verifiedFields.edu_duration?.value} isVerified={!!enquiry.verifiedFields.edu_duration?.value} />
                  <CardField label="GPA / Percentage" value={enquiry.verifiedFields.gpa_or_percentage?.value} isVerified={!!enquiry.verifiedFields.gpa_or_percentage?.value} />
                  <CardField label="Year of Completion" value={enquiry.verifiedFields.year_of_completion?.value} isVerified={!!enquiry.verifiedFields.year_of_completion?.value} />
               </div>
            </div>

            {/* SECTION 4: Language Test Scores */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-3">
                     <Languages size={20} className="text-slate-700" />
                     <h3 className="text-sm font-bold text-slate-900">Language Test Scores</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                     {!enquiry.verificationHistory[VerificationGroup.LANGUAGE] && <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white"><span className="text-xs font-bold">!</span></div>}
                     <button 
                       onClick={() => canVerifyLanguage && onVerify(VerificationGroup.LANGUAGE)}
                       disabled={!canVerifyLanguage}
                       className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${canVerifyLanguage ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}
                     >
                       Verify
                     </button>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <CardField label="Test Type" value={enquiry.verifiedFields.test_type?.value} isVerified={!!enquiry.verifiedFields.test_type?.value} />
                  <CardField label="Listening" value={enquiry.verifiedFields.listening_score?.value} isVerified={!!enquiry.verifiedFields.listening_score?.value} />
                  <CardField label="Reading" value={enquiry.verifiedFields.reading_score?.value} isVerified={!!enquiry.verifiedFields.reading_score?.value} />
                  <CardField label="Writing" value={enquiry.verifiedFields.writing_score?.value} isVerified={!!enquiry.verifiedFields.writing_score?.value} />
                  <CardField label="Speaking" value={enquiry.verifiedFields.speaking_score?.value} isVerified={!!enquiry.verifiedFields.speaking_score?.value} />
                  <CardField label="Overall Score" value={enquiry.verifiedFields.overall_score?.value} isVerified={!!enquiry.verifiedFields.overall_score?.value} />
               </div>
            </div>

            {/* SECTION 5: Application Summary (Always Visible) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                 <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                       <FileBarChart size={20} className="text-slate-700" />
                       <h3 className="text-sm font-bold text-slate-900">Application Summary</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                       {!enquiry.verificationHistory[VerificationGroup.COE] && <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white"><span className="text-xs font-bold">!</span></div>}
                       <button 
                         onClick={() => canVerifyCOE && onVerify(VerificationGroup.COE)}
                         disabled={!canVerifyCOE}
                         className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${canVerifyCOE ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}
                       >
                         Verify
                       </button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                    <CardField label="Course Start Date" value={enquiry.verifiedFields.course_start_date?.value} isVerified={!!enquiry.verifiedFields.course_start_date?.value} />
                    <CardField label="Course End Date" value={enquiry.verifiedFields.course_end_date?.value} isVerified={!!enquiry.verifiedFields.course_end_date?.value} />
                    <CardField label="Initial Tuition Fee" value={enquiry.verifiedFields.initial_tuition_fee?.value} isVerified={!!enquiry.verifiedFields.initial_tuition_fee?.value} />
                    <CardField label="Total Tuition Fee" value={enquiry.verifiedFields.total_tuition_fee?.value} isVerified={!!enquiry.verifiedFields.total_tuition_fee?.value} />
                 </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="col-span-3">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-140px)] sticky top-32">
                {/* Tabs */}
                <div className="flex border-b border-slate-100 p-2">
                   <div className="flex bg-slate-100 p-1 rounded-lg w-full">
                      <button className="flex-1 py-1.5 bg-white text-indigo-600 shadow-sm rounded-md text-xs font-bold flex items-center justify-center">
                        <FileText size={14} className="mr-2" /> Notes
                      </button>
                      <button className="flex-1 py-1.5 text-slate-500 text-xs font-bold flex items-center justify-center hover:bg-slate-200/50 rounded-md transition-colors">
                        <CheckSquare size={14} className="mr-2" /> Tasks
                      </button>
                   </div>
                </div>

                {/* Filter */}
                <div className="p-4 border-b border-slate-50">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-bold text-slate-900">My Notes</span>
                     <ChevronRight size={14} className="text-slate-400 rotate-90" />
                   </div>
                   <div className="relative">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400" placeholder="search notes..." />
                   </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                         <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Phone Call</span>
                         <Edit2 size={12} className="text-slate-300 group-hover:text-indigo-400" />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        Nikki Gurung has expressed a clear intention to pursue her master's degree in the United States, demonstrating strong motivation...
                        <span className="text-indigo-600 font-bold ml-1 cursor-pointer">see more</span>
                      </p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2">
                           <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">SS</div>
                           <span className="text-[10px] font-bold text-slate-900">Sairose Shrestha</span>
                         </div>
                         <span className="text-[9px] font-bold text-slate-400">25/11/2025</span>
                      </div>
                   </div>
                </div>

                {/* Add Note Button */}
                <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
                   <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-200 transition-all flex items-center justify-center">
                     <Plus size={16} className="mr-2" /> Add a note
                   </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- App Component ---
const App = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [verificationSession, setVerificationSession] = useState<{ enquiryId: string, group: VerificationGroup } | null>(null);

  const handleCreateEnquiry = (data: Partial<Enquiry>) => {
    const newEnquiry: Enquiry = {
      id: Math.random().toString(36).substring(7),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      status: EnquiryStatus.UNVERIFIED,
      documents: [],
      verifiedFields: {},
      verificationHistory: {
        [VerificationGroup.PERSONAL_WORK]: null,
        [VerificationGroup.EDUCATION]: null,
        [VerificationGroup.LANGUAGE]: null,
        [VerificationGroup.COE]: null
      }
    };
    setEnquiries(prev => [newEnquiry, ...prev]);
  };

  const processDocumentUpload = async (enquiryId: string, files: FileList) => {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        const reader = new FileReader();
        const fileId = Math.random().toString(36).substring(7);

        const promise = new Promise<void>((resolve) => {
            reader.onload = async (e) => {
                const base64 = (e.target?.result as string).split(',')[1];
                
                // 1. Initial State: Uploading
                // Explicitly set Category to OTHER initially to avoid showing it prematurely
                const newDoc: DocumentFile = {
                    id: fileId,
                    name: file.name,
                    category: DocCategory.OTHER, 
                    status: DocStatus.UPLOADED,
                    base64,
                    mimeType: file.type
                };

                setEnquiries(prev => prev.map(enq => 
                    enq.id === enquiryId ? { ...enq, documents: [...enq.documents, newDoc] } : enq
                ));

                try {
                    // 2. State Transition: Processing
                    setEnquiries(prev => prev.map(enq => 
                        enq.id === enquiryId ? { 
                            ...enq, 
                            documents: enq.documents.map(d => d.id === fileId ? { ...d, status: DocStatus.PROCESSING } : d) 
                        } : enq
                    ));

                    // 3. Classification
                    const category = await classifyDocument(base64, file.type);
                    
                    // Update category but keep status as Processing (or Skipped if Other)
                    setEnquiries(prev => prev.map(enq => 
                        enq.id === enquiryId ? { 
                            ...enq, 
                            documents: enq.documents.map(d => d.id === fileId ? { 
                                ...d, 
                                category, 
                                status: category === DocCategory.OTHER ? DocStatus.SKIPPED : DocStatus.PROCESSING 
                            } : d) 
                        } : enq
                    ));

                    // 4. Extraction & Final State: Classified (EXTRACTED)
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
                    console.error("Pipeline failed for file", file.name, error);
                    // On error, we could set status to SKIPPED or leave as PROCESSING with an error flag (omitted for brevity)
                }
                resolve();
            };
            reader.readAsDataURL(file);
        });
        await promise;
    }
  };

  const handleVerifyComplete = (verifiedData: Partial<ExtractedData>, verifiedDocIds: string[]) => {
    if (!verificationSession) return;
    const { enquiryId, group } = verificationSession;

    setEnquiries(prev => prev.map(e => {
      if (e.id !== enquiryId) return e;

      const updatedFields = { ...e.verifiedFields };
      Object.entries(verifiedData).forEach(([key, val]) => {
         if (key === 'work_experiences') {
             updatedFields[key] = {
                 value: val,
                 isUserProvided: false,
                 verifiedAt: new Date().toISOString()
             };
         } else if (val && (val as any).value !== undefined) {
             updatedFields[key] = {
                 value: (val as any).value,
                 isUserProvided: false,
                 verifiedAt: new Date().toISOString()
             };
         }
      });

      const updatedDocs = e.documents.map(d => 
        verifiedDocIds.includes(d.id) ? { ...d, status: DocStatus.VERIFIED } : d
      );

      const updatedHistory = {
          ...e.verificationHistory,
          [group]: { timestamp: new Date().toISOString(), docs: verifiedDocIds }
      };
      
      const allVerified = Object.values(updatedHistory).every(v => v !== null);

      return {
        ...e,
        documents: updatedDocs,
        verifiedFields: updatedFields,
        verificationHistory: updatedHistory,
        status: allVerified ? EnquiryStatus.VERIFIED : e.status
      };
    }));
    
    setVerificationSession(null);
  };
  
  const handleRemoveDoc = (enquiryId: string, docId: string) => {
      setEnquiries(prev => prev.map(e => {
          if (e.id !== enquiryId) return e;
          return { ...e, documents: e.documents.filter(d => d.id !== docId) };
      }));
  };

  const activeEnquiry = verificationSession ? enquiries.find(e => e.id === verificationSession.enquiryId) : null;

  return (
    <HashRouter>
      <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
        <Sidebar />
        <Routes>
          <Route path="/" element={<EnquiryList enquiries={enquiries} />} />
          <Route path="/create" element={<CreateEnquiryWrapper onSave={handleCreateEnquiry} />} />
          <Route path="/details/:id" element={<EnquiryDetailsWrapper enquiries={enquiries} onUpload={processDocumentUpload} onStartVerification={(id: string, group: VerificationGroup) => setVerificationSession({enquiryId: id, group})} onRemoveDoc={handleRemoveDoc} />} />
        </Routes>

        {verificationSession && activeEnquiry && (
            <VerificationWizard 
                enquiry={activeEnquiry}
                group={verificationSession.group}
                onComplete={handleVerifyComplete}
                onCancel={() => setVerificationSession(null)}
            />
        )}
      </div>
    </HashRouter>
  );
};

const CreateEnquiryWrapper = ({ onSave }: { onSave: (data: Partial<Enquiry>) => void }) => {
    const navigate = useNavigate();
    return <CreateEnquiry onSave={(data) => {
        onSave(data);
        navigate('/');
    }} />;
}

const EnquiryDetailsWrapper = ({ enquiries, onUpload, onStartVerification, onRemoveDoc }: any) => {
    const { id } = useParams();
    const enquiry = enquiries.find((e: Enquiry) => e.id === id);
    if (!enquiry) return <div className="p-10">Enquiry not found</div>;
    
    return <EnquiryDetails 
        enquiry={enquiry} 
        onUpload={(files: FileList) => onUpload(id, files)} 
        onVerify={(group: VerificationGroup) => onStartVerification(id, group)}
        onRemoveDoc={(docId: string) => onRemoveDoc(id, docId)}
    />;
}

export default App;
