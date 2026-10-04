"""Geração determinística do perfil profissional (sem IA, sem custo recorrente).

Regras: usar apenas factos confirmados pela pessoa. Nunca inventar anos,
certificados, resultados, competências ou habilitações. 3 a 4 frases quando há
dados; mais curto (e verdadeiro) quando faltam dados.
"""

EDU_STATUS = {
    "a_frequentar": "em curso",
    "concluido": "concluída",
    "interrompido": "interrompida",
}

PROPRIA = ("por conta própria", "conta propria", "conta própria", "por conta propria")


def _tem(v):
    return bool(v and str(v).strip())


def _lista(items, sep=", ", ultimo=" e "):
    items = [str(i).strip() for i in items if _tem(i)]
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return sep.join(items[:-1]) + ultimo + items[-1]


def _abertura(pathway, experiences, education, target, care, services):
    if pathway == "baba_cuidador":
        alvo = _lista(care.get("groups") or []) or "crianças e/ou idosos"
        if experiences:
            return f"Cuidador(a) com experiência no apoio a {alvo}."
        return f"Pessoa responsável e atenta, com interesse no cuidado de {alvo}."
    if pathway == "trabalhar_casa":
        if experiences:
            return "Profissional de serviço doméstico com experiência em casas e famílias."
        return "Pessoa organizada e responsável para apoio em serviço doméstico."
    if pathway == "prestar_servicos":
        serv = services.get("service") or target.get("name") or ""
        if _tem(serv):
            return f"Prestador(a) de serviços na área de {serv.strip()}."
        return "Prestador(a) de serviços por conta própria, orientado(a) para a satisfação do cliente."
    if education:
        edu = education[0]
        curso = (edu.get("course") or edu.get("level") or "").strip()
        estado = EDU_STATUS.get(edu.get("status"), "")
        if curso and estado:
            return f"Candidato(a) com formação em {curso} ({estado})."
        if curso:
            return f"Candidato(a) com formação em {curso}."
    if experiences:
        return "Profissional com experiência prática adquirida em contexto de trabalho."
    if pathway == "curriculo_pessoal":
        return "Candidato(a) motivado(a) à procura da primeira oportunidade profissional."
    return None


def _experiencia(experiences):
    if not experiences:
        return None
    exp = experiences[0]
    role = str(exp.get("role")).strip()
    entity = (exp.get("entity") or "").strip()
    tarefas = [t for t in (exp.get("tasks") or []) if _tem(t)][:2]
    base = f"Experiência como {role}"
    if _tem(entity) and entity.lower() not in PROPRIA:
        base += f" em {entity}"
    if tarefas:
        base += ", incluindo " + _lista([t.strip().rstrip(".").lower() for t in tarefas])
    if len(experiences) > 1:
        base += f", entre outras {len(experiences) - 1} experiências"
    return base + "."


def _formacao_complementar(education, projects, courses, ja_usou_edu):
    partes = []
    if education and not ja_usou_edu:
        edu = education[0]
        curso = (edu.get("course") or edu.get("level") or "").strip()
        if curso:
            partes.append(f"formação em {curso}")
    if projects:
        partes.append("participação em " + _lista([p.get("name") for p in projects[:2]]))
    if courses:
        partes.append("formação complementar em " + _lista([c.get("name") for c in courses[:2]]))
    if not partes:
        return None
    return "Conta com " + _lista(partes) + "."


def _competencias(skills):
    if not skills:
        return None
    top = skills[:4]
    if len(top) == 1:
        return f"Demonstra competência em {top[0]}."
    return "Demonstra competências em " + _lista(top) + "."


def _fecho(pathway, target, care, domestic, services, city, tem_exp):
    area = ""
    if pathway == "procurar_emprego" and _tem(target.get("name")):
        area = target["name"].strip()
    elif pathway == "baba_cuidador":
        area = "cuidados a " + (_lista(care.get("groups") or []) or "crianças e/ou idosos")
    elif pathway == "trabalhar_casa":
        area = "serviço doméstico"
    elif pathway == "prestar_servicos" and _tem(services.get("service")):
        area = services["service"].strip()
    local = f" em {city}" if city else ""
    aplicar = "aplicar a experiência que possui" if tem_exp else "aplicar o que sabe"
    if area:
        return f"Procura oportunidades em {area}{local}, onde possa {aplicar} e continuar a desenvolver as suas competências."
    return f"Procura uma oportunidade{local} onde possa {aplicar} e continuar a crescer profissionalmente."


def generate_profile(content: dict) -> str:
    pathway = content.get("pathway") or "procurar_emprego"
    personal = content.get("personal") or {}
    experiences = [e for e in (content.get("experiences") or []) if _tem(e.get("role"))]
    education = [e for e in (content.get("education") or []) if _tem(e.get("course")) or _tem(e.get("level"))]
    skills = [s for s in (content.get("skills") or []) if _tem(s)]
    projects = [p for p in (content.get("projects") or []) if _tem(p.get("name"))]
    courses = [c for c in (content.get("courses") or []) if _tem(c.get("name"))]
    target = content.get("target_profession") or {}
    care = content.get("care_details") or {}
    domestic = content.get("domestic_details") or {}
    services = content.get("services_details") or {}
    city = (personal.get("city") or "").strip()

    abertura = _abertura(pathway, experiences, education, target, care, services)
    ja_usou_edu = bool(abertura and "formação em" in abertura)

    frases = [abertura, _experiencia(experiences)]
    if not experiences or len([f for f in frases if f]) < 2:
        frases.append(_formacao_complementar(education, projects, courses, ja_usou_edu))
    frases.append(_competencias(skills))
    frases = [f for f in frases if f][:3]
    frases.append(_fecho(pathway, target, care, domestic, services, city, bool(experiences)))
    return " ".join(frases).strip()
