import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  activeModal: string | null;
  setActiveModal: React.Dispatch<React.SetStateAction<string | null>>;
  showMessage: string;
  setShowMessage: React.Dispatch<React.SetStateAction<string>>;
  isPETMember: boolean;
  setIsPETMember: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<string>("");
  const [isPETMember, setIsPETMember] = useState<boolean>(false);

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        setActiveModal,
        showMessage,
        setShowMessage,
        isPETMember,
        setIsPETMember,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};