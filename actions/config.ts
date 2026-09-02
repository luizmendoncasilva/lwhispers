"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { CONFIG_LISTS_TAG } from "@/lib/config-lists-data";

function revalidateConfig() {
  revalidateTag(CONFIG_LISTS_TAG, { expire: 0 });
  revalidatePath("/configuracoes");
}

async function safeDelete(action: () => Promise<unknown>, emUsoMsg: string) {
  try {
    await action();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new Error(emUsoMsg);
    }
    throw err;
  }
  revalidateConfig();
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
  await safeDelete(() => prisma.frente.delete({ where: { id } }), "Essa frente está em uso por alguma demanda — mude a frente dela antes de apagar.");
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
  await safeDelete(() => prisma.statusTarefa.delete({ where: { id } }), "Esse status está em uso por alguma tarefa — mude o status dela antes de apagar.");
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
  await safeDelete(
    () => prisma.statusDemanda.delete({ where: { id } }),
    "Esse status está em uso por alguma demanda — mude o status dela antes de apagar."
  );
}

export async function createPessoa(nome: string) {
  await prisma.pessoa.create({ data: { id: nome, nome } });
  revalidateConfig();
}
export async function deletePessoa(id: string) {
  await prisma.pessoa.delete({ where: { id } });
  revalidateConfig();
}
