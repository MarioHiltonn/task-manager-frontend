import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import type {
  PageMeta,
  TaskListQuery,
} from '../models/api.types';
import type { RequestStatus } from '../models/request-status.type';
import type { Task } from '../models/task.interface';
import {
  getHttpErrorMessage,
  isAbortError,
} from '../services/http.service';
import { listTasks } from '../services/task.api.service';

// Resultado de la última consulta terminada, identificado por la
// consulta que lo produjo (key). Mientras key no coincida con la
// consulta actual, la pantalla está "cargando".
interface SettledResult {
  key: string;
  tasks: Task[];
  meta: PageMeta;
  failed: boolean;
  errorMessage: string;
}

const EMPTY_META: PageMeta = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function useTaskList(
  query: TaskListQuery,
  accessToken: string | null,
) {
  const {
    page,
    limit,
    search,
    status: statusFilter,
    sortBy,
    order,
  } = query;

  const [settled, setSettled] =
    useState<SettledResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const requestKey = JSON.stringify([
    page,
    limit,
    search ?? null,
    statusFilter ?? null,
    sortBy,
    order,
    reloadKey,
  ]);

  useEffect(() => {
    // Sin sesión no se consulta la API (devolvería 401).
    if (!accessToken) {
      return;
    }

    const controller = new AbortController();

    listTasks(
      {
        page,
        limit,
        search,
        status: statusFilter,
        sortBy,
        order,
      },
      accessToken,
      controller.signal,
    )
      .then((response) => {
        setSettled({
          key: requestKey,
          tasks: response.data,
          meta: response.meta,
          failed: false,
          errorMessage: '',
        });
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }

        setSettled({
          key: requestKey,
          tasks: [],
          meta: { ...EMPTY_META, page, limit },
          failed: true,
          errorMessage: getHttpErrorMessage(error),
        });
      });

    return () => {
      controller.abort();
    };
  }, [
    accessToken,
    requestKey,
    page,
    limit,
    search,
    statusFilter,
    sortBy,
    order,
  ]);

  const isCurrent = settled?.key === requestKey;
  let status: RequestStatus = accessToken ? 'loading' : 'idle';

  if (accessToken && isCurrent && settled) {
    if (settled.failed) {
      status = 'error';
    } else {
      status = settled.tasks.length === 0 ? 'empty' : 'success';
    }
  }

  return {
    // Durante una nueva consulta se conserva el último resultado
    // para que la lista no parpadee.
    tasks: settled && !settled.failed ? settled.tasks : [],
    meta: settled?.meta ?? { ...EMPTY_META, page, limit },
    status,
    errorMessage: isCurrent && settled ? settled.errorMessage : '',
    reload,
  };
}
