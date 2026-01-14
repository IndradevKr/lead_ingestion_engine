
import React, { useState, useEffect, useMemo } from 'react';
import { Enquiry, DocCategory, DocStatus, ExtractedData, VerificationGroup, BoundingBox, Confidence } from '../types';
import PDFViewer from './PDFViewer';
import { ArrowRight, AlertTriangle, Lightbulb, ShieldCheck, Loader2, Plus, Trash2, User, Briefcase, GraduationCap, Languages, FileBarChart } from 'lucide-react';

interface VerificationWizardProps {
  enquiry: Enquiry;
  group: VerificationGroup;
  onComplete: (verifiedData: Partial<ExtractedData>, verifiedDocIds: string[]) => void;
  onCancel: () => void;
}

const VerificationWizard: React.FC<VerificationWizardProps> = ({ enquiry, group, onComplete, onCancel }) => {
  const isProcessingDocs = useMemo(() => {
    let categories: DocCategory[] = [];
    if (group === VerificationGroup.PERSONAL_WORK) categories = [DocCategory.RESUME];
    else if (group === VerificationGroup.EDUCATION) categories = [DocCategory.TRANSCRIPT];
    else if (group === VerificationGroup.LANGUAGE) categories = [DocCategory.LANGUAGE_TEST];
    else if (group === VerificationGroup.COE) categories = [DocCategory.COE];

    return enquiry.documents.some(d => categories.includes(d.category) && d.status === DocStatus.PROCESSING);
  }, [enquiry.documents, group]);

  const targetDocs = useMemo(() => {
    let categories: DocCategory[] = [];
    if (group === VerificationGroup.PERSONAL_WORK) categories = [DocCategory.RESUME];
    else if (group === VerificationGroup.EDUCATION) categories = [DocCategory.TRANSCRIPT];
    else if (group === VerificationGroup.LANGUAGE) categories = [DocCategory.LANGUAGE_TEST];
    else if (group === VerificationGroup.COE) categories = [DocCategory.COE];

    return enquiry.documents.filter(d => categories.includes(d.category) && d.status === DocStatus.EXTRACTED);
  }, [enquiry.documents, group]);

  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [formState, setFormState] = useState<ExtractedData>({});
  const [hoveredField, setHoveredField] = useState<{ box?: BoundingBox, label?: 'Green' | 'Yellow' | 'Red' }>({});

  const currentDoc = targetDocs[currentDocIndex];

  useEffect(() => {
    const mergedData: ExtractedData = {};
    targetDocs.forEach(doc => {
      if (doc.extractedData) {
        Object.keys(doc.extractedData).forEach(key => {
          if (key !== 'work_experiences') {
            (mergedData as any)[key] = (doc.extractedData as any)[key];
          }
        });
        if (doc.extractedData.work_experiences) {
          mergedData.work_experiences = [
            ...(mergedData.work_experiences || []),
            ...doc.extractedData.work_experiences
          ];
        }
      }
    });
    setFormState(mergedData);
  }, [targetDocs]);

  const handleNext = () => {
    if (currentDocIndex < targetDocs.length - 1) {
      setCurrentDocIndex(prev => prev + 1);
      setHoveredField({});
    } else {
      const verifiedIds = targetDocs.map(d => d.id);
      onComplete(formState, verifiedIds);
    }
  };

  const renderField = (label: string, valueObj: Confidence | undefined, onChange: (newVal: any) => void) => {
    const confidenceLabel = valueObj?.confidence_label || 'Red';
    const confidenceClass = confidenceLabel === 'Green' ? 'border-emerald-200 bg-emerald-50 focus-within:ring-emerald-500' :
                           confidenceLabel === 'Yellow' ? 'border-amber-200 bg-amber-50 focus-within:ring-amber-500' : 
                           'border-rose-200 bg-rose-50 focus-within:ring-rose-500';

    return (
      <div 
        className="mb-4" 
        onMouseEnter={() => setHoveredField({ box: valueObj?.bounding_box, label: confidenceLabel })}
        onMouseLeave={() => setHoveredField({})}
      >
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
          {valueObj?.confidence_score !== undefined && (
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
              confidenceLabel === 'Green' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              confidenceLabel === 'Yellow' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-rose-100 text-rose-700 border-rose-200'
            }`}>
              {valueObj.confidence_score}%
            </span>
          )}
        </div>
        <div className={`flex items-center border rounded-xl px-4 py-2.5 transition-all ${confidenceClass} focus-within:ring-2`}>
          <input
            type="text"
            value={valueObj?.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-slate-900 font-bold text-sm placeholder:text-slate-300"
            placeholder={`Enter ${label}...`}
          />
        </div>
      </div>
    );
  };

  const handleFieldChange = (key: keyof ExtractedData, newVal: any) => {
    setFormState(prev => ({
      ...prev,
      [key]: { ...(prev as any)[key], value: newVal }
    }));
  };

  const handleWorkExperienceChange = (index: number, field: 'company' | 'title' | 'duration', newVal: any) => {
    const updated = [...(formState.work_experiences || [])];
    updated[index] = {
      ...updated[index],
      [field]: { ...updated[index][field], value: newVal }
    };
    setFormState(prev => ({ ...prev, work_experiences: updated }));
  };

  if (isProcessingDocs && targetDocs.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-2xl z-[100] flex items-center justify-center flex-col p-8 text-center text-white">
        <Loader2 className="text-blue-500 animate-spin mb-10" size={80} />
        <h2 className="text-3xl font-black uppercase tracking-tighter">Gemini Context Synthesis</h2>
        <p className="text-slate-400 mt-6 font-bold uppercase text-[11px] tracking-[0.3em] max-w-md leading-relaxed">
          Mapping spatial coordinates and extracting multi-page artifacts for high-fidelity comparison.
        </p>
        <button onClick={onCancel} className="mt-16 text-slate-500 hover:text-white font-black uppercase text-[11px] tracking-widest transition-all">Cancel Synchronization</button>
      </div>
    );
  }

  if (!currentDoc) return (
    <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center flex-col p-8 text-center">
      <div className="bg-amber-50 p-8 rounded-[40px] mb-8 text-amber-500">
        <AlertTriangle size={64} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Artifact Sequence Interrupted</h2>
      <p className="text-slate-500 mt-4 font-bold uppercase text-xs tracking-widest">Required {group} document not ready for audit.</p>
      <button onClick={onCancel} className="mt-12 bg-slate-900 text-white px-12 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all">Close Portal</button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col font-inter">
      <header className="h-24 border-b flex items-center justify-between px-10 bg-slate-900 text-white shadow-2xl z-20">
        <div className="flex items-center space-x-6">
          <div className="bg-blue-600 h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">V</div>
          <div>
            <h2 className="font-black text-[9px] uppercase tracking-[0.3em] text-blue-400 mb-0.5">Audit In Progress: {currentDoc.category}</h2>
            <p className="text-2xl font-black tracking-tighter uppercase">{group}</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={onCancel} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">Abort</button>
          <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center transform hover:-translate-y-0.5 active:translate-y-0">
            {currentDocIndex === targetDocs.length - 1 ? 'Complete Ingestion' : 'Next Step'}
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 border-r bg-slate-900 relative">
          <PDFViewer 
            base64={currentDoc.base64} 
            highlightBox={hoveredField.box} 
            confidenceLabel={hoveredField.label}
          />
        </div>
        <aside className="w-[500px] bg-white overflow-y-auto p-10 flex flex-col shadow-2xl z-10 scrollbar-thin">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tighter flex items-center uppercase">
              <ShieldCheck className="mr-3 text-blue-600" size={24} /> Field Verification
            </h3>
          </div>
          
          <div className="space-y-12">
            {group === VerificationGroup.PERSONAL_WORK && (
              <>
                <section>
                  <h4 className="text-[11px] font-black text-blue-600 tracking-[0.2em] uppercase mb-6 flex items-center">
                    <User className="mr-2" size={16} /> Personal Information
                  </h4>
                  {renderField('First Name', formState.first_name, (v) => handleFieldChange('first_name', v))}
                  {renderField('Last Name', formState.last_name, (v) => handleFieldChange('last_name', v))}
                  {renderField('Email Address', formState.email, (v) => handleFieldChange('email', v))}
                  {renderField('Phone Number', formState.phone_with_country_code, (v) => handleFieldChange('phone_with_country_code', v))}
                  {renderField('Gender', formState.gender, (v) => handleFieldChange('gender', v))}
                  {renderField('Current Address', formState.address, (v) => handleFieldChange('address', v))}
                </section>
                
                <section>
                  <h4 className="text-[11px] font-black text-indigo-600 tracking-[0.2em] uppercase mb-6 flex items-center">
                    <Briefcase className="mr-2" size={16} /> Professional Experience
                  </h4>
                  {(formState.work_experiences || []).map((exp, idx) => (
                    <div key={idx} className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                      <div className="absolute top-3 right-3">
                        <button onClick={() => {
                          const updated = [...(formState.work_experiences || [])];
                          updated.splice(idx, 1);
                          setFormState(prev => ({ ...prev, work_experiences: updated }));
                        }} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-4">Record {idx + 1}</p>
                      {renderField('Organization', exp.company, (v) => handleWorkExperienceChange(idx, 'company', v))}
                      {renderField('Job Title', exp.title, (v) => handleWorkExperienceChange(idx, 'title', v))}
                      {renderField('Service Period', exp.duration, (v) => handleWorkExperienceChange(idx, 'duration', v))}
                    </div>
                  ))}
                  <button onClick={() => {
                    const newItem = { 
                      company: { value: '', confidence_score: 0, confidence_label: 'Red' } as Confidence, 
                      title: { value: '', confidence_score: 0, confidence_label: 'Red' } as Confidence, 
                      duration: { value: '', confidence_score: 0, confidence_label: 'Red' } as Confidence 
                    };
                    setFormState(prev => ({ ...prev, work_experiences: [...(prev.work_experiences || []), newItem] }));
                  }} className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black uppercase text-[9px] tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center">
                    <Plus size={14} className="mr-2" /> Append Experience
                  </button>
                </section>
              </>
            )}

            {group === VerificationGroup.EDUCATION && (
              <section>
                <h4 className="text-[11px] font-black text-emerald-600 tracking-[0.2em] uppercase mb-6 flex items-center">
                  <GraduationCap className="mr-2" size={16} /> Educational Profile
                </h4>
                {renderField('Education Level', formState.level_of_education, (v) => handleFieldChange('level_of_education', v))}
                {renderField('Degree Title', formState.degree, (v) => handleFieldChange('degree', v))}
                {renderField('Course of Study', formState.course, (v) => handleFieldChange('course', v))}
                {renderField('University / School', formState.institution, (v) => handleFieldChange('institution', v))}
                {renderField('Academic Period', formState.edu_duration, (v) => handleFieldChange('edu_duration', v))}
                {renderField('GPA / Marks', formState.gpa_or_percentage, (v) => handleFieldChange('gpa_or_percentage', v))}
                {renderField('Year Conferred', formState.year_of_completion, (v) => handleFieldChange('year_of_completion', v))}
              </section>
            )}

            {group === VerificationGroup.LANGUAGE && (
              <section>
                <h4 className="text-[11px] font-black text-amber-500 tracking-[0.2em] uppercase mb-6 flex items-center">
                  <Languages className="mr-2" size={16} /> Language Proficiency
                </h4>
                {renderField('Test Standard', formState.test_type, (v) => handleFieldChange('test_type', v))}
                <div className="grid grid-cols-2 gap-x-4">
                  {renderField('Listening', formState.listening_score, (v) => handleFieldChange('listening_score', v))}
                  {renderField('Reading', formState.reading_score, (v) => handleFieldChange('reading_score', v))}
                  {renderField('Writing', formState.writing_score, (v) => handleFieldChange('writing_score', v))}
                  {renderField('Speaking', formState.speaking_score, (v) => handleFieldChange('speaking_score', v))}
                </div>
                {renderField('Overall Score', formState.overall_score, (v) => handleFieldChange('overall_score', v))}
              </section>
            )}

            {group === VerificationGroup.COE && (
              <section>
                <h4 className="text-[11px] font-black text-rose-500 tracking-[0.2em] uppercase mb-6 flex items-center">
                  <FileBarChart className="mr-2" size={16} /> Enrollment Data
                </h4>
                <div className="grid grid-cols-2 gap-x-4">
                  {renderField('Course Start', formState.course_start_date, (v) => handleFieldChange('course_start_date', v))}
                  {renderField('Course End', formState.course_end_date, (v) => handleFieldChange('course_end_date', v))}
                  {renderField('Initial Deposit', formState.initial_tuition_fee, (v) => handleFieldChange('initial_tuition_fee', v))}
                  {renderField('Total Tuition', formState.total_tuition_fee, (v) => handleFieldChange('total_tuition_fee', v))}
                </div>
              </section>
            )}
          </div>

          <div className="mt-12 p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-all pointer-events-none">
              <Lightbulb size={100} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Audit Logic</p>
            <p className="text-[10px] font-bold tracking-tight leading-relaxed text-slate-300">
              Hover over a field to visualize its spatial anchor on the stable base layer. Confidence scoring is AI-inferred.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default VerificationWizard;
