import {useEffect, useState, useCallback} from 'react';
import {useSelector} from 'react-redux';
import apiClient from '../services/apiClient';
import {BASE_URL, PORT, API, VERSION, V1, USER_URL} from '../utils/constans';

const cache = new Map();

const fetchUserProfile = userId => {
  const cached = cache.get(userId);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }
  const promise = apiClient
    .get(`${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}/${userId}`)
    .then(res => (res?.data?.success ? res.data.data : null))
    .catch(() => null);
  cache.set(userId, promise);
  promise.then(data => {
    cache.set(userId, data);
  });
  return promise;
};

export const useUserProfile = () => {
  const authData = useSelector(state => state.auth);
  const userId = authData?.data?.data?.id;

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setUserInfo(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    fetchUserProfile(userId)
      .then(data => {
        if (!cancelled) {
          setUserInfo(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const refresh = useCallback(() => {
    if (!userId) {
      return Promise.resolve(null);
    }
    cache.delete(userId);
    setLoading(true);
    return fetchUserProfile(userId)
      .then(data => {
        setUserInfo(data);
        return data;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  return {userInfo, loading, refresh};
};
