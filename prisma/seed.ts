import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FRENTES = [
  { key: "fiscal", nome: "Fiscal", cor: "#5B8CFF", descricao: "Demandas do motor fiscal e regras tributárias." },
  { key: "dp", nome: "DP", cor: "#9614d0", descricao: "Demandas do Departamento Pessoal — folha e obrigações." },
  { key: "contabil", nome: "Contábil", cor: "#3FD68C", descricao: "Demandas do squad Contábil." },
  { key: "autopilot", nome: "Autopilot", cor: "#FFB454", descricao: "Demandas do Cockpit / Autopilot." },
  { key: "pessoal", nome: "Pessoal", cor: "#FF6FA5", descricao: "Projetos pessoais, fora do escopo BHub." },
];

const WLABELS = [
  { key: "wl1", nome: "Quick win", cor: "#bb44f0", descricao: "Baixo esforço, entrega rápida." },
  { key: "wl2", nome: "Precisa validação", cor: "#FFB454", descricao: "Depende de aval de alguém antes de seguir." },
  { key: "wl3", nome: "Bloqueado", cor: "#FF6B6B", descricao: "Parado por dependência externa." },
  { key: "wl4", nome: "Alto impacto", cor: "#5B8CFF", descricao: "Alta relevância pro negócio ou pro usuário." },
];

const TASK_STATUSES = [
  { nome: "Backlog", cor: "#9a94a3", descricao: "Ainda não priorizado, aguardando entrar no fluxo." },
  { nome: "Em andamento", cor: "#9614d0", descricao: "Sendo executado no momento." },
  { nome: "Bloqueado", cor: "#e05252", descricao: "Parado por dependência externa ou decisão pendente." },
  { nome: "Revisão", cor: "#e0a336", descricao: "Em validação antes de fechar." },
  { nome: "Concluído", cor: "#3fae6a", descricao: "Finalizado." },
];

const DEMAND_STATUSES = [
  { nome: "Planejamento", cor: "#9a94a3", descricao: "Ainda sendo desenhada, não começou a execução." },
  { nome: "Em execução", cor: "#9614d0", descricao: "Rodando ativamente." },
  { nome: "Pausada", cor: "#e0a336", descricao: "Parada temporariamente." },
  { nome: "Concluída", cor: "#3fae6a", descricao: "Finalizada." },
];

const PESSOAS = ["Luiz (você)", "Bill", "Jorge", "Glauco", "Mateus", "Jaqueline", "Elaine", "Jeniffer"];

interface SeedTarefa {
  id: string;
  nome: string;
  status: string;
  descricao: string;
  pessoas: string[];
  tempoRastreado: number;
  relatedIssueIds: string[];
  dataInicio: string;
  dataFim: string;
  tamanho: string;
  labels: string[];
  files?: { nome: string }[];
  links?: { nome: string; url: string }[];
}

interface SeedDemanda {
  id: string;
  frente: string;
  nome: string;
  status: string;
  dataInicio: string;
  dataFim: string | null;
  repositorio: string;
  pessoas: string[];
  wlabels: string[];
  skills: string[];
  observacoes: string;
  relatedIssueIds: string[];
  files: { nome: string }[];
  links: { nome: string; url: string }[];
  decisoes: { texto: string; autor: string }[];
  stakeholderUpdates: { pessoaNome: string; ultimoEnvio: string }[];
  tasks: SeedTarefa[];
}

async function main() {
  const frenteByKey: Record<string, string> = {};
  for (const [i, f] of FRENTES.entries()) {
    const created = await prisma.frente.upsert({
      where: { id: f.key },
      update: {},
      create: { id: f.key, nome: f.nome, cor: f.cor, descricao: f.descricao, ordem: i },
    });
    frenteByKey[f.key] = created.id;
  }

  const wlabelByKey: Record<string, string> = {};
  for (const [i, w] of WLABELS.entries()) {
    const created = await prisma.wLabel.upsert({
      where: { id: w.key },
      update: {},
      create: { id: w.key, nome: w.nome, cor: w.cor, descricao: w.descricao, ordem: i },
    });
    wlabelByKey[w.key] = created.id;
  }

  const taskStatusByName: Record<string, string> = {};
  for (const [i, s] of TASK_STATUSES.entries()) {
    const created = await prisma.statusTarefa.upsert({
      where: { id: s.nome },
      update: {},
      create: { id: s.nome, nome: s.nome, cor: s.cor, descricao: s.descricao, ordem: i },
    });
    taskStatusByName[s.nome] = created.id;
  }

  const demandStatusByName: Record<string, string> = {};
  for (const [i, s] of DEMAND_STATUSES.entries()) {
    const created = await prisma.statusDemanda.upsert({
      where: { id: s.nome },
      update: {},
      create: { id: s.nome, nome: s.nome, cor: s.cor, descricao: s.descricao, ordem: i },
    });
    demandStatusByName[s.nome] = created.id;
  }

  const pessoaByNome: Record<string, string> = {};
  for (const [i, nome] of PESSOAS.entries()) {
    const created = await prisma.pessoa.upsert({
      where: { id: nome },
      update: {},
      create: { id: nome, nome, ordem: i },
    });
    pessoaByNome[nome] = created.id;
  }

  const connectPessoas = (nomes: string[]) => nomes.map((n) => ({ id: pessoaByNome[n] }));
  const connectWLabels = (keys: string[]) => keys.map((k) => ({ id: wlabelByKey[k] }));

  const demandas: SeedDemanda[] = [
    {
      id: "d1",
      frente: "fiscal",
      nome: "Reformulação UI Bhules",
      status: "Em execução",
      dataInicio: "2026-07-28",
      dataFim: null,
      repositorio: "https://github.com/BHubAI/motor-regras-nfe",
      pessoas: ["Luiz (você)", "Bill"],
      wlabels: ["wl1", "wl4"],
      skills: ["Comunicação com stakeholders", "Execução"],
      observacoes: "Priorizar sidebar e tabelas primeiro — são as telas com mais reclamação de consistência visual.",
      relatedIssueIds: ["FIS-381", "FIS-332"],
      files: [{ nome: "auditoria-componentes.pdf" }],
      links: [{ nome: "Figma — BHules v2", url: "https://figma.com/file/bhules-v2" }],
      decisoes: [{ texto: "Decidido priorizar sidebar e header antes das tabelas, alinhado com Bill.", autor: "Luiz Mendonça" }],
      stakeholderUpdates: [{ pessoaNome: "Bill", ultimoEnvio: "2026-08-25" }],
      tasks: [
        { id: "t1", nome: "Mapear componentes divergentes do D.S", status: "Concluído", descricao: "Levantar todos os componentes fora do padrão (badges, tabelas, inputs).", pessoas: ["Luiz (você)"], tempoRastreado: 5400, relatedIssueIds: ["FIS-332"], dataInicio: "2026-08-25", dataFim: "2026-08-27", tamanho: "S", labels: ["Design"] },
        { id: "t2", nome: "Redesenhar sidebar e header", status: "Em andamento", descricao: "Aplicar tokens do D.S BHub na sidebar e no header do BHules.", pessoas: ["Luiz (você)", "Bill"], tempoRastreado: 9800, relatedIssueIds: ["FIS-381"], dataInicio: "2026-08-28", dataFim: "2026-09-03", tamanho: "M", labels: ["Design", "Funcionalidade"], files: [{ nome: "sidebar-v2.fig" }], links: [{ nome: "Referência Cockpit", url: "https://cockpit.bhub.ai" }] },
        { id: "t3", nome: "Padronizar tabelas de regras fiscais", status: "Backlog", descricao: "", pessoas: [], tempoRastreado: 0, relatedIssueIds: [], dataInicio: "2026-09-02", dataFim: "2026-09-08", tamanho: "M", labels: [] },
        { id: "t4", nome: "Handoff pro time de dev", status: "Backlog", descricao: "", pessoas: ["Jorge"], tempoRastreado: 0, relatedIssueIds: [], dataInicio: "2026-09-09", dataFim: "2026-09-10", tamanho: "S", labels: [] },
      ],
    },
    {
      id: "d2",
      frente: "dp",
      nome: "Painel de Monitoramento eSocial",
      status: "Concluída",
      dataInicio: "2026-08-05",
      dataFim: "2026-08-24",
      repositorio: "https://github.com/BHubAI/motor-trabalhista",
      pessoas: ["Luiz (você)", "Jeniffer"],
      wlabels: ["wl4"],
      skills: [],
      observacoes: "",
      relatedIssueIds: ["DP-322", "DP-381"],
      files: [],
      links: [],
      decisoes: [],
      stakeholderUpdates: [],
      tasks: [
        { id: "t5", nome: "Protótipo navegável — overview", status: "Concluído", descricao: "Primeira versão completa do painel, escopo cheio.", pessoas: ["Luiz (você)"], tempoRastreado: 14400, relatedIssueIds: ["DP-322"], dataInicio: "2026-08-10", dataFim: "2026-08-14", tamanho: "L", labels: ["Design"] },
        { id: "t6", nome: "Reduzir escopo pra v1", status: "Revisão", descricao: "Cortar o painel completo pra um recorte v1 mais enxuto.", pessoas: ["Luiz (você)", "Jeniffer"], tempoRastreado: 3600, relatedIssueIds: ["DP-381"], dataInicio: "2026-08-19", dataFim: "2026-08-24", tamanho: "M", labels: [] },
      ],
    },
    {
      id: "d3",
      frente: "autopilot",
      nome: "Cockpit — Config Center v2",
      status: "Em execução",
      dataInicio: "2026-08-15",
      dataFim: null,
      repositorio: "",
      pessoas: ["Luiz (você)", "Glauco"],
      wlabels: ["wl2"],
      skills: [],
      observacoes: "Depende de definição do Glauco sobre schema de steps antes de fechar o visual.",
      relatedIssueIds: ["AUTO-120"],
      files: [],
      links: [{ nome: "RFC técnico", url: "https://linear.app/bhub/document/rfc-config-center" }],
      decisoes: [],
      stakeholderUpdates: [],
      tasks: [
        { id: "t7", nome: "Levantar variações de step existentes", status: "Concluído", descricao: "", pessoas: ["Luiz (você)"], tempoRastreado: 7200, relatedIssueIds: [], dataInicio: "2026-08-15", dataFim: "2026-08-17", tamanho: "S", labels: [] },
        { id: "t8", nome: "Desenhar componente de step configurável", status: "Em andamento", descricao: "Componente precisa suportar condição, ação e delay.", pessoas: ["Luiz (você)"], tempoRastreado: 1800, relatedIssueIds: ["AUTO-120"], dataInicio: "2026-08-25", dataFim: "2026-09-05", tamanho: "L", labels: ["Funcionalidade"] },
        { id: "t9", nome: "Validar com Glauco", status: "Bloqueado", descricao: "", pessoas: ["Glauco"], tempoRastreado: 0, relatedIssueIds: [], dataInicio: "2026-09-04", dataFim: "2026-09-05", tamanho: "XS", labels: [] },
      ],
    },
    {
      id: "d4",
      frente: "pessoal",
      nome: "Site pessoal — portfólio + admin",
      status: "Planejamento",
      dataInicio: "2026-06-01",
      dataFim: null,
      repositorio: "https://github.com/luizfms/personal-site",
      pessoas: ["Luiz (você)"],
      wlabels: [],
      skills: [],
      observacoes: "",
      relatedIssueIds: [],
      files: [],
      links: [],
      decisoes: [],
      stakeholderUpdates: [],
      tasks: [
        { id: "t10", nome: "Painel admin — CRUD de projetos", status: "Em andamento", descricao: "", pessoas: ["Luiz (você)"], tempoRastreado: 25200, relatedIssueIds: [], dataInicio: "2026-08-20", dataFim: "2026-09-10", tamanho: "L", labels: [] },
        { id: "t11", nome: "Portal do cliente — login", status: "Backlog", descricao: "", pessoas: [], tempoRastreado: 0, relatedIssueIds: [], dataInicio: "2026-09-11", dataFim: "2026-09-18", tamanho: "M", labels: [] },
      ],
    },
  ];

  for (const d of demandas) {
    await prisma.demanda.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        nome: d.nome,
        frenteId: frenteByKey[d.frente],
        statusId: demandStatusByName[d.status],
        dataInicio: d.dataInicio,
        dataFim: d.dataFim,
        repositorio: d.repositorio,
        observacoes: d.observacoes,
        skills: d.skills,
        pessoas: { connect: connectPessoas(d.pessoas) },
        wlabels: { connect: connectWLabels(d.wlabels) },
        issuesLigadas: { create: d.relatedIssueIds.map((issueId) => ({ issueId })) },
        arquivos: { create: d.files.map((f) => ({ nome: f.nome })) },
        links: { create: d.links.map((l) => ({ nome: l.nome, url: l.url })) },
        decisoes: { create: d.decisoes.map((dec) => ({ texto: dec.texto, autor: dec.autor })) },
        stakeholderUpdates: { create: d.stakeholderUpdates.map((s) => ({ pessoaNome: s.pessoaNome, ultimoEnvio: s.ultimoEnvio })) },
        tarefas: {
          create: d.tasks.map((t) => ({
            id: t.id,
            nome: t.nome,
            statusId: taskStatusByName[t.status],
            descricao: t.descricao,
            tamanho: t.tamanho,
            dataInicio: t.dataInicio,
            dataFim: t.dataFim,
            tempoRastreado: t.tempoRastreado,
            pessoas: { connect: connectPessoas(t.pessoas) },
            issuesLigadas: { create: t.relatedIssueIds.map((issueId) => ({ issueId })) },
            arquivos: { create: (t.files || []).map((f) => ({ nome: f.nome })) },
            links: { create: (t.links || []).map((l) => ({ nome: l.nome, url: l.url })) },
          })),
        },
      },
    });
  }

  // task labels reusam os mesmos W.Labels cadastrados (Design/Funcionalidade não existem ainda como wlabel — cria se faltar)
  const extraLabelNames = Array.from(
    new Set(demandas.flatMap((d) => d.tasks.flatMap((t) => t.labels || [])))
  );
  const wlabelByNome: Record<string, string> = {};
  for (const w of await prisma.wLabel.findMany()) wlabelByNome[w.nome] = w.id;
  for (const [i, nome] of extraLabelNames.entries()) {
    if (wlabelByNome[nome]) continue;
    const created = await prisma.wLabel.create({
      data: { nome, cor: "#9a94a3", ordem: 100 + i },
    });
    wlabelByNome[nome] = created.id;
  }
  for (const d of demandas) {
    for (const t of d.tasks) {
      if (!t.labels || t.labels.length === 0) continue;
      await prisma.tarefa.update({
        where: { id: t.id },
        data: { labels: { connect: t.labels.map((n) => ({ id: wlabelByNome[n] })) } },
      });
    }
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
