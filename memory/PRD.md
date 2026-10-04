# KurrikuluPro Angola — PRD

## Problema (original)
Aplicação web completa para pessoas em Angola criarem currículos profissionais verdadeiros, prontos a enviar a empresas. Produto utilizável: formulários funcionais, persistência segura, pré-visualização A4, geração de PDF e administração de pedidos. Português de Angola, mobile-first.

## Decisões do proprietário (ask_human)
- Versão nova (sem importar repositório).
- Candidatos SEM login; rascunho guardado por token no dispositivo. Admin com login separado.
- Pagamento manual (900 Kz): pedido pendente + comprovativo, admin aprova.
- Perfil gerado por modelos/regras determinísticas (sem IA, sem custo recorrente).
- Dados de pagamento ocultos / "a confirmar" até o proprietário publicar.
- WhatsApp de suporte: +244 958 826 913 (só suporte).
- Só preview; não publicar nem alterar domínio sem autorização.

## Stack
- Frontend: React 19 + Tailwind + shadcn/ui + lucide-react (CRA/craco).
- Backend: FastAPI + MongoDB (motor). PDF: WeasyPrint (texto seleccionável, acentos PT).
- Auth admin: JWT em cookie httpOnly + bcrypt.

## Arquitectura / dados (MongoDB)
- drafts: {token, content, timestamps} — conteúdo completo do CV.
- orders: {order_code, access_token, draft_token, content_snapshot, status, phone, amount, method, receipt, reject_reason}. Estados: aguarda_pagamento → comprovativo_recebido → em_verificacao → aprovado/rejeitado.
- admins: {email, password_hash, role}. Seed: pesselajustino7@gmail.com.
- professions: catálogo (~72 sementes, 18 famílias, pesquisável, admin edita/desactiva).
- settings(payment): preço + dados Multicaixa/referência/IBAN/WhatsApp + flag `published`.
- audit_log: acções admin.

## Implementado e testado (2026-06 / iteration_1: backend 20/20, frontend ~98%)
- 6 percursos (procurar_emprego, curriculo_pessoal, prestar_servicos, baba_cuidador, trabalhar_casa, nao_sei_escolher).
- Editor por separadores + pré-visualização A4 "Proposta 02" com marca de água; autosave; mobile Editar/Pré-visualizar.
- Adaptação opcional a profissão (pesquisa catálogo + "Outra profissão"); competências sempre por confirmação.
- Percursos babá (grupos de cuidado, 1.os socorros opcional, sem dados de crianças) e casa (tarefas só se seleccionadas) separados.
- Perfil determinístico (gerar/editar/regenerar com confirmação; edição manual não é sobrescrita).
- Revisão com mostrar/ocultar secções; confirmar antes de apagar CV.
- Pedido + pagamento manual: dados ocultos até publicar; upload de comprovativo (tipo/tamanho validados) não liberta PDF.
- Estado do pedido; PDF limpo (WeasyPrint) só após aprovação (403 antes).
- Admin: login protegido, lista/filtros, detalhe + visualização privada do comprovativo, aprovar/rejeitar com motivo, auditoria, definições (publicar pagamento), gestão de profissões.

## Backlog / próximos (P1/P2)
- P1: Secção Referências dedicada com consentimento; links profissionais nos Dados pessoais.
- P1: Correspondência próxima na pesquisa de profissões (sugestões quando não há correspondência exacta).
- P2: Retoma do rascunho por link/código entre dispositivos (token com validade).
- P2: Fotografia opcional (armazenamento privado) — desligada por defeito.
- P2: PayPal (só com conta do proprietário); SEO (sitemap/robots); e-mail de confirmação (Resend).

## Notas de produção (antes de deploy)
- Definir CORS_ORIGINS para a origem explícita do frontend (allow_credentials=True).
- Confirmar e publicar os dados de pagamento (actualmente ocultos).
