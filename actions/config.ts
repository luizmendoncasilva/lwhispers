"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function revalidateConfig() {
  revalidatePath("/configuracoes");
  revalidatePath("/demandas");
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

type MetaInput = { nome: string; cor: string; descricao?: string };

export async function createFrente(data: MetaInput) {
  await prisma.frente.create({ data });
  revalidateConfig();
}
export async function updateFrente(id: string, data: MetaInput) {
  await prisma.frente.update({ where: { id }, data });
  revalidateConfig();
}
export async function deleteFrente(id: string) {
  await prisma.frente.delete({ where: { id } });
  revalidateConfig();
}

export async function createWLabel(data: MetaInput) {
  await prisma.wLabel.create({ data });
  revalidateConfig();
}
export async function updateWLabel(id: string, data: MetaInput) {
  await prisma.wLabel.update({ where: { id }, data });
  revalidateConfig();
}
export async function deleteWLabel(id: string) {
  await prisma.wLabel.delete({ where: { id } });
  revalidateConfig();
}

export async function createStatusTarefa(data: MetaInput) {
  await prisma.statusTarefa.create({ data });
  revalidateConfig();
}
export async function updateStatusTarefa(id: string, data: MetaInput) {
  await prisma.statusTarefa.update({ where: { id }, data });
  revalidateConfig();
}
export async function deleteStatusTarefa(id: string) {
  await prisma.statusTarefa.delete({ where: { id } });
  revalidateConfig();
}

export async function createStatusDemanda(data: MetaInput) {
  await prisma.statusDemanda.create({ data });
  revalidateConfig();
}
export async function updateStatusDemanda(id: string, data: MetaInput) {
  await prisma.statusDemanda.update({ where: { id }, data });
  revalidateConfig();
}
export async function deleteStatusDemanda(id: string) {
  await prisma.statusDemanda.delete({ where: { id } });
  revalidateConfig();
}

export async function createPessoa(nome: string) {
  await prisma.pessoa.create({ data: { id: nome, nome } });
  revalidateConfig();
}
export async function deletePessoa(id: string) {
  await prisma.pessoa.delete({ where: { id } });
  revalidateConfig();
}
