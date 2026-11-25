import type { Task } from '../models/task.interface';

interface TaskSummaryProps {
  tasks: Task[];
  total: number;
}

// La API no entrega totales por estado, por eso los conteos de
// pendientes y completadas corresponden solo a la página actual.
export function TaskSummary({ tasks, total }: TaskSummaryProps) {
  const pendingOnPage = tasks.filter(
    (task) => task.status === 'pending',
  ).length;
  const completedOnPage = tasks.length - pendingOnPage;

  return (
    <section
      className="summary-grid"
      aria-label="Resumen de tareas"
    >
      <article className="summary-card">
        <span>Resultados de la consulta</span>
        <strong>{total}</strong>
      </article>
      <article className="summary-card">
        <span>Pendientes (página actual)</span>
        <strong>{pendingOnPage}</strong>
      </article>
      <article className="summary-card">
        <span>Completadas (página actual)</span>
        <strong>{completedOnPage}</strong>
      </article>
    </section>
  );
}
