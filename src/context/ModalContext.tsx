// src/context/ModalContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  openLoginModal: () => void;
  openMembershipModal: () => void;
  isLoginModalOpen: boolean;
  isMembershipModalOpen: boolean;
  closeModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsMembershipModalOpen(false);
  };

  const openMembershipModal = () => {
    setIsMembershipModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsMembershipModalOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{ openLoginModal, openMembershipModal, isLoginModalOpen, isMembershipModalOpen, closeModals }}
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