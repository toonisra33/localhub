import { useState, useEffect, useMemo, useCallback } from 'react';

export interface ThaiAddress {
  district: string; // Tambon / Sub-district
  amphoe: string; // District
  province: string;
  zipcode: number;
}

export function useThaiAddress() {
  const [data, setData] = useState<ThaiAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch Thai address data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const provinces = useMemo(() => {
    const unique = new Set(data.map(item => item.province));
    return Array.from(unique).sort();
  }, [data]);

  const getAmphoes = useCallback((province: string) => {
    const unique = new Set(data.filter(item => item.province === province).map(item => item.amphoe));
    return Array.from(unique).sort();
  }, [data]);

  const getTambons = useCallback((province: string, amphoe: string) => {
    const unique = new Set(
      data
        .filter(item => item.province === province && item.amphoe === amphoe)
        .map(item => item.district)
    );
    return Array.from(unique).sort();
  }, [data]);

  const getZipcode = useCallback((province: string, amphoe: string, tambon: string) => {
    const match = data.find(item => item.province === province && item.amphoe === amphoe && item.district === tambon);
    return match ? match.zipcode.toString() : '';
  }, [data]);

  return {
    isLoading,
    provinces,
    getAmphoes,
    getTambons,
    getZipcode
  };
}
