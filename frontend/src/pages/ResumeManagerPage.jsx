import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, Sparkles, FileCode2 } from 'lucide-react';

export const ResumeManagerPage = () => {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/');
      if (res.data.success) {
        setResumes(res.data.resumes);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setErrorMsg("Only PDF resumes are supported.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File size cannot exceed 10MB.");
        return;
      }
      setErrorMsg('');
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setErrorMsg('');
    setMessage('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setMessage("Resume uploaded! Background parser is extracting skills...");
        setSelectedFile(null);
        setTimeout(fetchResumes, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const activeResume = resumes[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="space-y-1 border-b border-[#E5E5E5] pb-4">
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Resume Manager</h1>
        <p className="text-sm text-[#666666]">Upload your PDF resume to generate structured skills, experience profiles, and job recommendation matches.</p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-xl p-8 border border-dashed border-[#E5E5E5] text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] mx-auto flex items-center justify-center">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#111111]">Upload Resume PDF</h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto">
            Supported format: PDF up to 10MB. Asynchronous non-blocking background skill extractor.
          </p>
        </div>

        {errorMsg && (
          <div className="max-w-md mx-auto p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {message && (
          <div className="max-w-md mx-auto p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-3 max-w-md mx-auto">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload-input"
          />
          <label
            htmlFor="resume-upload-input"
            className="cursor-pointer inline-block px-5 py-2.5 rounded-lg bg-[#FAFAF9] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#111111] text-xs font-semibold transition-colors"
          >
            {selectedFile ? selectedFile.name : "Select PDF File"}
          </label>

          {selectedFile && (
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              {uploading ? "Uploading & Processing..." : "Upload & Parse PDF"}
            </button>
          )}
        </form>
      </div>

      {/* Resume Version History */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E5E5E5] space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <h3 className="text-base font-bold text-[#111111]">Version History</h3>
          <button onClick={fetchResumes} className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </button>
        </div>

        {loading ? (
          <div className="h-24 animate-pulse bg-[#FAFAF9] rounded-lg" />
        ) : activeResume && activeResume.active_version ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                  v{activeResume.active_version.version_number}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111111]">{activeResume.active_version.file_name}</h4>
                  <span className="text-[11px] text-[#666666] flex items-center gap-2 mt-0.5">
                    <span>{(activeResume.active_version.file_size / 1024).toFixed(1)} KB</span>
                    <span>·</span>
                    <span>Uploaded on {new Date(activeResume.active_version.uploaded_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  activeResume.active_version.parsing_status === 'COMPLETED'
                    ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                    : activeResume.active_version.parsing_status === 'PROCESSING'
                    ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}>
                  {activeResume.active_version.parsing_status}
                </span>

                {activeResume.active_version.file_url && (
                  <a
                    href={activeResume.active_version.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    View File
                  </a>
                )}
              </div>
            </div>

            {/* Extracted Structured Data Section */}
            {activeResume.active_version.parsed_data && (
              <div className="bg-white rounded-lg p-4 border border-[#E5E5E5] space-y-2.5">
                <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Extracted Skills from PDF
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeResume.active_version.parsed_data.structured_data?.skills?.map((sk, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-0.5 rounded-md bg-stone-100 text-[#444444] border border-[#E5E5E5] font-medium">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#8A8A8A] italic py-4 text-center">No resume uploaded yet.</p>
        )}

      </div>

    </div>
  );
};
