-- CreateTable
CREATE TABLE "Frente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Frente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WLabel" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusTarefa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StatusTarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusDemanda" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StatusDemanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demanda" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "frenteId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "dataInicio" TEXT NOT NULL,
    "dataFim" TEXT,
    "repositorio" TEXT,
    "observacoes" TEXT DEFAULT '',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandaDependencia" (
    "id" TEXT NOT NULL,
    "demandaId" TEXT NOT NULL,
    "bloqueiaId" TEXT NOT NULL,

    CONSTRAINT "DemandaDependencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandaDecisao" (
    "id" TEXT NOT NULL,
    "demandaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandaDecisao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandaStakeholderUpdate" (
    "id" TEXT NOT NULL,
    "demandaId" TEXT NOT NULL,
    "pessoaNome" TEXT NOT NULL,
    "ultimoEnvio" TEXT NOT NULL,

    CONSTRAINT "DemandaStakeholderUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "demandaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT DEFAULT '',
    "statusId" TEXT NOT NULL,
    "tamanho" TEXT NOT NULL DEFAULT 'S',
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "tempoRastreado" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtarefa" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Subtarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atividade" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "subtarefaId" TEXT,
    "autor" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT,
    "demandaId" TEXT,
    "tarefaId" TEXT,

    CONSTRAINT "Arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "demandaId" TEXT,
    "tarefaId" TEXT,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueLigada" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "demandaId" TEXT,
    "tarefaId" TEXT,

    CONSTRAINT "IssueLigada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueCache" (
    "issueId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "dadosJson" JSONB NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueCache_pkey" PRIMARY KEY ("issueId")
);

-- CreateTable
CREATE TABLE "CycleCache" (
    "cycleId" TEXT NOT NULL,
    "dadosJson" JSONB NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CycleCache_pkey" PRIMARY KEY ("cycleId")
);

-- CreateTable
CREATE TABLE "_PessoaToTarefa" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PessoaToTarefa_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DemandaToPessoa" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DemandaToPessoa_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DemandaToWLabel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DemandaToWLabel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TarefaToWLabel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TarefaToWLabel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Demanda_frenteId_idx" ON "Demanda"("frenteId");

-- CreateIndex
CREATE INDEX "Demanda_statusId_idx" ON "Demanda"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "DemandaDependencia_demandaId_bloqueiaId_key" ON "DemandaDependencia"("demandaId", "bloqueiaId");

-- CreateIndex
CREATE INDEX "DemandaDecisao_demandaId_idx" ON "DemandaDecisao"("demandaId");

-- CreateIndex
CREATE UNIQUE INDEX "DemandaStakeholderUpdate_demandaId_pessoaNome_key" ON "DemandaStakeholderUpdate"("demandaId", "pessoaNome");

-- CreateIndex
CREATE INDEX "Tarefa_demandaId_idx" ON "Tarefa"("demandaId");

-- CreateIndex
CREATE INDEX "Tarefa_statusId_idx" ON "Tarefa"("statusId");

-- CreateIndex
CREATE INDEX "Subtarefa_tarefaId_idx" ON "Subtarefa"("tarefaId");

-- CreateIndex
CREATE INDEX "Atividade_tarefaId_idx" ON "Atividade"("tarefaId");

-- CreateIndex
CREATE INDEX "_PessoaToTarefa_B_index" ON "_PessoaToTarefa"("B");

-- CreateIndex
CREATE INDEX "_DemandaToPessoa_B_index" ON "_DemandaToPessoa"("B");

-- CreateIndex
CREATE INDEX "_DemandaToWLabel_B_index" ON "_DemandaToWLabel"("B");

-- CreateIndex
CREATE INDEX "_TarefaToWLabel_B_index" ON "_TarefaToWLabel"("B");

-- AddForeignKey
ALTER TABLE "Demanda" ADD CONSTRAINT "Demanda_frenteId_fkey" FOREIGN KEY ("frenteId") REFERENCES "Frente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demanda" ADD CONSTRAINT "Demanda_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "StatusDemanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandaDependencia" ADD CONSTRAINT "DemandaDependencia_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandaDependencia" ADD CONSTRAINT "DemandaDependencia_bloqueiaId_fkey" FOREIGN KEY ("bloqueiaId") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandaDecisao" ADD CONSTRAINT "DemandaDecisao_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandaStakeholderUpdate" ADD CONSTRAINT "DemandaStakeholderUpdate_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "StatusTarefa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtarefa" ADD CONSTRAINT "Subtarefa_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_subtarefaId_fkey" FOREIGN KEY ("subtarefaId") REFERENCES "Subtarefa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLigada" ADD CONSTRAINT "IssueLigada_demandaId_fkey" FOREIGN KEY ("demandaId") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLigada" ADD CONSTRAINT "IssueLigada_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PessoaToTarefa" ADD CONSTRAINT "_PessoaToTarefa_A_fkey" FOREIGN KEY ("A") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PessoaToTarefa" ADD CONSTRAINT "_PessoaToTarefa_B_fkey" FOREIGN KEY ("B") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DemandaToPessoa" ADD CONSTRAINT "_DemandaToPessoa_A_fkey" FOREIGN KEY ("A") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DemandaToPessoa" ADD CONSTRAINT "_DemandaToPessoa_B_fkey" FOREIGN KEY ("B") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DemandaToWLabel" ADD CONSTRAINT "_DemandaToWLabel_A_fkey" FOREIGN KEY ("A") REFERENCES "Demanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DemandaToWLabel" ADD CONSTRAINT "_DemandaToWLabel_B_fkey" FOREIGN KEY ("B") REFERENCES "WLabel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TarefaToWLabel" ADD CONSTRAINT "_TarefaToWLabel_A_fkey" FOREIGN KEY ("A") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TarefaToWLabel" ADD CONSTRAINT "_TarefaToWLabel_B_fkey" FOREIGN KEY ("B") REFERENCES "WLabel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
