"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function revalidateAll() {
  revalidatePath("/demandas");
  revalidatePath("/dashboard");
  revalidatePath("/tarefas");
  revalidatePath("/analytics");
  revalidatePath("/aprendizados");
}

export async function listDemandasLite() {
  const rows = await prisma.demanda.findMany({ select: { id: true, nome: true }, orderBy: { createdAt: "desc" } });
  return rows.map((d) => ({ id: d.id, name: d.nome }));
}

export async function createDemanda(nome: string, frenteId: string) {
  const d = await prisma.demanda.create({
    data: { nome, frenteId, statusId: "Planejamento", dataInicio: new Date().toISOString().slice(0, 10) },
  });
  revalidateAll();
  return d.id;
}

export async function deleteDemanda(id: string) {
  await prisma.demanda.delete({ where: { id } });
  revalidateAll();
}

export async function updateDemandaCampos(
  id: string,
  patch: Partial<{ nome: string; statusId: string; dataInicio: string; dataFim: string | null; repositorio: string; observacoes: string; skills: string[] }>
) {
  await prisma.demanda.update({ where: { id }, data: patch });
  revalidateAll();
}

export async function setDemandaPessoas(id: string, nomes: string[]) {
  await prisma.demanda.update({ where: { id }, data: { pessoas: { set: nomes.map((n) => ({ id: n })) } } });
  revalidateAll();
}

export async function setDemandaWLabels(id: string, wlabelIds: string[]) {
  await prisma.demanda.update({ where: { id }, data: { wlabels: { set: wlabelIds.map((w) => ({ id: w })) } } });
  revalidateAll();
}

export async function addDemandaLink(id: string, nome: string, url: string) {
  await prisma.link.create({ data: { nome, url, demandaId: id } });
  revalidateAll();
}
export async function removeLink(linkId: string) {
  await prisma.link.delete({ where: { id: linkId } });
  revalidateAll();
}

export async function addDemandaArquivo(id: string, nome: string, url?: string) {
  await prisma.arquivo.create({ data: { nome, url, demandaId: id } });
  revalidateAll();
}
export async function removeArquivo(arquivoId: string) {
  await prisma.arquivo.delete({ where: { id: arquivoId } });
  revalidateAll();
}

export async function addDemandaDecisao(id: string, texto: string, autor: string) {
  await prisma.demandaDecisao.create({ data: { demandaId: id, texto, autor } });
  revalidateAll();
}

export async function markStakeholderUpdate(id: string, pessoaNome: string) {
  await prisma.demandaStakeholderUpdate.upsert({
    where: { demandaId_pessoaNome: { demandaId: id, pessoaNome } },
    update: { ultimoEnvio: new Date().toISOString().slice(0, 10) },
    create: { demandaId: id, pessoaNome, ultimoEnvio: new Date().toISOString().slice(0, 10) },
  });
  revalidateAll();
}

export async function setDemandaBlockedBy(id: string, bloqueiaIds: string[]) {
  await prisma.demandaDependencia.deleteMany({ where: { demandaId: id } });
  if (bloqueiaIds.length > 0) {
    await prisma.demandaDependencia.createMany({ data: bloqueiaIds.map((bloqueiaId) => ({ demandaId: id, bloqueiaId })) });
  }
  revalidateAll();
}

export async function setDemandaBlocks(id: string, demandaIds: string[]) {
  await prisma.demandaDependencia.deleteMany({ where: { bloqueiaId: id } });
  if (demandaIds.length > 0) {
    await prisma.demandaDependencia.createMany({ data: demandaIds.map((demandaId) => ({ demandaId, bloqueiaId: id })) });
  }
  revalidateAll();
}

export async function setDemandaIssuesLigadas(id: string, issueIds: string[]) {
  await prisma.issueLigada.deleteMany({ where: { demandaId: id } });
  if (issueIds.length > 0) {
    await prisma.issueLigada.createMany({ data: issueIds.map((issueId) => ({ demandaId: id, issueId })) });
  }
  revalidateAll();
}
