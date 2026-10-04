import React from "react";
import { PROFILE_EXAMPLE } from "./editor/SectionForms";

const EDU_STATUS = { a_frequentar: "Em curso", concluido: "Concluída", interrompido: "Interrompida" };

const tem = (v) => !!(v && String(v).trim());

function periodo(item) {
  const ini = item.start || "";
  const fim = item.current ? "Actual" : item.end || "";
  if (ini && fim) return `${ini} — ${fim}`;
  return ini || fim;
}

function Section({ title, children }) {
  return (
    <div className="cv-section">
      <div className="cv-sec-title">{title}</div>
      {children}
    </div>
  );
}

export default function CVPreview({ content, watermark = true }) {
  const vis = content.section_visibility || {};
  const shown = (k) => vis[k] !== false;
  const p = content.personal || {};
  const nome = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "O SEU NOME";
  const target = content.target_profession || {};
  const titulo = tem(target.name) ? target.name : "";

  const shortUrl = (u) => String(u).trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const contactos = [p.city, p.phone, p.email].filter(tem).concat([p.linkedin, p.portfolio].filter(tem).map(shortUrl));

  const exps = (content.experiences || []).filter((e) => tem(e.role));
  const edus = (content.education || []).filter((e) => tem(e.course) || tem(e.level));
  const skills = (content.skills || []).filter(tem);
  const cursos = (content.courses || []).filter((c) => tem(c.name));
  const idiomas = (content.languages || []).filter((l) => tem(l.language));
  const projs = (content.projects || []).filter((pr) => tem(pr.name));
  const profile = (content.profile || {}).text || "";
  const disp = content.availability || {};
  const refs = content.references || {};
  const refItems = refs.mode === "list" ? (refs.items || []).filter((r) => r && r.consent === true && tem(r.name)) : [];

  return (
    <div className="cv-sheet" data-testid="cv-preview">
      {watermark && (
        <div className="cv-watermark" aria-hidden="true">
          <span>
            KurrikuluPro — PRÉ-VISUALIZAÇÃO — PAGAMENTO PENDENTE<br />
            KurrikuluPro — PRÉ-VISUALIZAÇÃO — PAGAMENTO PENDENTE<br />
            KurrikuluPro — PRÉ-VISUALIZAÇÃO — PAGAMENTO PENDENTE<br />
            KurrikuluPro — PRÉ-VISUALIZAÇÃO — PAGAMENTO PENDENTE<br />
            KurrikuluPro — PRÉ-VISUALIZAÇÃO — PAGAMENTO PENDENTE
          </span>
        </div>
      )}
      <div className="cv-topbar" />
      <div className="cv-name">{nome}</div>
      {titulo && <div className="cv-title">{titulo}</div>}
      <div className="cv-contacts">{contactos.join("\u00a0\u00a0|\u00a0\u00a0") || "Cidade  |  Telefone  |  Email"}</div>

      {shown("profile") && tem(profile) && (
        <Section title="Perfil Profissional">
          <p className="cv-para">{profile}</p>
        </Section>
      )}
      {shown("profile") && !tem(profile) && watermark && (
        <Section title="Perfil Profissional">
          <p className="cv-para" style={{ color: "#94A3B8", fontStyle: "italic" }} data-testid="cv-profile-example">
            [Exemplo fictício — será substituído pelo seu perfil] {PROFILE_EXAMPLE}
          </p>
        </Section>
      )}

      {shown("experience") && exps.length > 0 && (
        <Section title="Experiência Profissional">
          {exps.map((e, i) => {
            const local = [e.entity, e.location].filter(tem).join(" · ");
            const tarefas = (e.tasks || []).filter(tem);
            return (
              <div className="cv-item" key={i}>
                <div className="cv-item-head">
                  <span className="cv-item-role">{e.role}</span>
                  <span className="cv-item-period">{periodo(e)}</span>
                </div>
                {local && <div className="cv-item-sub">{local}</div>}
                {(tarefas.length > 0 || tem(e.results)) && (
                  <ul>
                    {tarefas.map((t, j) => <li key={j}>{t}</li>)}
                    {tem(e.results) && <li>{e.results}</li>}
                  </ul>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {shown("education") && edus.length > 0 && (
        <Section title="Formação">
          {edus.map((e, i) => {
            const t = [e.course, EDU_STATUS[e.status]].filter(tem).join(" · ");
            const sub = [e.level, e.institution].filter(tem).join(" · ");
            return (
              <div className="cv-item" key={i}>
                <div className="cv-item-head">
                  <span className="cv-item-role">{t}</span>
                  <span className="cv-item-period">{periodo(e)}</span>
                </div>
                {sub && <div className="cv-item-sub">{sub}</div>}
              </div>
            );
          })}
        </Section>
      )}

      {shown("skills") && skills.length > 0 && (
        <Section title="Competências Confirmadas">
          <div>{skills.map((s, i) => <span className="cv-pill" key={i}>{s}</span>)}</div>
        </Section>
      )}

      {shown("courses") && cursos.length > 0 && (
        <Section title="Formação Complementar">
          {cursos.map((c, i) => {
            const sub = [c.entity, c.date].filter(tem).join(" · ");
            return (
              <div className="cv-item" key={i}>
                <div className="cv-item-role">{c.name}</div>
                {sub && <div className="cv-item-sub">{sub}</div>}
              </div>
            );
          })}
        </Section>
      )}

      {shown("languages") && idiomas.length > 0 && (
        <Section title="Idiomas">
          <div>
            {idiomas.map((l, i) => (
              <span className="cv-lang" key={i}><b>{l.language}</b> <span className="cv-meta">{l.level}</span></span>
            ))}
          </div>
        </Section>
      )}

      {shown("projects") && projs.length > 0 && (
        <Section title="Projectos">
          {projs.map((pr, i) => (
            <div className="cv-item" key={i}>
              <div className="cv-item-role">{pr.name}</div>
              {tem(pr.description) && <div className="cv-item-sub">{pr.description}</div>}
            </div>
          ))}
        </Section>
      )}

      {shown("availability") && (tem(disp.type) || tem(disp.note) || tem(disp.zone)) && (
        <Section title="Disponibilidade">
          <p className="cv-para">{[disp.type, disp.zone, disp.note].filter(tem).join(" · ")}</p>
        </Section>
      )}

      {shown("references") && refs.mode === "on_request" && (
        <Section title="Referências">
          <p className="cv-para" data-testid="cv-refs-on-request">Referências disponíveis mediante pedido.</p>
        </Section>
      )}
      {shown("references") && refItems.length > 0 && (
        <Section title="Referências">
          {refItems.map((r, i) => {
            const sub = [r.role, r.company].filter(tem).join(" · ");
            const cont = [r.phone, r.email].filter(tem).join(" · ");
            return (
              <div className="cv-item" key={i} data-testid={`cv-ref-${i}`}>
                <div className="cv-item-role">{r.name}</div>
                {sub && <div className="cv-item-sub">{sub}</div>}
                {cont && <div className="cv-item-sub">{cont}</div>}
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}
