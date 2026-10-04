import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CVPreview from "../components/CVPreview";
import { api, errMsg } from "../lib/api";
import { PATHWAY_TABS, TAB_LABELS, PATHWAY_LABELS } from "../lib/pathways";
import {
  PersonalForm, ProfileForm, ExperienceForm, EducationForm, SkillsForm,
  CoursesForm, LanguagesForm, ProjectsForm, AvailabilityForm, CareForm,
  DomesticForm, ServicesForm, AdaptForm, ReferencesForm,
} from "../components/editor/SectionForms";
import { toast } from "sonner";
import { Eye, PencilLine, Check, Loader2, Smartphone } from "lucide-react";
import { ResumeCodeDialog } from "../components/editor/ResumeCodeDialog";

export default function Editor() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileView, setMobileView] = useState("edit");
  const [saveState, setSaveState] = useState("saved");
  const [showResume, setShowResume] = useState(false);
  const saveTimer = useRef(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/drafts/${token}`);
        setContent(data.content);
        localStorage.setItem("kp_draft_token", token);
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // autosave debounced
  useEffect(() => {
    if (!content || firstLoad.current) { firstLoad.current = false; return; }
    setSaveState("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.put(`/drafts/${token}`, { content });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [content, token]);

  const set = useCallback((next) => setContent(next), []);

  if (loading) {
    return <Layout><div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" /></div></Layout>;
  }
  if (notFound) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-20">
          <h1 className="font-head text-2xl font-bold text-[#1C2D42]">Rascunho não encontrado</h1>
          <p className="text-slate-600 mt-2">Este rascunho pode ter sido removido. Comece um novo currículo.</p>
          <button data-testid="editor-restart" onClick={() => navigate("/criar")} className="mt-6 px-5 py-3 rounded-full bg-[#1C2D42] text-white font-semibold">Começar novo</button>
        </div>
      </Layout>
    );
  }

  const tabs = PATHWAY_TABS[content.pathway] || PATHWAY_TABS.procurar_emprego;
  const tabKey = tabs[activeTab];
  const progress = Math.round(((activeTab + 1) / tabs.length) * 100);
  const target = content.target_profession;

  const renderTab = () => {
    switch (tabKey) {
      case "adapt": return <AdaptForm content={content} set={set} />;
      case "personal": return <PersonalForm content={content} set={set} />;
      case "profile": return <ProfileForm content={content} set={set} />;
      case "experience": return <ExperienceForm content={content} set={set} />;
      case "education": return <EducationForm content={content} set={set} />;
      case "skills": return <SkillsForm content={content} set={set} targetProfession={target} />;
      case "courses": return <CoursesForm content={content} set={set} />;
      case "languages": return <LanguagesForm content={content} set={set} />;
      case "projects": return <ProjectsForm content={content} set={set} />;
      case "availability": return <AvailabilityForm content={content} set={set} />;
      case "care": return <CareForm content={content} set={set} />;
      case "domestic": return <DomesticForm content={content} set={set} />;
      case "services": return <ServicesForm content={content} set={set} />;
      case "references": return <ReferencesForm content={content} set={set} />;
      default: return null;
    }
  };

  const next = () => {
    if (activeTab < tabs.length - 1) { setActiveTab(activeTab + 1); window.scrollTo(0, 0); }
    else navigate(`/rever/${token}`);
  };
  const back = () => { if (activeTab > 0) { setActiveTab(activeTab - 1); window.scrollTo(0, 0); } };

  return (
    <Layout full>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold text-[#D97706] uppercase tracking-wide">{PATHWAY_LABELS[content.pathway]}</p>
            <h1 className="font-head text-2xl font-extrabold text-[#1C2D42]">Criador de currículo</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500" data-testid="save-state">
            <button data-testid="resume-code-open" onClick={() => setShowResume(true)} className="flex items-center gap-1 text-[#2563EB] font-semibold hover:underline">
              <Smartphone className="w-4 h-4" /> <span className="hidden sm:inline">Continuar noutro telemóvel</span><span className="sm:hidden">Código</span>
            </button>
            {saveState === "saving" && <span className="flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" /> A guardar…</span>}
            {saveState === "saved" && <span className="flex items-center gap-1 text-[#059669]"><Check className="w-4 h-4" /> Guardado</span>}
            {saveState === "error" && <span className="text-red-500">Erro ao guardar</span>}
          </div>
        </div>

        {/* progress */}
        <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-[#2563EB] transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* mobile toggle */}
        <div className="lg:hidden mt-4 grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-full">
          <button data-testid="mobile-edit-tab" onClick={() => setMobileView("edit")}
            className={`py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-1 ${mobileView === "edit" ? "bg-white shadow text-[#1C2D42]" : "text-slate-500"}`}>
            <PencilLine className="w-4 h-4" /> Editar
          </button>
          <button data-testid="mobile-preview-tab" onClick={() => setMobileView("preview")}
            className={`py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-1 ${mobileView === "preview" ? "bg-white shadow text-[#1C2D42]" : "text-slate-500"}`}>
            <Eye className="w-4 h-4" /> Pré-visualizar
          </button>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          {/* EDITOR */}
          <div className={`${mobileView === "preview" ? "hidden" : "block"} lg:block`}>
            {/* section tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {tabs.map((t, i) => (
                <button key={t} data-testid={`tab-${t}`} onClick={() => setActiveTab(i)}
                  className={`whitespace-nowrap px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${i === activeTab ? "bg-[#1C2D42] text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <h2 className="font-head font-bold text-[#1C2D42] text-lg mb-4">{TAB_LABELS[tabKey]}</h2>
              {renderTab()}
            </div>

            <div className="mt-5 flex justify-between">
              <button data-testid="editor-back" onClick={back} disabled={activeTab === 0}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-600 font-semibold disabled:opacity-40">Voltar</button>
              <div className="flex gap-2">
                <button data-testid="editor-save-later" onClick={() => toast.success("Rascunho guardado neste dispositivo. Pode voltar mais tarde.")}
                  className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-600 font-semibold hidden sm:inline">Guardar e continuar depois</button>
                <button data-testid="editor-next" onClick={next}
                  className="px-6 py-2.5 rounded-full bg-[#2563EB] text-white font-semibold">
                  {activeTab < tabs.length - 1 ? "Continuar" : "Rever e finalizar"}
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className={`${mobileView === "edit" ? "hidden" : "block"} lg:block`}>
            <div className="lg:sticky lg:top-20">
              <div className="cv-scale-wrap rounded-2xl">
                <div className="cv-zoom">
                  <CVPreview content={content} watermark />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showResume && <ResumeCodeDialog token={token} onClose={() => setShowResume(false)} />}
    </Layout>
  );
}
