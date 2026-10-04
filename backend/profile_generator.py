"""Geração determinística do perfil profissional (sem IA, sem custo recorrente).

Regras: usar apenas factos confirmados pela pessoa. Nunca inventar anos,
certificados, resultados, "especialista" ou habilitações.
"""

EDU_STATUS = {
    "a_frequentar": "em curso",
    "concluido": "concluída",
    "interrompido": "interrompida",
}


def _primeiro_nome(personal):
    return (personal.get("first_name") or "").strip()


def _tem(v):
    return bool(v and str(v).strip())


def generate_profile(content: dict) -> str:
    pathway = content.get("pathway") or "procurar_emprego"
    personal = content.get("personal") or {}
    experiences = [e for e in (content.get("experiences") or []) if _tem(e.get("role"))]
    education = [e for e in (content.get("education") or []) if _tem(e.get("course")) or _tem(e.get("level"))]
    skills = [s for s in (content.get("skills") or []) if _tem(s)]
    target = content.get("target_profession") or {}
    care = content.get("care_details") or {}
    domestic = content.get("domestic_details") or {}
    services = content.get("services_details") or {}
    city = (personal.get("city") or "").strip()

    frases = []

    # Frase de abertura por percurso
    if pathway == "baba_cuidador":
        grupos = care.get("groups") or []
        alvo = " e ".join(grupos) if grupos else "crianças e/ou idosos"
        if experiences:
            frases.append(f"Cuidador(a) com experiência no apoio a {alvo}.")
        else:
            frases.append(f"Pessoa responsável e atenta, com interesse no cuidado de {alvo}.")
    elif pathway == "trabalhar_casa":
        if experiences:
            frases.append("Profissional de serviço doméstico com experiência em casas e famílias.")
        else:
            frases.append("Pessoa organizada e responsável para apoio em serviço doméstico.")
    elif pathway == "prestar_servicos":
        serv = services.get("service") or (target.get("name") if target else "")
        if _tem(serv):
            frases.append(f"Prestador(a) de serviços na área de {serv}.")
        else:
            frases.append("Prestador(a) de serviços por conta própria, orientado(a) para a satisfação do cliente.")
    elif pathway == "curriculo_pessoal":
        if education:
            edu = education[0]
            curso = edu.get("course") or edu.get("level") or "a sua formação"
            estado = EDU_STATUS.get(edu.get("status"), "")
            if estado:
                frases.append(f"Candidato(a) com formação em {curso} ({estado}).")
            else:
                frases.append(f"Candidato(a) com formação em {curso}.")
        else:
            frases.append("Candidato(a) motivado(a) à procura da primeira oportunidade profissional.")
    else:  # procurar_emprego (geral)
        if target and _tem(target.get("name")):
            frases.append(f"Candidato(a) interessado(a) em oportunidades na área de {target['name']}.")
        elif education:
            edu = education[0]
            curso = edu.get("course") or edu.get("level")
            estado = EDU_STATUS.get(edu.get("status"), "")
            if curso and estado:
                frases.append(f"Candidato(a) com formação em {curso} ({estado}).")
            elif curso:
                frases.append(f"Candidato(a) com formação em {curso}.")
            else:
                frases.append("Candidato(a) disponível para oportunidades profissionais.")
        else:
            frases.append("Candidato(a) disponível para oportunidades profissionais.")

    # Frase de experiência (sem inventar anos)
    if experiences:
        exp = experiences[0]
        role = exp.get("role")
        entity = exp.get("entity")
        if _tem(entity) and str(entity).strip().lower() not in ("por conta própria", "conta propria"):
            frases.append(f"Experiência como {role} em {entity}.")
        else:
            frases.append(f"Experiência como {role}.")

    # Competências confirmadas
    if skills:
        top = skills[:4]
        if len(top) == 1:
            frases.append(f"Competência em {top[0]}.")
        else:
            frases.append("Competências em " + ", ".join(top[:-1]) + f" e {top[-1]}.")

    # Domínio específico
    if pathway == "trabalhar_casa" and (domestic.get("tasks")):
        tarefas = domestic.get("tasks")[:3]
        frases.append("Disponível para " + ", ".join(tarefas).lower() + ".")
    if pathway == "baba_cuidador" and (care.get("responsibilities")):
        resp = care.get("responsibilities")[:3]
        frases.append("Responsável por " + ", ".join(resp).lower() + ".")

    # Frase de fecho positiva e verdadeira
    if city:
        frases.append(f"Procura contribuir com responsabilidade e vontade de aprender, com disponibilidade em {city}.")
    else:
        frases.append("Procura contribuir com responsabilidade, rigor e vontade de aprender.")

    texto = " ".join(frases)
    return texto.strip()
