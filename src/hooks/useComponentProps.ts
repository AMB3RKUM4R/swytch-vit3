// src/hooks/useComponentProps.ts
import { useMemo, Dispatch, SetStateAction } from 'react';
import { PlayerData, TopNavProps, BottomNavProps } from '@/lib/types';

interface ComponentPropsArgs {
  userId: string | null;
  playerData: PlayerData | null;
  authLoading: boolean;
  setActiveModal: Dispatch<SetStateAction<string | null>>;
  showMessage: string;
  setShowMessage: Dispatch<SetStateAction<string>>;
}

export const useComponentProps = ({
  userId,
  playerData,
  authLoading,
  setActiveModal,
  showMessage,
  setShowMessage,
}: ComponentPropsArgs) => {

  const topNavProps: TopNavProps = useMemo(() => ({
    userId,
    joulesBalance: playerData?.joules ?? 0,
    isPETMember: playerData?.isPETMember ?? false,
    setShowMessage,
    setActiveAuthModal: () => setActiveModal('auth'),
    playerData,
    authLoading,
  }), [userId, playerData, setShowMessage, setActiveModal, authLoading]);

  const bottomNavProps: BottomNavProps = useMemo(() => ({
    userId,
    joulesBalance: playerData?.joules ?? 0,
    isPETMember: playerData?.isPETMember ?? false,
    setShowMessage,
    globalMessage: showMessage,
  }), [userId, playerData, setShowMessage, showMessage]);

  return { topNavProps, bottomNavProps };
};