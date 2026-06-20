import { useState, useEffect, useRef, useCallback } from 'react';
import { getMediaJob } from '../api';

export default function useMediaJob(jobId) {
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      stopPolling();
      return undefined;
    }

    const poll = async () => {
      try {
        const data = await getMediaJob(jobId);
        setJob(data);
        setError(null);
        if (['done', 'failed'].includes(data.status)) {
          stopPolling();
        }
      } catch (err) {
        setError(err.message);
        stopPolling();
      }
    };

    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => stopPolling();
  }, [jobId, stopPolling]);

  const refetch = useCallback(async () => {
    if (!jobId) return;
    try {
      const data = await getMediaJob(jobId);
      setJob(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [jobId]);

  return {
    job,
    error,
    refetch,
    isActive: job && ['queued', 'rendering'].includes(job.status),
  };
}