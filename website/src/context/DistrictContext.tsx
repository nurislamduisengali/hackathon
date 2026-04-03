import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface DistrictContextType {
  district: string;
  setDistrict: (d: string) => void;
  loading: boolean;
}

const DistrictContext = createContext<DistrictContextType>({
  district: "Весь город",
  setDistrict: () => {},
  loading: false,
});

export function DistrictProvider({ children }: { children: ReactNode }) {
  const [district, setDistrictState] = useState("Весь город");
  const [loading, setLoading] = useState(false);

  const setDistrict = useCallback((d: string) => {
    setLoading(true);
    setDistrictState(d);
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <DistrictContext.Provider value={{ district, setDistrict, loading }}>
      {children}
    </DistrictContext.Provider>
  );
}

export const useDistrict = () => useContext(DistrictContext);
