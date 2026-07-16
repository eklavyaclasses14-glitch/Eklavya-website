import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiFetch';

let globalDepartmentsCache = null;

export function useDepartments() {
  const [departments, setDepartments] = useState(globalDepartmentsCache || []);
  const [loading, setLoading] = useState(!globalDepartmentsCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (globalDepartmentsCache) {
      setDepartments(globalDepartmentsCache);
      setLoading(false);
      return;
    }

    apiFetch('/api/admin/departments')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch departments');
        return res.json();
      })
      .then(data => {
        globalDepartmentsCache = data;
        setDepartments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Helpers
  const getShortName = (fullName) => {
    const dept = departments.find(d => d.name === fullName);
    return dept ? dept.short_name : fullName;
  };

  const refetch = async () => {
    try {
      const res = await apiFetch('/api/admin/departments');
      if (res.ok) {
        const data = await res.json();
        globalDepartmentsCache = data;
        setDepartments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { departments, loading, error, getShortName, refetch };
}
