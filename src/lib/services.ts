import axios from 'axios';

export interface SigninData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  agree: boolean;
}

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export async function signin<T>(data: SigninData): Promise<T> {
  const res = await axios.post('/api/auth/signin', data);
  return res.data;
}

export const signout = async <T>(): Promise<T> => {
  const res = await axios.post('/api/auth/signout');
  return res.data;
};

export async function registerUser<T>(data: RegisterData): Promise<T> {
  const response = await axios.post(`/api/auth/register`, data);
  return response.data;
}

export const getProject = async (id: number) => {
  const res = await axios.get(`/api/project/${id}`);
  return res.data;
};

export const updateProject = async (id: number, data) => {
  const response = await axios.put(`/api/project/${id}`, data);
  return response.data;
};

export const createProject = async (data) => {
  const response = await axios.post(`/api/project`, data);
  return response.data;
};

export async function deleteProject<T>(id: number): Promise<T> {
  const res = await axios.delete(`/api/project/${id}`);
  return res.data;
}

export const getPost = async (id: number) => {
  const res = await axios.get(`/api/post/${id}`);
  return res.data;
};

export const createPost = async (data) => {
  const res = await axios.post(`/api/post`, data);
  return res.data;
};

export const updatePost = async (id: number, data) => {
  const res = await axios.put(`/api/post/${id}`, data);
  return res.data;
};

export async function deletePost<T>(id: number): Promise<T> {
  const res = await axios.delete(`/api/post/${id}`);
  return res.data;
}

export const getCategorys = async () => {
  const res = await axios.get(`/api/category/query`);
  return res.data;
};

export async function hits(id: number) {
  const res = await axios.post('/api/post/hits', { id });
  return res.data;
}
