// Configuração dos seis percursos: tabs, sugestões de competências e textos.
import { Briefcase, FileText, Wrench, Heart, Home as HomeIcon, HelpCircle } from "lucide-react";

export const PATHWAYS = [
  {
    id: "procurar_emprego",
    title: "Quero procurar emprego",
    desc: "Currículo profissional geral para enviar a empresas. O caminho mais escolhido.",
    icon: Briefcase,
    badge: "Mais escolhido",
  },
  {
    id: "curriculo_pessoal",
    title: "Quero fazer um currículo pessoal",
    desc: "Para estudantes, recém-formados, primeiro emprego ou quem ainda não tem área definida.",
    icon: FileText,
    badge: "Estudante / 1.º emprego",
  },
  {
    id: "prestar_servicos",
    title: "Quero prestar serviços",
    desc: "Para trabalho independente e serviços a clientes (técnicos e ofícios).",
    icon: Wrench,
    badge: "Por conta própria",
  },
  {
    id: "baba_cuidador",
    title: "Quero ser babá/cuidador(a)",
    desc: "Cuidados de crianças, de idosos ou outros cuidados que escolher.",
    icon: Heart,
    badge: "Cuidados",
  },
  {
    id: "trabalhar_casa",
    title: "Quero trabalhar numa casa",
    desc: "Tarefas domésticas: limpeza, roupa, cozinha e rotinas da casa.",
    icon: HomeIcon,
    badge: "Serviço doméstico",
  },
  {
    id: "nao_sei_escolher",
    title: "Não sei qual escolher",
    desc: "Responda a perguntas simples e nós sugerimos o melhor caminho.",
    icon: HelpCircle,
    badge: "Passo a passo",
  },
];

export const PATHWAY_LABELS = Object.fromEntries(PATHWAYS.map((p) => [p.id, p.title]));

// Separadores por percurso
export const PATHWAY_TABS = {
  procurar_emprego: ["adapt", "personal", "profile", "experience", "education", "skills", "courses", "languages", "projects", "references", "availability"],
  curriculo_pessoal: ["personal", "profile", "education", "experience", "skills", "courses", "languages", "projects", "references", "availability"],
  prestar_servicos: ["personal", "profile", "services", "experience", "skills", "courses", "references", "availability"],
  baba_cuidador: ["personal", "profile", "care", "experience", "skills", "courses", "references", "availability"],
  trabalhar_casa: ["personal", "profile", "domestic", "experience", "skills", "courses", "references", "availability"],
};

export const TAB_LABELS = {
  adapt: "Adaptar a uma vaga",
  personal: "Dados pessoais",
  profile: "Perfil",
  experience: "Experiência",
  education: "Formação",
  skills: "Competências",
  courses: "Cursos",
  languages: "Idiomas",
  projects: "Projectos",
  care: "Cuidados",
  domestic: "Tarefas da casa",
  services: "Serviço",
  references: "Referências",
  availability: "Disponibilidade",
};

export const BASE_SKILLS = [
  "Responsabilidade", "Pontualidade", "Organização", "Trabalho em equipa",
  "Comunicação", "Atendimento ao cliente", "Microsoft Word", "Microsoft Excel",
  "Boa apresentação", "Vontade de aprender", "Resolução de problemas",
];

export const CARE_SKILLS = [
  "Supervisão e segurança", "Rotinas", "Higiene", "Apoio nas refeições",
  "Brincadeiras e actividades", "Apoio escolar", "Comunicação com a família", "Deslocações",
];

export const DOMESTIC_SKILLS = [
  "Limpeza e organização", "Lavagem e passagem de roupa", "Cozinha e preparação de refeições",
  "Compras e despensa", "Rotinas familiares",
];

export const CARE_GROUPS = ["Crianças (bebés)", "Crianças (pré-escolar)", "Crianças (escolar)", "Idosos", "Pessoas com necessidades especiais"];
export const EXP_CONTEXTS = ["Família / casa particular", "Emprego numa empresa", "Instituição", "Voluntariado", "Trabalho informal"];

export function skillSuggestions(content, targetProfession) {
  const p = content.pathway;
  if (p === "baba_cuidador") return CARE_SKILLS;
  if (p === "trabalhar_casa") return DOMESTIC_SKILLS;
  let base = [...BASE_SKILLS];
  if (targetProfession && targetProfession.skill_groups) {
    base = [...new Set([...targetProfession.skill_groups, ...base])];
  }
  return base;
}

export function defaultContent(pathway) {
  return {
    pathway,
    adapt: pathway === "procurar_emprego" ? null : "no",
    target_profession: null,
    personal: { first_name: "", last_name: "", phone: "", city: "", email: "", photo_url: "", links: [] },
    profile: { text: "", edited: false, generated: false },
    experiences: [],
    education: [],
    skills: [],
    courses: [],
    languages: [],
    projects: [],
    care_details: { groups: [], duration: "", context: "", first_aid: false, first_aid_note: "" },
    domestic_details: { context: "", schedule: "", live_in: "", zone: "" },
    services_details: { service: "", clients: "", area: "", zone: "", duration: "", portfolio: "", references: "" },
    availability: { type: "", zone: "", note: "" },
    references: { mode: "none", items: [] },
    driving_license: "",
    section_visibility: {},
  };
}
