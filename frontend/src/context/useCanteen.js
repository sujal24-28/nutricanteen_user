import { createContext, useContext } from 'react';

export const CanteenContext = createContext(null);

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};

export default useCanteen;
