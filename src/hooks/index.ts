import axios from 'axios';
import { useAsyncFn, useSessionStorage } from 'react-use';

export function useMe() {
  const [user, setUser] = useSessionStorage('user', null);
  const [{ loading }, getUser] = useAsyncFn(async () => {
    try {
      const response = await axios.get('/api/user/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      return null;
    }
  }, []);

  const [, signOut] = useAsyncFn(async () => {
    const response = await axios.post('/api/auth/signout');
    setUser(null);
    return response.data;
  }, []);

  return {
    user,
    loading,
    getUser,
    signOut,
  };
}
