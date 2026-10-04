"""Catálogo inicial de profissões para Angola.

Sementes de pesquisa, não uma lista definitiva. Cada registo tem campos
consistentes. O administrador pode acrescentar/desactivar via painel.
"""

# family: (id, display_name)
FAMILIES = [
    ("administracao", "Administração, Secretariado e RH"),
    ("contabilidade", "Contabilidade, Finanças e Banca"),
    ("saude", "Saúde e Cuidados Clínicos"),
    ("educacao", "Educação e Formação"),
    ("ti", "Tecnologias de Informação e Telecomunicações"),
    ("engenharia", "Engenharia, Arquitectura e Construção"),
    ("oficios", "Ofícios, Técnicos e Manutenção"),
    ("industria", "Indústria, Energia e Produção"),
    ("comercio", "Comércio, Vendas e Atendimento"),
    ("marketing", "Marketing, Comunicação e Design"),
    ("hotelaria", "Hotelaria, Turismo e Restauração"),
    ("transportes", "Transportes, Condução e Logística"),
    ("agricultura", "Agricultura, Pecuária e Ambiente"),
    ("beleza", "Beleza e Bem-estar"),
    ("dominio", "Cuidados e Serviços Domésticos"),
    ("seguranca", "Segurança e Protecção"),
    ("direito", "Direito e Administração Pública"),
    ("artes", "Artes, Audiovisual e Jornalismo"),
]

FAMILY_NAMES = {fid: name for fid, name in FAMILIES}


def _p(pid, family, name, aliases, pathway, skills, desc=""):
    return {
        "id": pid,
        "family": family,
        "name": name,
        "aliases": aliases,
        "short_desc": desc,
        "pathway": pathway,
        "skill_groups": skills,
        "status": "published",
    }


# pathway values: procurar_emprego | prestar_servicos | baba_cuidador | trabalhar_casa
_SEED = [
    # Administração / Secretariado / RH
    _p("secretaria", "administracao", "Secretária / Secretário", ["secretariado", "assistente administrativo", "secretaria executiva"], "procurar_emprego",
       ["Atendimento ao cliente", "Gestão de agenda", "Correspondência", "Organização documental", "Microsoft Word", "Microsoft Excel", "Atendimento telefónico"]),
    _p("rececionista", "administracao", "Recepcionista", ["recepção", "front office", "recepcionista de escritório"], "procurar_emprego",
       ["Atendimento ao público", "Gestão de chamadas", "Marcação de reuniões", "Organização", "Boa apresentação"]),
    _p("assistente_rh", "administracao", "Assistente de Recursos Humanos", ["rh", "gestão de pessoal", "tecnico de rh"], "procurar_emprego",
       ["Processamento de cadastro", "Apoio ao recrutamento", "Controlo de assiduidade", "Organização de documentos", "Comunicação"]),
    _p("arquivista", "administracao", "Arquivista", ["gestão documental", "arquivo"], "procurar_emprego",
       ["Classificação de documentos", "Digitalização", "Organização de arquivo", "Atenção ao detalhe"]),
    _p("assistente_administrativo", "administracao", "Assistente Administrativo", ["apoio administrativo", "auxiliar administrativo"], "procurar_emprego",
       ["Apoio administrativo", "Microsoft Office", "Organização", "Atendimento", "Gestão de documentos"]),

    # Contabilidade / Finanças / Banca
    _p("contabilista", "contabilidade", "Contabilista", ["contabilidade", "tecnico de contas", "contador"], "procurar_emprego",
       ["Contabilidade geral", "Reconciliação bancária", "Facturação", "Processamento salarial", "Impostos", "Excel"]),
    _p("tesoureiro", "contabilidade", "Tesoureiro(a) / Caixa", ["tesouraria", "caixa", "operador de caixa"], "procurar_emprego",
       ["Gestão de caixa", "Controlo de pagamentos", "Reconciliação", "Atendimento", "Rigor"]),
    _p("auditor", "contabilidade", "Auditor(a)", ["auditoria", "auditor interno"], "procurar_emprego",
       ["Análise de processos", "Controlo interno", "Relatórios", "Rigor", "Excel"]),
    _p("bancario", "contabilidade", "Bancário(a) / Caixa de Banco", ["banca", "operador bancário", "gestor de conta"], "procurar_emprego",
       ["Atendimento bancário", "Operações de caixa", "Produtos financeiros", "Rigor", "Comunicação"]),

    # Saúde
    _p("enfermeiro", "saude", "Enfermeiro(a)", ["enfermagem", "tecnico de enfermagem"], "procurar_emprego",
       ["Cuidados de enfermagem", "Administração de medicação", "Sinais vitais", "Trabalho em equipa", "Primeiros socorros"]),
    _p("medico", "saude", "Médico(a)", ["medicina", "clinico geral"], "procurar_emprego",
       ["Consulta clínica", "Diagnóstico", "Acompanhamento de pacientes", "Trabalho em equipa"]),
    _p("farmaceutico", "saude", "Farmacêutico(a) / Técnico de Farmácia", ["farmácia", "balconista de farmácia"], "procurar_emprego",
       ["Dispensa de medicamentos", "Atendimento", "Gestão de stock", "Aconselhamento"]),
    _p("tecnico_laboratorio", "saude", "Técnico de Laboratório", ["análises clínicas", "laboratório"], "procurar_emprego",
       ["Recolha de amostras", "Análises", "Higiene e segurança", "Rigor"]),
    _p("auxiliar_saude", "saude", "Auxiliar de Saúde / Enfermagem", ["auxiliar de enfermagem", "ajudante de saude"], "procurar_emprego",
       ["Apoio a pacientes", "Higiene", "Sinais vitais", "Trabalho em equipa"]),

    # Educação
    _p("professor", "educacao", "Professor(a)", ["docente", "educador", "formador"], "procurar_emprego",
       ["Preparação de aulas", "Avaliação", "Gestão de sala", "Comunicação", "Métodos pedagógicos"]),
    _p("educador_infancia", "educacao", "Educador(a) de Infância", ["educação pré-escolar", "jardim de infância"], "procurar_emprego",
       ["Actividades lúdicas", "Supervisão", "Apoio ao desenvolvimento", "Paciência", "Comunicação com famílias"]),
    _p("explicador", "educacao", "Explicador(a) / Tutor", ["tutoria", "apoio escolar", "explicações"], "prestar_servicos",
       ["Apoio ao estudo", "Preparação de exames", "Paciência", "Comunicação"]),
    _p("formador", "educacao", "Formador(a) Profissional", ["formação", "instrutor"], "procurar_emprego",
       ["Planeamento de formação", "Facilitação", "Avaliação", "Comunicação"]),

    # TI
    _p("tecnico_informatica", "ti", "Técnico de Informática", ["suporte informático", "helpdesk", "ti"], "prestar_servicos",
       ["Manutenção de computadores", "Instalação de software", "Redes", "Suporte ao utilizador", "Resolução de problemas"]),
    _p("programador", "ti", "Programador(a) / Developer", ["desenvolvedor", "software", "developer"], "procurar_emprego",
       ["Programação", "Base de dados", "Resolução de problemas", "Trabalho em equipa"]),
    _p("tecnico_redes", "ti", "Técnico de Redes", ["redes e sistemas", "network"], "prestar_servicos",
       ["Configuração de redes", "Cablagem", "Manutenção", "Diagnóstico"]),
    _p("tecnico_telecom", "ti", "Técnico de Telecomunicações", ["telecomunicações", "telecom"], "prestar_servicos",
       ["Instalação de equipamentos", "Manutenção", "Diagnóstico", "Atendimento técnico"]),

    # Engenharia / Construção
    _p("engenheiro_civil", "engenharia", "Engenheiro(a) Civil", ["engenharia civil", "construção civil"], "procurar_emprego",
       ["Gestão de obra", "Leitura de projectos", "Fiscalização", "Orçamentação", "AutoCAD"]),
    _p("arquitecto", "engenharia", "Arquitecto(a)", ["arquitectura", "desenho de projectos"], "procurar_emprego",
       ["Projecto de arquitectura", "AutoCAD", "Desenho técnico", "Acompanhamento de obra"]),
    _p("desenhador", "engenharia", "Desenhador(a) Projectista", ["desenho técnico", "projectista", "cad"], "procurar_emprego",
       ["AutoCAD", "Desenho técnico", "Leitura de projectos", "Rigor"]),
    _p("tecnico_obra", "engenharia", "Técnico / Encarregado de Obra", ["encarregado de obra", "mestre de obras"], "procurar_emprego",
       ["Coordenação de equipas", "Leitura de projectos", "Controlo de materiais", "Segurança em obra"]),

    # Ofícios / Manutenção
    _p("electricista", "oficios", "Electricista", ["electricidade", "instalações eléctricas"], "prestar_servicos",
       ["Instalações eléctricas", "Reparação", "Diagnóstico de avarias", "Segurança eléctrica", "Manutenção"]),
    _p("canalizador", "oficios", "Canalizador / Picheleiro", ["canalização", "pichelaria", "encanador"], "prestar_servicos",
       ["Instalação de canalização", "Reparação de fugas", "Manutenção", "Diagnóstico"]),
    _p("soldador", "oficios", "Soldador", ["soldadura", "serralharia"], "prestar_servicos",
       ["Soldadura", "Leitura de medidas", "Segurança", "Acabamento"]),
    _p("carpinteiro", "oficios", "Carpinteiro / Marceneiro", ["carpintaria", "marcenaria", "madeira"], "prestar_servicos",
       ["Trabalho em madeira", "Medição e corte", "Montagem", "Acabamento"]),
    _p("pintor", "oficios", "Pintor de Construção", ["pintura", "pintor de casas"], "prestar_servicos",
       ["Preparação de superfícies", "Pintura", "Acabamento", "Organização do trabalho"]),
    _p("pedreiro", "oficios", "Pedreiro / Trolha", ["construção", "alvenaria", "trolha"], "prestar_servicos",
       ["Alvenaria", "Reboco", "Assentamento", "Leitura de medidas"]),
    _p("mecanico", "oficios", "Mecânico Auto", ["mecânica", "oficina", "mecânico de automóveis"], "prestar_servicos",
       ["Reparação de motores", "Diagnóstico de avarias", "Manutenção", "Revisões"]),
    _p("tecnico_refrigeracao", "oficios", "Técnico de Refrigeração / AVAC", ["ar condicionado", "refrigeração", "frio"], "prestar_servicos",
       ["Instalação de ar condicionado", "Manutenção", "Diagnóstico", "Carga de gás"]),
    _p("electronico", "oficios", "Técnico de Electrónica", ["electrónica", "reparação de equipamentos"], "prestar_servicos",
       ["Reparação de equipamentos", "Diagnóstico", "Soldadura electrónica", "Manutenção"]),

    # Indústria / Energia
    _p("operador_maquinas", "industria", "Operador(a) de Máquinas", ["operação de máquinas", "produção"], "procurar_emprego",
       ["Operação de máquinas", "Controlo de qualidade", "Segurança industrial", "Trabalho por turnos"]),
    _p("tecnico_petroleo", "industria", "Técnico de Petróleo e Gás", ["petróleo", "gás", "oil and gas"], "procurar_emprego",
       ["Operações industriais", "Segurança (HSE)", "Manutenção", "Trabalho em equipa"]),
    _p("controlo_qualidade", "industria", "Técnico de Controlo de Qualidade", ["qualidade", "qa"], "procurar_emprego",
       ["Inspecção", "Controlo de qualidade", "Relatórios", "Rigor"]),

    # Comércio / Vendas
    _p("vendedor", "comercio", "Vendedor(a) / Comercial", ["vendas", "comercial", "promotor"], "procurar_emprego",
       ["Atendimento ao cliente", "Vendas", "Negociação", "Gestão de metas", "Operação de caixa"]),
    _p("caixa_loja", "comercio", "Operador(a) de Caixa (Loja)", ["caixa de loja", "operador de caixa"], "procurar_emprego",
       ["Operação de caixa", "Atendimento", "Controlo de dinheiro", "Organização"]),
    _p("repositor", "comercio", "Repositor(a) / Fiel de Armazém", ["reposição", "stock", "armazém"], "procurar_emprego",
       ["Reposição de produtos", "Controlo de stock", "Organização", "Arrumação"]),
    _p("atendimento_cliente", "comercio", "Atendimento ao Cliente / Telemarketing", ["call center", "telemarketing", "apoio ao cliente"], "procurar_emprego",
       ["Atendimento telefónico", "Comunicação", "Resolução de reclamações", "Paciência"]),
    _p("supervisor_loja", "comercio", "Supervisor(a) de Loja", ["chefe de loja", "gerente de loja"], "procurar_emprego",
       ["Gestão de equipa", "Controlo de vendas", "Atendimento", "Organização"]),

    # Marketing / Comunicação / Design
    _p("marketing", "marketing", "Técnico de Marketing", ["marketing digital", "publicidade"], "procurar_emprego",
       ["Redes sociais", "Criação de conteúdos", "Campanhas", "Comunicação"]),
    _p("designer", "marketing", "Designer Gráfico", ["design gráfico", "artes gráficas"], "prestar_servicos",
       ["Design gráfico", "Photoshop", "Illustrator", "Criatividade"]),
    _p("gestor_redes", "marketing", "Gestor de Redes Sociais", ["social media", "community manager"], "prestar_servicos",
       ["Gestão de redes sociais", "Criação de conteúdos", "Planeamento", "Comunicação"]),

    # Hotelaria / Restauração
    _p("rececionista_hotel", "hotelaria", "Recepcionista de Hotel", ["recepção de hotel", "front desk"], "procurar_emprego",
       ["Check-in e check-out", "Atendimento", "Reservas", "Línguas"]),
    _p("cozinheiro", "hotelaria", "Cozinheiro(a) / Chef", ["cozinha", "chef", "culinária"], "procurar_emprego",
       ["Confecção de refeições", "Higiene alimentar", "Organização de cozinha", "Trabalho sob pressão"]),
    _p("empregado_mesa", "hotelaria", "Empregado(a) de Mesa / Bar", ["servente de mesa", "garçom", "barman"], "procurar_emprego",
       ["Serviço de mesa", "Atendimento", "Organização de sala", "Simpatia"]),
    _p("pasteleiro", "hotelaria", "Pasteleiro(a) / Padeiro", ["pastelaria", "padaria"], "procurar_emprego",
       ["Confecção de pães e bolos", "Higiene alimentar", "Organização", "Rigor"]),
    _p("camareira_hotel", "hotelaria", "Camareira / Governanta", ["limpeza de hotel", "housekeeping"], "procurar_emprego",
       ["Limpeza de quartos", "Organização", "Atenção ao detalhe", "Rapidez"]),

    # Transportes / Logística
    _p("motorista", "transportes", "Motorista", ["condutor", "chauffeur"], "procurar_emprego",
       ["Condução segura", "Conhecimento de vias", "Manutenção básica", "Pontualidade"]),
    _p("motorista_pesados", "transportes", "Motorista de Pesados", ["camionista", "condutor de pesados"], "procurar_emprego",
       ["Condução de pesados", "Carga e descarga", "Conhecimento de vias", "Segurança rodoviária"]),
    _p("estafeta", "transportes", "Estafeta / Entregador", ["entregas", "delivery", "motoboy"], "prestar_servicos",
       ["Entregas", "Pontualidade", "Conhecimento de zonas", "Atendimento"]),
    _p("operador_logistica", "transportes", "Operador de Logística / Armazém", ["logística", "expedição", "fiel de armazém"], "procurar_emprego",
       ["Gestão de stock", "Expedição", "Organização", "Operação de empilhador"]),

    # Agricultura
    _p("tecnico_agricola", "agricultura", "Técnico Agrícola", ["agricultura", "agronomia"], "procurar_emprego",
       ["Produção agrícola", "Gestão de culturas", "Irrigação", "Trabalho de campo"]),
    _p("pecuaria", "agricultura", "Técnico de Pecuária", ["pecuária", "criação de gado"], "procurar_emprego",
       ["Criação de animais", "Alimentação", "Cuidados veterinários básicos", "Trabalho de campo"]),

    # Beleza
    _p("cabeleireiro", "beleza", "Cabeleireiro(a) / Barbeiro", ["cabeleireiro", "barbeiro", "salão"], "prestar_servicos",
       ["Corte de cabelo", "Penteados", "Atendimento", "Higiene"]),
    _p("esteticista", "beleza", "Esteticista / Manicure", ["estética", "manicure", "unhas"], "prestar_servicos",
       ["Tratamentos de estética", "Manicure e pedicure", "Atendimento", "Higiene"]),
    _p("maquilhadora", "beleza", "Maquilhador(a)", ["maquilhagem", "make up"], "prestar_servicos",
       ["Maquilhagem", "Atendimento", "Criatividade", "Higiene"]),

    # Cuidados e doméstico (percursos próprios)
    _p("baba", "dominio", "Babá", ["ama", "cuidadora de crianças"], "baba_cuidador",
       ["Supervisão e segurança", "Rotinas", "Higiene", "Apoio nas refeições", "Brincadeiras e actividades", "Apoio escolar"]),
    _p("cuidador_idosos", "dominio", "Cuidador(a) de Idosos", ["acompanhante de idosos", "cuidador"], "baba_cuidador",
       ["Apoio ao idoso", "Higiene", "Apoio nas refeições", "Acompanhamento", "Administração de rotinas"]),
    _p("empregada_domestica", "dominio", "Empregada Doméstica", ["doméstica", "trabalhadora doméstica"], "trabalhar_casa",
       ["Limpeza e organização", "Lavagem e passagem de roupa", "Cozinha e preparação de refeições", "Compras e despensa", "Rotinas familiares"]),
    _p("cozinheira_casa", "dominio", "Cozinheira(o) em Casa Particular", ["cozinheira doméstica"], "trabalhar_casa",
       ["Cozinha e preparação de refeições", "Compras e despensa", "Higiene", "Organização"]),
    _p("engomadeira", "dominio", "Engomadeira / Lavandaria", ["passar roupa", "lavandaria"], "trabalhar_casa",
       ["Lavagem e passagem de roupa", "Organização", "Rigor"]),

    # Segurança
    _p("vigilante", "seguranca", "Vigilante / Segurança", ["segurança privada", "guarda"], "procurar_emprego",
       ["Vigilância", "Controlo de acessos", "Elaboração de relatórios", "Atenção"]),
    _p("bombeiro", "seguranca", "Bombeiro / Prevenção", ["prevenção de riscos", "socorro"], "procurar_emprego",
       ["Prevenção de riscos", "Primeiros socorros", "Trabalho em equipa", "Resposta a emergências"]),

    # Direito / Administração Pública
    _p("jurista", "direito", "Jurista / Advogado", ["direito", "advocacia"], "procurar_emprego",
       ["Análise jurídica", "Elaboração de documentos", "Aconselhamento", "Rigor"]),
    _p("assistente_social", "direito", "Assistente Social", ["acção social", "serviço social"], "procurar_emprego",
       ["Apoio social", "Acompanhamento", "Comunicação", "Trabalho comunitário"]),

    # Artes / Audiovisual / Jornalismo
    _p("fotografo", "artes", "Fotógrafo(a)", ["fotografia", "foto e vídeo"], "prestar_servicos",
       ["Fotografia", "Edição de imagem", "Atendimento", "Criatividade"]),
    _p("jornalista", "artes", "Jornalista / Redactor", ["jornalismo", "redacção", "comunicação social"], "procurar_emprego",
       ["Redacção", "Pesquisa", "Entrevistas", "Comunicação"]),
    _p("editor_video", "artes", "Editor(a) de Vídeo", ["edição de vídeo", "audiovisual"], "prestar_servicos",
       ["Edição de vídeo", "Criatividade", "Organização de projectos"]),
]


def get_catalog():
    return [dict(p) for p in _SEED]
