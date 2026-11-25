import { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router';
import { useAuth } from '../hooks/useAuth';
import type { Task, TaskPriority } from '../models/task.interface';
import {
  getHttpErrorMessage,
  isAbortError,
  isHttpError,
} from '../services/http.service';
import {
  deleteTask,
  getTaskById,
} from '../services/task.api.service';
import { formatTaskDate } from '../utils/date';
import { NotFoundPage } from './NotFoundPage';

type DetailStatus =
  | 'loading'
  | 'success'
  | 'not-found'
  | 'error';

// Resultado de la última consulta terminada, identificado por su key.
interface SettledDetail {
  key: string;
  task: Task | null;
  notFound: boolean;
  errorMessage: string;
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const canDelete = user?.role === 'admin';

  const [settled, setSettled] =
    useState<SettledDetail | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const requestKey = `${taskId ?? ''}:${reloadKey}`;

  useEffect(() => {
    if (!taskId || !accessToken) {
      return;
    }

    const controller = new AbortController();

    getTaskById(taskId, accessToken, controller.signal)
      .then((response) => {
        setSettled({
          key: requestKey,
          task: response.data,
          notFound: false,
          errorMessage: '',
        });
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }

        // 404: no existe. 400: el id no tiene formato de ObjectId.
        const notFound =
          isHttpError(error) &&
          (error.status === 404 || error.code === 'INVALID_ID');

        setSettled({
          key: requestKey,
          task: null,
          notFound,
          errorMessage: getHttpErrorMessage(error),
        });
      });

    return () => {
      controller.abort();
    };
  }, [taskId, accessToken, requestKey]);

  const isCurrent = settled?.key === requestKey;
  const task = isCurrent && settled ? settled.task : null;

  let status: DetailStatus = 'loading';

  if (!taskId) {
    status = 'not-found';
  } else if (!accessToken) {
    status = 'error';
  } else if (isCurrent && settled) {
    if (settled.task) {
      status = 'success';
    } else {
      status = settled.notFound ? 'not-found' : 'error';
    }
  }

  async function handleDelete(): Promise<void> {
    if (!task || !accessToken || !canDelete) {
      return;
    }

    const shouldDelete = window.confirm(
      `¿Eliminar la tarea "${task.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteTask(task.id, accessToken);
      navigate('/tasks', { replace: true });
    } catch (error) {
      setDeleteError(getHttpErrorMessage(error));
      setIsDeleting(false);
    }
  }

  if (status === 'loading') {
    return <p role="status">Consultando tarea...</p>;
  }

  if (status === 'not-found') {
    return (
      <NotFoundPage
        title="Tarea no encontrada"
        message="La tarea no existe o fue eliminada."
      />
    );
  }

  if (status === 'error' || !task) {
    return (
      <section className="panel" role="alert">
        <h2>No fue posible consultar la tarea</h2>
        <p>
          {settled?.errorMessage || 'La sesión no está disponible.'}
        </p>
        <div className="task-detail__actions">
          <button
            type="button"
            onClick={() =>
              setReloadKey((current) => current + 1)
            }
          >
            Reintentar
          </button>
          <Link
            className="button-link button-link--secondary"
            to="/tasks"
          >
            Volver a tareas
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article
      className="panel task-detail"
      aria-labelledby="task-detail-title"
    >
      <p className="section-heading__eyebrow">Detalle protegido</p>
      <h2 id="task-detail-title">{task.title}</h2>
      <dl className="task-detail__grid">
        <div>
          <dt>Identificador</dt>
          <dd>{task.id}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            {task.status === 'completed'
              ? 'Completada'
              : 'Pendiente'}
          </dd>
        </div>
        <div>
          <dt>Prioridad</dt>
          <dd>{PRIORITY_LABELS[task.priority] ?? task.priority}</dd>
        </div>
        <div>
          <dt>Fecha de creación</dt>
          <dd>
            <time dateTime={task.createdAt}>
              {formatTaskDate(task.createdAt)}
            </time>
          </dd>
        </div>
        <div>
          <dt>Última actualización</dt>
          <dd>
            <time dateTime={task.updatedAt}>
              {formatTaskDate(task.updatedAt)}
            </time>
          </dd>
        </div>
      </dl>
      {!canDelete && (
        <p className="permission-note">
          La eliminación requiere el rol admin.
        </p>
      )}
      {deleteError && (
        <p
          className="operation-message operation-message--error"
          role="alert"
        >
          {deleteError}
        </p>
      )}
      <div className="task-detail__actions">
        <Link
          className="button-link button-link--secondary"
          to="/tasks"
        >
          Volver a tareas
        </Link>
        {canDelete && (
          <button
            type="button"
            className="button-danger"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar tarea'}
          </button>
        )}
      </div>
    </article>
  );
}
