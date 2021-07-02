import useSWR from 'swr';
import { fetcher } from '../lib/services';

export function useMe() {
  const { error, data, mutate } = useSWR('/api/user/me', fetcher);

  return {
    mutate,
    user: data,
    loading: !error && !data,
  };
}

export function usePost(pageNum: number, pageSize: number) {
  return useSWR(`/api/post?pageNum=${pageNum}&pageSize=${pageSize}`, fetcher);
}

export function useProject(pageNum: number, pageSize: number) {
  return useSWR(
    `/api/project?pageNum=${pageNum}&pageSize=${pageSize}`,
    fetcher
  );
}
