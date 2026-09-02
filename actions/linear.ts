"use server";

import { revalidatePath } from "next/cache";
import { syncActiveData, updateLinearIssue, addLinearComment, type IssuePatch } from "@/lib/linear";

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/ciclos");
  revalidatePath("/demandas");
  revalidatePath("/tarefas");
}

export async function syncLinearNow() {
  const result = await syncActiveData();
  revalidateAll();
  return result;
}

export async function updateIssueAction(issueId: string, patch: IssuePatch) {
  const issue = await updateLinearIssue(issueId, patch);
  revalidateAll();
  return issue;
}

export async function addIssueCommentAction(issueId: string, body: string, author: string) {
  const issue = await addLinearComment(issueId, body, author);
  revalidateAll();
  return issue;
}
