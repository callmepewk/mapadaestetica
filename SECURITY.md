Mapa da Estética

Versão: 1.0
Data: 03/03/2026
Classificação: Público
Responsável Técnico: Pedro Henrique Brezolin de Freitas - CTO

1. OBJETIVO

Estabelecer diretrizes técnicas, administrativas e operacionais para garantir:

Confidencialidade

Integridade

Disponibilidade

Autenticidade

Rastreabilidade

Das informações e sistemas do Mapa da Estética, assegurando conformidade com:

Lei Geral de Proteção de Dados Pessoais

Marco Civil da Internet (Lei 12.965/2014)

Diretrizes de segurança do National Institute of Standards and Technology (NIST)

Boas práticas ISO 27001/27002

2. ESCOPO

Aplica-se a:

Web Application (Frontend)

APIs e Backend

Banco de Dados

Infraestrutura de hospedagem

Serviços de terceiros

Repositórios de código

Ambientes de desenvolvimento, staging e produção

3. MODELO DE SEGURANÇA ADOTADO

O Mapa da Estética adota:

3.1 Zero Trust Architecture

Baseado no modelo do NIST SP 800-207:

Nenhuma requisição é confiável por padrão

Toda autenticação é validada continuamente

Acesso concedido apenas sob menor privilégio

Sessões temporárias e revogáveis

3.2 Princípios Fundamentais

Security by Design

Privacy by Design

Least Privilege

Segregação de ambientes

Defesa em profundidade

4. ARQUITETURA DE SEGURANÇA
4.1 Infraestrutura

HTTPS obrigatório (TLS 1.2+)

Certificado SSL válido

WAF ativo

Firewall configurado com portas mínimas abertas

Proteção contra DDoS

Separação lógica entre frontend, backend e banco

4.2 Segurança de Aplicação

Proteções implementadas contra:

SQL Injection

Cross-Site Scripting (XSS)

Cross-Site Request Forgery (CSRF)

Clickjacking

Injeção de comandos

Escalada de privilégio

4.3 Headers de Segurança

Devem estar ativos:

Content-Security-Policy

X-Frame-Options: DENY

X-Content-Type-Options: nosniff

Referrer-Policy: strict-origin

Permissions-Policy

5. CONTROLE DE ACESSO
5.1 Autenticação

Autenticação baseada em token (JWT ou similar)

Expiração curta de sessão

Refresh token protegido

MFA obrigatório para administradores

5.2 Autorização

RBAC (Role-Based Access Control)

Usuário

Clínica

Administrador

Princípio do menor privilégio

6. PROTEÇÃO DE DADOS
6.1 Dados Coletados (quando aplicável)

Nome

E-mail

Telefone

Dados profissionais

Endereço comercial

IP e logs técnicos

6.2 Criptografia

Dados em trânsito criptografados (TLS)

Dados sensíveis criptografados em repouso

Senhas com hash seguro (bcrypt ou equivalente)

7. LOGS E MONITORAMENTO

Registro de tentativas de login

Registro de alterações administrativas

Registro de alterações em perfis profissionais

Logs retidos por no mínimo 6 meses

Monitoramento de anomalias de tráfego

8. BACKUP E CONTINUIDADE

Backup automático diário

Retenção mínima de 30 dias

Backup criptografado

Testes periódicos de restauração

RTO máximo: 4h

RPO máximo: 24h

9. SEGURANÇA DE DESENVOLVIMENTO (Secure SDLC)

Versionamento via Git

Code review obrigatório

Auditoria de dependências (npm audit ou equivalente)

Separação entre ambiente de desenvolvimento e produção

Testes de segurança antes de deploy

10. GESTÃO DE INCIDENTES
10.1 Classificação

Baixo impacto

Médio impacto

Alto impacto (ex: vazamento de dados)

10.2 Procedimento

Identificação

Contenção

Erradicação

Recuperação

Análise pós-incidente

Notificação à ANPD quando aplicável (em conformidade com LGPD)

Tempo máximo de resposta inicial: 72h

11. GESTÃO DE TERCEIROS

Serviços externos devem:

Garantir criptografia

Cumprir LGPD

Não compartilhar dados sem autorização

Possuir política de segurança documentada

12. POLÍTICA DE VULNERABILIDADES

Relatórios de vulnerabilidades devem ser enviados para:

security@portofirmedigital.com.br

Informações necessárias:

Descrição técnica

Evidências

Passo a passo de reprodução

Impacto estimado

Correção:

Crítica: até 7 dias

Alta: até 15 dias

Média: até 30 dias

13. CONFORMIDADE REGULATÓRIA

O Mapa da Estética compromete-se a:

Respeitar direitos do titular de dados

Permitir solicitação de acesso, correção e exclusão

Garantir transparência sobre tratamento de dados

Não realizar decisões automatizadas com impacto jurídico sem revisão humana

14. REVISÃO E AUDITORIA

Revisão anual desta política

Auditoria interna semestral

Testes de vulnerabilidade periódicos

Pentest externo recomendado anualmente

15. DECLARAÇÃO FINAL

O Mapa da Estética adota postura proativa e estruturada em segurança da informação, visando:

Proteção de profissionais e usuários

Conformidade legal

Redução de risco operacional

Sustentabilidade tecnológica

Esta política entra em vigor na data de publicação e permanece válida até revisão formal.
