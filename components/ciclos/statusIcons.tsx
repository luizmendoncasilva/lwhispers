import {
  EllipsisHorizontalCircleIcon,
  MinusCircleIcon,
  Bars3BottomLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { IssueStatus } from "@/lib/types";

export const STATUS_ICONS: Record<IssueStatus, React.ComponentType<{ width?: number; height?: number }>> = {
  triage: EllipsisHorizontalCircleIcon,
  pendente: MinusCircleIcon,
  refinado: Bars3BottomLeftIcon,
  em_andamento: ArrowPathIcon,
  concluido: CheckCircleIcon,
  cancelado: XCircleIcon,
};
