import React, { useState, useEffect, useRef } from "react";
import { api } from "../../lib/api";
import { skillSuggestions, CARE_GROUPS, EXP_CONTEXTS } from "../../lib/pathways";
import { Plus, Trash2, Sparkles, Pencil, Search, X } from "lucide-react";
import { toast } from "sonner";

export function Field({ label, value, onChange, placeholder, type = "text", testid, optional }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label} {optional && <span className="text-slate-400 font-normal">(opcional)</span>}</span>
      <input data-testid={testid} type={type} value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#2563EB] outline-none" />
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, testid, optional }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label} {optional && <span className="text-slate-400 font-normal">(opcional)</span>}</span>
      <textarea data-testid={testid} rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#2563EB] outline-none" />
    </label>
  );
}

function EntryCard({ children, onRemove, testid }) {
  return (
    <div className="relative rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
      <button data-testid={testid} onClick={onRemove} className="absolute top-3 right-3 text-slate-400 hover:text-red-500">
        <Trash2 className="w-4 h-4" />
      </button>
      {children}
    </div>
  );
}

function AddButton({ onClick, label, testid }) {
  return (
    <button data-testid={testid} onClick={onClick}
      className="flex items-center gap-2 text-[#2563EB] font-semibold text-sm hover:underline">
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

// ---------------- Dados pessoais
export function PersonalForm({ content, set }) {
  const p = content.personal;
  const upd = (k, v) => set({ ...content, personal: { ...p, [k]: v } });
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Primeiro nome" value={p.first_name} onChange={(v) => upd("first_name", v)} testid="input-first-name" placeholder="Ex.: Ana" />
      <Field label="Apelido" value={p.last_name} onChange={(v) => upd("last_name", v)} testid="input-last-name" placeholder="Ex.: Domingos" />
      <Field label="Telefone / WhatsApp" value={p.phone} onChange={(v) => upd("phone", v)} testid="input-phone" placeholder="+244 9XX XXX XXX" />
      <Field label="Cidade / Município" value={p.city} onChange={(v) => upd("city", v)} testid="input-city" placeholder="Ex.: Luanda" />
      <Field label="E-mail" value={p.email} onChange={(v) => upd("email", v)} testid="input-email" placeholder="nome@email.com" optional />
      <Field label="LinkedIn" value={p.linkedin} onChange={(v) => upd("linkedin", v)} testid="input-linkedin" placeholder="linkedin.com/in/o-seu-nome" optional />
      <Field label="Portefólio / site" value={p.portfolio} onChange={(v) => upd("portfolio", v)} testid="input-portfolio" placeholder="Ex.: behance.net/nome ou o seu site" optional />
      <p className="sm:col-span-2 text-xs text-slate-500">Os links aparecem na linha de contactos do currículo, sem “https://”.</p>
    </div>
  );
}

// ---------------- Perfil
export const PROFILE_EXAMPLE = "Profissional com experiência em atendimento ao público e apoio às actividades diárias de uma loja, incluindo esclarecimento de dúvidas, organização de produtos e colaboração com a equipa. Comunica com clareza, demonstra sentido de responsabilidade e organiza o trabalho com atenção. Tem interesse em oportunidades de atendimento ou apoio administrativo, onde possa aplicar a experiência que possui. Procura continuar a desenvolver as suas competências e crescer profissionalmente.";

export function ProfileForm({ content, set }) {
  const prof = content.profile;
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  async function generate() {
    if (prof.edited && prof.text) {
      if (!window.confirm("Já editou o perfil manualmente. Gerar uma nova sugestão vai substituir o texto actual. Continuar?")) return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/profile/generate", { content });
      set({ ...content, profile: { text: data.text, suggested: data.text, edited: false, generated: true } });
      setEditing(false);
      toast.success("Sugestão de perfil gerada a partir dos seus dados.");
    } catch (e) {
      toast.error("Não foi possível gerar o perfil.");
    } finally {
      setLoading(false);
    }
  }
  const startEdit = () => { setDraft(prof.text || ""); setEditing(true); };
  const save = () => {
    const txt = draft.trim();
    set({ ...content, profile: { ...prof, text: txt, edited: txt !== (prof.suggested || "") } });
    setEditing(false);
    toast.success("Perfil guardado.");
  };
  const restore = () => {
    if (!window.confirm("Restaurar a sugestão inicial? O texto editado será substituído.")) return;
    set({ ...content, profile: { ...prof, text: prof.suggested, edited: false } });
    setEditing(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">O perfil é escrito a partir das suas respostas verdadeiras (formação, experiência, competências confirmadas e área de interesse). Pode mantê-lo ou editar — a sua versão nunca é substituída automaticamente.</p>
      {!prof.text && !editing && (
        <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4" data-testid="profile-example">
          <p className="text-xs font-semibold text-slate-500 uppercase">Exemplo fictício (não é o seu texto)</p>
          <p className="text-sm text-slate-500 italic mt-1">{PROFILE_EXAMPLE}</p>
        </div>
      )}
      {editing ? (
        <div className="space-y-2">
          <TextArea label="Editar perfil" value={draft} rows={6} testid="input-profile" onChange={setDraft} placeholder="Escreva o seu perfil em 3 a 4 frases verdadeiras." />
          <div className="flex gap-2">
            <button data-testid="profile-save" onClick={save} className="px-4 py-2 rounded-full bg-[#1C2D42] text-white text-sm font-semibold">Guardar</button>
            <button data-testid="profile-cancel" onClick={() => setEditing(false)} className="px-4 py-2 rounded-full border border-slate-300 text-slate-600 text-sm font-semibold">Cancelar</button>
          </div>
        </div>
      ) : prof.text ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4" data-testid="profile-current">
          <p className="text-sm text-slate-800 whitespace-pre-line">{prof.text}</p>
        </div>
      ) : null}
      {!editing && (
        <div className="flex flex-wrap gap-3 items-center">
          <button data-testid="generate-profile-btn" onClick={generate} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2563EB] text-white text-sm font-semibold disabled:opacity-60">
            <Sparkles className="w-4 h-4" /> {prof.generated ? "Regenerar sugestão" : "Gerar sugestão"}
          </button>
          <button data-testid="profile-edit" onClick={startEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 text-[#1C2D42] text-sm font-semibold">
            <Pencil className="w-4 h-4" /> {prof.text ? "Editar perfil" : "Escrever o meu perfil"}
          </button>
          {prof.edited && prof.suggested && (
            <button data-testid="profile-restore" onClick={restore} className="text-sm text-[#2563EB] font-semibold hover:underline">Restaurar sugestão inicial</button>
          )}
          {prof.edited && <span className="flex items-center gap-1 text-xs text-[#D97706]"><Pencil className="w-3 h-3" /> Editado manualmente</span>}
        </div>
      )}
    </div>
  );
}

// ---------------- Experiência
export function ExperienceForm({ content, set }) {
  const list = content.experiences;
  const update = (i, k, v) => { const n = [...list]; n[i] = { ...n[i], [k]: v }; set({ ...content, experiences: n }); };
  const add = () => set({ ...content, experiences: [...list, { role: "", entity: "", location: "", start: "", end: "", current: false, tasks: [""], results: "" }] });
  const remove = (i) => set({ ...content, experiences: list.filter((_, j) => j !== i) });
  const setTask = (i, j, v) => { const n = [...list]; const t = [...(n[i].tasks || [])]; t[j] = v; n[i] = { ...n[i], tasks: t }; set({ ...content, experiences: n }); };
  const addTask = (i) => { const n = [...list]; n[i] = { ...n[i], tasks: [...(n[i].tasks || []), ""] }; set({ ...content, experiences: n }); };
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Inclua trabalho formal e informal. Trabalho informal conta — só não o apresente como emprego formal. Pode deixar vazio se ainda não tem experiência.</p>
      {list.map((e, i) => (
        <EntryCard key={i} onRemove={() => remove(i)} testid={`remove-exp-${i}`}>
          <Field label="Cargo / Actividade" value={e.role} onChange={(v) => update(i, "role", v)} testid={`exp-role-${i}`} placeholder="Ex.: Estagiária de apoio administrativo" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Entidade / Cliente (ou “por conta própria”)" value={e.entity} onChange={(v) => update(i, "entity", v)} testid={`exp-entity-${i}`} />
            <Field label="Local" value={e.location} onChange={(v) => update(i, "location", v)} testid={`exp-location-${i}`} optional />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Início" value={e.start} onChange={(v) => update(i, "start", v)} testid={`exp-start-${i}`} placeholder="Ex.: Jan 2024" />
            <Field label="Fim" value={e.end} onChange={(v) => update(i, "end", v)} testid={`exp-end-${i}`} placeholder="Ex.: Jun 2025" optional />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-testid={`exp-current-${i}`} checked={!!e.current} onChange={(ev) => update(i, "current", ev.target.checked)} /> Ainda trabalho aqui
          </label>
          <div>
            <span className="text-sm font-medium text-slate-700">Tarefas / responsabilidades</span>
            {(e.tasks || []).map((t, j) => (
              <input key={j} data-testid={`exp-task-${i}-${j}`} value={t} onChange={(ev) => setTask(i, j, ev.target.value)}
                placeholder="Ex.: Organizei e arquivei documentação"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-[#2563EB] outline-none" />
            ))}
            <button data-testid={`exp-add-task-${i}`} onClick={() => addTask(i)} className="mt-2 text-xs text-[#2563EB] font-semibold">+ Adicionar tarefa</button>
          </div>
          <Field label="Resultado real" value={e.results} onChange={(v) => update(i, "results", v)} testid={`exp-results-${i}`} optional placeholder="Ex.: Reduzi o tempo de consulta dos registos" />
        </EntryCard>
      ))}
      <AddButton onClick={add} label="Adicionar experiência" testid="add-experience" />
    </div>
  );
}

// ---------------- Formação
const EDU_STATUS_OPTS = [["a_frequentar", "A frequentar"], ["concluido", "Concluído"], ["interrompido", "Interrompido"]];
export function EducationForm({ content, set }) {
  const list = content.education;
  const update = (i, k, v) => { const n = [...list]; n[i] = { ...n[i], [k]: v }; set({ ...content, education: n }); };
  const add = () => set({ ...content, education: [...list, { level: "", institution: "", course: "", start: "", end: "", status: "a_frequentar" }] });
  const remove = (i) => set({ ...content, education: list.filter((_, j) => j !== i) });
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Indique o estado real. Nunca presumimos que concluiu um curso ou o ensino médio.</p>
      {list.map((e, i) => (
        <EntryCard key={i} onRemove={() => remove(i)} testid={`remove-edu-${i}`}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nível" value={e.level} onChange={(v) => update(i, "level", v)} testid={`edu-level-${i}`} placeholder="Ex.: Licenciatura, Médio, 12.ª classe" />
            <Field label="Curso / Área" value={e.course} onChange={(v) => update(i, "course", v)} testid={`edu-course-${i}`} placeholder="Ex.: Contabilidade" />
          </div>
          <Field label="Instituição" value={e.institution} onChange={(v) => update(i, "institution", v)} testid={`edu-institution-${i}`} optional />
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Início" value={e.start} onChange={(v) => update(i, "start", v)} testid={`edu-start-${i}`} optional />
            <Field label="Fim" value={e.end} onChange={(v) => update(i, "end", v)} testid={`edu-end-${i}`} optional />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Estado</span>
              <select data-testid={`edu-status-${i}`} value={e.status} onChange={(ev) => update(i, "status", ev.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#2563EB] outline-none">
                {EDU_STATUS_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
        </EntryCard>
      ))}
      <AddButton onClick={add} label="Adicionar formação" testid="add-education" />
    </div>
  );
}

// ---------------- Competências
export function SkillsForm({ content, set, targetProfession }) {
  const [custom, setCustom] = useState("");
  const selected = content.skills || [];
  const suggestions = skillSuggestions(content, targetProfession).filter((s) => !selected.includes(s));
  const toggle = (s) => {
    if (selected.includes(s)) set({ ...content, skills: selected.filter((x) => x !== s) });
    else set({ ...content, skills: [...selected, s] });
  };
  const addCustom = () => {
    const v = custom.trim();
    if (v && !selected.includes(v)) set({ ...content, skills: [...selected, v] });
    setCustom("");
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Escolha apenas as competências que são verdadeiras para si. Pode também escrever as suas.</p>
      {selected.length > 0 && (
        <div>
          <span className="text-sm font-medium text-slate-700">Confirmadas</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.map((s) => (
              <button key={s} data-testid={`skill-selected-${s}`} onClick={() => toggle(s)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1C2D42] text-white text-sm">
                {s} <X className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}
      {suggestions.length > 0 && (
        <div>
          <span className="text-sm font-medium text-slate-700">Sugestões (clique para confirmar)</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((s) => (
              <button key={s} data-testid={`skill-suggest-${s}`} onClick={() => toggle(s)}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 text-sm hover:border-[#2563EB]">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <input data-testid="skill-custom-input" value={custom} onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()} placeholder="Escrever a minha competência"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#2563EB] outline-none" />
        <button data-testid="skill-custom-add" onClick={addCustom} className="px-4 rounded-xl bg-[#2563EB] text-white font-semibold">Adicionar</button>
      </div>
    </div>
  );
}

// ---------------- Cursos
export function CoursesForm({ content, set }) {
  const list = content.courses;
  const update = (i, k, v) => { const n = [...list]; n[i] = { ...n[i], [k]: v }; set({ ...content, courses: n }); };
  const add = () => set({ ...content, courses: [...list, { name: "", entity: "", date: "" }] });
  const remove = (i) => set({ ...content, courses: list.filter((_, j) => j !== i) });
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Cursos, certificados e licenças reais. Não chamamos certificado a uma competência informal.</p>
      {list.map((c, i) => (
        <EntryCard key={i} onRemove={() => remove(i)} testid={`remove-course-${i}`}>
          <Field label="Nome do curso / certificado" value={c.name} onChange={(v) => update(i, "name", v)} testid={`course-name-${i}`} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Entidade" value={c.entity} onChange={(v) => update(i, "entity", v)} testid={`course-entity-${i}`} optional />
            <Field label="Data / Validade" value={c.date} onChange={(v) => update(i, "date", v)} testid={`course-date-${i}`} optional />
          </div>
        </EntryCard>
      ))}
      <AddButton onClick={add} label="Adicionar curso" testid="add-course" />
    </div>
  );
}

// ---------------- Idiomas
const LANG_LEVELS = ["Básico", "Intermédio", "Fluente", "Língua materna"];
export function LanguagesForm({ content, set }) {
  const list = content.languages;
  const update = (i, k, v) => { const n = [...list]; n[i] = { ...n[i], [k]: v }; set({ ...content, languages: n }); };
  const add = () => set({ ...content, languages: [...list, { language: "", level: "Fluente" }] });
  const remove = (i) => set({ ...content, languages: list.filter((_, j) => j !== i) });
  return (
    <div className="space-y-4">
      {list.map((l, i) => (
        <EntryCard key={i} onRemove={() => remove(i)} testid={`remove-lang-${i}`}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Idioma" value={l.language} onChange={(v) => update(i, "language", v)} testid={`lang-name-${i}`} placeholder="Ex.: Português, Inglês, Umbundu" />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nível</span>
              <select data-testid={`lang-level-${i}`} value={l.level} onChange={(e) => update(i, "level", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#2563EB] outline-none">
                {LANG_LEVELS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>
        </EntryCard>
      ))}
      <AddButton onClick={add} label="Adicionar idioma" testid="add-language" />
    </div>
  );
}

// ---------------- Projectos
export function ProjectsForm({ content, set }) {
  const list = content.projects;
  const update = (i, k, v) => { const n = [...list]; n[i] = { ...n[i], [k]: v }; set({ ...content, projects: n }); };
  const add = () => set({ ...content, projects: [...list, { name: "", description: "" }] });
  const remove = (i) => set({ ...content, projects: list.filter((_, j) => j !== i) });
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Projectos escolares, pessoais, voluntariado ou actividades comunitárias reais.</p>
      {list.map((p, i) => (
        <EntryCard key={i} onRemove={() => remove(i)} testid={`remove-project-${i}`}>
          <Field label="Nome" value={p.name} onChange={(v) => update(i, "name", v)} testid={`project-name-${i}`} />
          <TextArea label="Descrição" value={p.description} onChange={(v) => update(i, "description", v)} testid={`project-desc-${i}`} optional />
        </EntryCard>
      ))}
      <AddButton onClick={add} label="Adicionar projecto" testid="add-project" />
    </div>
  );
}

// ---------------- Disponibilidade
export function AvailabilityForm({ content, set }) {
  const d = content.availability;
  const upd = (k, v) => set({ ...content, availability: { ...d, [k]: v } });
  return (
    <div className="space-y-4">
      <Field label="Disponibilidade" value={d.type} onChange={(v) => upd("type", v)} testid="avail-type" placeholder="Ex.: Imediata, a combinar" optional />
      <Field label="Zona preferida" value={d.zone} onChange={(v) => upd("zone", v)} testid="avail-zone" placeholder="Ex.: Luanda e arredores" optional />
      <Field label="Carta de condução" value={content.driving_license} onChange={(v) => set({ ...content, driving_license: v })} testid="avail-license" placeholder="Ex.: Categoria B" optional />
      <TextArea label="Nota adicional" value={d.note} onChange={(v) => upd("note", v)} testid="avail-note" optional />
    </div>
  );
}

// ---------------- Cuidados (babá/cuidador)
export function CareForm({ content, set }) {
  const c = content.care_details;
  const upd = (k, v) => set({ ...content, care_details: { ...c, [k]: v } });
  const toggleGroup = (g) => {
    const groups = c.groups || [];
    upd("groups", groups.includes(g) ? groups.filter((x) => x !== g) : [...groups, g]);
  };
  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm font-medium text-slate-700">Quem cuida? (idades / grupos)</span>
        <p className="text-xs text-slate-500">Não pedimos nome, foto, escola ou morada das crianças. Apenas o grupo para dar contexto.</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {CARE_GROUPS.map((g) => (
            <button key={g} data-testid={`care-group-${g}`} onClick={() => toggleGroup(g)}
              className={`px-3 py-1.5 rounded-full text-sm border ${(c.groups || []).includes(g) ? "bg-[#1C2D42] text-white border-[#1C2D42]" : "bg-white border-slate-300 text-slate-700"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <Field label="Duração da experiência" value={c.duration} onChange={(v) => upd("duration", v)} testid="care-duration" placeholder="Ex.: 2 anos" optional />
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Contexto da experiência</span>
        <select data-testid="care-context" value={c.context} onChange={(e) => upd("context", e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#2563EB] outline-none">
          <option value="">Seleccione…</option>
          {EXP_CONTEXTS.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </label>
      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" data-testid="care-first-aid" checked={!!c.first_aid} onChange={(e) => upd("first_aid", e.target.checked)} />
          Tenho formação/certificado de primeiros socorros ou suporte básico de vida
        </label>
        {c.first_aid && <Field label="Entidade / ano" value={c.first_aid_note} onChange={(v) => upd("first_aid_note", v)} testid="care-first-aid-note" optional />}
        <p className="text-xs text-slate-500 mt-2">Só aparece como qualificação se confirmar aqui.</p>
      </div>
      <p className="text-xs text-slate-500">As competências de cuidado (segurança, rotinas, higiene, apoio nas refeições…) são escolhidas no separador <b>Competências</b>.</p>
    </div>
  );
}

// ---------------- Tarefas da casa
const LIVE_IN = [["", "Seleccione…"], ["externo", "Externo (não reside)"], ["interno", "Interno (reside na casa)"], ["ambos", "A combinar"]];
export function DomesticForm({ content, set }) {
  const d = content.domestic_details;
  const upd = (k, v) => set({ ...content, domestic_details: { ...d, [k]: v } });
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">As tarefas (limpeza, roupa, cozinha…) são escolhidas no separador <b>Competências</b> e só aparecem se as seleccionar.</p>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Experiência em</span>
        <select data-testid="dom-context" value={d.context} onChange={(e) => upd("context", e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#2563EB] outline-none">
          <option value="">Seleccione…</option>
          {EXP_CONTEXTS.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </label>
      <Field label="Horário" value={d.schedule} onChange={(v) => upd("schedule", v)} testid="dom-schedule" placeholder="Ex.: Segunda a sexta, manhãs" optional />
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Trabalho interno ou externo</span>
        <select data-testid="dom-livein" value={d.live_in} onChange={(e) => upd("live_in", e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#2563EB] outline-none">
          {LIVE_IN.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <Field label="Zona" value={d.zone} onChange={(v) => upd("zone", v)} testid="dom-zone" optional />
    </div>
  );
}

// ---------------- Serviço (prestar serviços)
export function ServicesForm({ content, set }) {
  const s = content.services_details;
  const upd = (k, v) => set({ ...content, services_details: { ...s, [k]: v } });
  return (
    <div className="space-y-4">
      <Field label="Serviço que presta" value={s.service} onChange={(v) => upd("service", v)} testid="svc-service" placeholder="Ex.: Instalações eléctricas" />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Tipo de clientes" value={s.clients} onChange={(v) => upd("clients", v)} testid="svc-clients" optional placeholder="Ex.: Casas e pequenos negócios" />
        <Field label="Área / Especialidade" value={s.area} onChange={(v) => upd("area", v)} testid="svc-area" optional />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Zona de actuação" value={s.zone} onChange={(v) => upd("zone", v)} testid="svc-zone" optional />
        <Field label="Há quanto tempo" value={s.duration} onChange={(v) => upd("duration", v)} testid="svc-duration" optional />
      </div>
      <Field label="Portefólio / link" value={s.portfolio} onChange={(v) => upd("portfolio", v)} testid="svc-portfolio" optional />
      <TextArea label="Referências (só com autorização)" value={s.references} onChange={(v) => upd("references", v)} testid="svc-references" optional />
    </div>
  );
}

// ---------------- Referências (opcional, com consentimento)
const REF_MODES = [
  ["none", "Não incluir referências", "O currículo não terá secção de referências."],
  ["on_request", "“Referências disponíveis mediante pedido”", "Mostra apenas esta frase, sem nomes nem contactos."],
  ["list", "Indicar referências", "Nome, cargo, empresa e contacto — só com autorização da pessoa."],
];
const emptyRef = () => ({ name: "", role: "", company: "", phone: "", email: "", consent: false });

export function ReferencesForm({ content, set }) {
  const refs = content.references || { mode: "none", items: [] };
  const items = refs.items || [];
  const setRefs = (next) => set({ ...content, references: { ...refs, ...next } });
  const update = (i, k, v) => { const n = [...items]; n[i] = { ...n[i], [k]: v }; setRefs({ items: n }); };
  const remove = (i) => setRefs({ items: items.filter((_, j) => j !== i) });
  const toggleConsent = (i, checked) => {
    const n = [...items];
    n[i] = checked ? { ...n[i], consent: true } : { ...emptyRef() };
    setRefs({ items: n });
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Secção opcional — não impede a criação do currículo. Só recolhemos e mostramos dados de outra pessoa com a sua autorização.</p>
      <div className="space-y-2">
        {REF_MODES.map(([v, l, d]) => (
          <button key={v} data-testid={`ref-mode-${v}`} onClick={() => setRefs({ mode: v })}
            className={`w-full text-left rounded-xl border px-4 py-3 ${refs.mode === v ? "border-[#2563EB] bg-[#EFF6FF]" : "border-slate-300 bg-white"}`}>
            <span className="font-semibold text-[#1C2D42] block">{l}</span>
            <span className="text-xs text-slate-500">{d}</span>
          </button>
        ))}
      </div>
      {refs.mode === "list" && (
        <div className="space-y-4">
          {items.map((r, i) => (
            <EntryCard key={i} onRemove={() => remove(i)} testid={`remove-ref-${i}`}>
              <label className="flex items-start gap-2 text-sm font-medium text-slate-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <input type="checkbox" data-testid={`ref-consent-${i}`} className="mt-0.5" checked={!!r.consent} onChange={(e) => toggleConsent(i, e.target.checked)} />
                Tenho autorização desta pessoa para partilhar estes dados
              </label>
              {r.consent ? (
                <>
                  <Field label="Nome" value={r.name} onChange={(v) => update(i, "name", v)} testid={`ref-name-${i}`} placeholder="Ex.: Maria João" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Cargo / relação" value={r.role} onChange={(v) => update(i, "role", v)} testid={`ref-role-${i}`} placeholder="Ex.: Supervisora, antiga empregadora" />
                    <Field label="Empresa / entidade" value={r.company} onChange={(v) => update(i, "company", v)} testid={`ref-company-${i}`} optional />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Telefone" value={r.phone} onChange={(v) => update(i, "phone", v)} testid={`ref-phone-${i}`} optional placeholder="+244 9XX XXX XXX" />
                    <Field label="E-mail" value={r.email} onChange={(v) => update(i, "email", v)} testid={`ref-email-${i}`} optional />
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500" data-testid={`ref-locked-${i}`}>Confirme a autorização para preencher os dados desta referência. Sem autorização, nada é guardado nem mostrado.</p>
              )}
            </EntryCard>
          ))}
          <AddButton onClick={() => setRefs({ items: [...items, emptyRef()] })} label="Adicionar referência" testid="add-reference" />
        </div>
      )}
    </div>
  );
}

// ---------------- Adaptar a uma vaga (procurar_emprego)
export function AdaptForm({ content, set }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searched, setSearched] = useState(false);
  const [other, setOther] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    if (content.adapt !== "yes" || !query.trim()) { setResults([]); setSuggestions([]); setSearched(false); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/professions?search=${encodeURIComponent(query)}`);
        setResults(data.professions.slice(0, 12));
        setSuggestions(data.suggestions || []);
        setSearched(true);
      } catch { /* ignore */ }
    }, 300);
  }, [query, content.adapt]);

  const chooseProf = (p) => set({ ...content, target_profession: { id: p.id, name: p.name, skill_groups: p.skill_groups, family: p.family } });
  const chooseOther = () => { if (other.trim()) set({ ...content, target_profession: { id: "outra", name: other.trim(), skill_groups: [] } }); };

  return (
    <div className="space-y-4">
      <p className="text-slate-700 font-medium">Quer adaptar este currículo a uma profissão ou vaga específica?</p>
      <p className="text-sm text-slate-500">Não é obrigatório. Pode fazer um currículo geral para enviar a várias empresas.</p>
      <div className="flex gap-3">
        <button data-testid="adapt-no" onClick={() => set({ ...content, adapt: "no", target_profession: null })}
          className={`flex-1 px-4 py-3 rounded-xl border font-semibold ${content.adapt === "no" ? "border-[#2563EB] bg-[#EFF6FF]" : "border-slate-300"}`}>Não, currículo geral</button>
        <button data-testid="adapt-yes" onClick={() => set({ ...content, adapt: "yes" })}
          className={`flex-1 px-4 py-3 rounded-xl border font-semibold ${content.adapt === "yes" ? "border-[#2563EB] bg-[#EFF6FF]" : "border-slate-300"}`}>Sim, adaptar a uma vaga</button>
      </div>

      {content.adapt === "yes" && (
        <div className="space-y-3 pt-2">
          {content.target_profession ? (
            <div className="flex items-center justify-between rounded-xl border border-[#2563EB] bg-[#EFF6FF] px-4 py-3">
              <span className="font-semibold text-[#1C2D42]" data-testid="adapt-selected">{content.target_profession.name}</span>
              <button data-testid="adapt-clear" onClick={() => set({ ...content, target_profession: null })} className="text-sm text-[#2563EB]">Mudar</button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input data-testid="adapt-search" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar profissão ou área (ex.: secretária, electricista)"
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-[#2563EB] outline-none" />
              </div>
              {results.length > 0 && (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-64 overflow-auto">
                  {results.map((p) => (
                    <button key={p.id} data-testid={`adapt-result-${p.id}`} onClick={() => chooseProf(p)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {searched && results.length === 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3" data-testid="adapt-no-match">
                  <p className="text-sm text-amber-800">Não encontrámos “{query}” no catálogo.{suggestions.length > 0 ? " Talvez queira dizer:" : " Pode escrever a profissão em baixo."}</p>
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestions.map((p) => (
                        <button key={p.id} data-testid={`adapt-suggest-${p.id}`} onClick={() => chooseProf(p)}
                          className="px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 text-sm hover:border-[#2563EB]">{p.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <input data-testid="adapt-other-input" value={other} onChange={(e) => setOther(e.target.value)}
                  placeholder="Outra profissão / área (escrever)"
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                <button data-testid="adapt-other-add" onClick={chooseOther} className="px-4 rounded-xl bg-[#1C2D42] text-white font-semibold">Usar</button>
              </div>
            </>
          )}
          <p className="text-xs text-slate-500">As competências sugeridas aparecem para confirmação — nada é adicionado automaticamente.</p>
        </div>
      )}
    </div>
  );
}
