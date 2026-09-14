import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminJobFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [workMode, setWorkMode] = useState('REMOTE');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('ENTRY');
  const [location, setLocation] = useState('Remote');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [isSalaryUndisclosed, setIsSalaryUndisclosed] = useState(true);
  const [applicationUrl, setApplicationUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      const fetchJobDetails = async () => {
        try {
          const res = await api.get(`/jobs/${id}/`);
          if (res.data.success && res.data.job) {
            const j = res.data.job;
            setCompanyName(j.company?.name || '');
            setTitle(j.title || '');
            setWorkMode(j.work_mode || 'REMOTE');
            setEmploymentType(j.employment_type || 'FULL_TIME');
            setExperienceLevel(j.experience_level || 'ENTRY');
            setLocation(j.location || '');
            setDescription(j.description || '');
            setApplicationUrl(j.application_url || '');
            if (j.required_skills) {
              setSkillsText(j.required_skills.map(s => s.name).join(', '));
            }
          }
        } catch (err) {
          console.error("Failed to load job details for editing:", err);
        }
      };
      fetchJobDetails();
    }
  }, [isEdit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const payload = {
      company_name: companyName,
      company: companyName,
      title,
      department,
      work_mode: workMode,
      employment_type: employmentType,
      experience_level: experienceLevel,
      location,
      description: `${description}\n\nRequirements:\n${requirements}`,
      skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
      salary_min: isSalaryUndisclosed ? null : salaryMin,
      salary_max: isSalaryUndisclosed ? null : salaryMax,
      application_url: applicationUrl || 'https://jobsphere.internal/apply',
      contact_email: contactEmail,
    };

    try {
      const res = isEdit
        ? await api.put(`/admin/jobs/${id}/`, payload)
        : await api.post('/admin/jobs/create/', payload);

      if (res.data.success) {
        setSuccessMsg(isEdit ? "Job updated successfully." : "Job submitted for verification successfully.");
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || "Failed to submit job listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#111111] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">
          {isEdit ? "Edit Job Listing" : "Post a New Job"}
        </h1>
        <p className="text-xs text-[#666666]">
          Submit opportunity details for admin authentication & platform verification.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Job Information */}
        <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] space-y-4">
          <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">
            1. Job Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. TriNet, Google, Microsoft"
                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering, Product, Analytics"
                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">Job Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="ENTRY">Entry Level</option>
                <option value="MID">Mid Level</option>
                <option value="SENIOR">Senior Level</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hyderabad, India or Remote"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Section 2: Job Description & Requirements */}
        <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] space-y-4">
          <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">
            2. Description & Requirements
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Job Description</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed opportunity overview, key responsibilities, and team structure..."
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Requirements & Qualifications</label>
            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Educational background, minimum experience, key skill requirements..."
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Required Skills (Comma separated)</label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Python, React, Django, PostgreSQL"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Section 3: Compensation (Optional) */}
        <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] space-y-4">
          <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">
            3. Compensation (Optional)
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="salaryUndisclosed"
              checked={isSalaryUndisclosed}
              onChange={(e) => setIsSalaryUndisclosed(e.target.checked)}
              className="rounded text-[#2563EB] focus:ring-0"
            />
            <label htmlFor="salaryUndisclosed" className="text-xs text-[#666666]">
              Keep compensation undisclosed / competitive
            </label>
          </div>

          {!isSalaryUndisclosed && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Minimum Annual Salary ($)</label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="60000"
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Maximum Annual Salary ($)</label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="90000"
                  className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Application Settings */}
        <div className="bg-white rounded-xl p-6 border border-[#E5E5E5] space-y-4">
          <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#E5E5E5] pb-3">
            4. Application Settings
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Direct External Application URL</label>
            <input
              type="url"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              placeholder="https://company.com/careers/apply"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1">Hiring Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="recruiter@company.com"
              className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Section 5: Verification Notice Box */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-700" /> Platform Verification Standard
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Your job submission will be reviewed by our administration team before publication to maintain platform quality and eliminate spam.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/dashboard"
            className="px-5 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#666666] font-semibold text-xs hover:text-[#111111]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Job for Verification"}
          </button>
        </div>

      </form>

    </div>
  );
};
