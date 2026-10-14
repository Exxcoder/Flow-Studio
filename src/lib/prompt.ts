import { successors, topologicalOrder } from "./graph";
import { STATUS_LABEL, type Connection, type FlowNode } from "../types";

export function buildLlmPrompt(
  projectName: string,
  nodes: FlowNode[],
  connections: Connection[],
): string {
  const ordered = topologicalOrder(nodes, connections);
  const steps = ordered
    .map((node) => {
      const next = successors(node.id, connections, nodes);
      const nextLabel =
        next.length === 0
          ? "нет (терминальный этап)"
          : next.map((n) => `Шаг ${n.number}`).join(", ");
      const checks =
        node.checklist.length === 0
          ? "    —"
          : node.checklist
              .map((item) => `    - [${item.done ? "x" : " "}] ${item.text}`)
              .join("\n");
      const desc = node.description.trim() || "—";
      return `- Шаг ${node.number}: [${node.title}] (Статус: ${STATUS_LABEL[node.status]})
  - Описание: ${desc}
  - Чек-лист:
${checks}
  - Переходит в: -> ${nextLabel}`;
    })
    .join("\n");

  return `# АРХИТЕКТУРА И ПЛАН ПРОЕКТА
Проект: ${projectName}

## Пошаговый пайплайн реализации:
${steps || "- (граф пуст — добавьте этапы на холст)"}

## Граф зависимостей:
Всего этапов: ${nodes.length}. Связей: ${connections.length}.
Порядок получен топологическим обходом (от истоков к стокам).

## Инструкция для LLM:
"Используй данный граф зависимостей и контекст для написания кода/генерации документации. Сохраняй нумерацию шагов, уважай направленные связи A -> B как логические зависимости, не начинай завершённые этапы заново, приоритезируй статусы «В процессе», затем «В очереди». Если чек-лист не пуст — превращай пункты в конкретные задачи реализации."
`;
}
