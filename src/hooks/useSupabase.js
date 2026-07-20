import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinations() {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name');
      
      if (!error) setDestinations(data);
      setLoading(false);
    }
    fetchDestinations();
  }, []);

  return { destinations, loading };
}

export function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      const { data, error } = await supabase
        .from('posts')
        .select('*, users(name), destinations(name)')
        .order('created_at', { ascending: false });
      
      if (!error) setPosts(data);
      setLoading(false);
    }
    fetchFeed();
  }, []);

  return { posts, loading };
}
