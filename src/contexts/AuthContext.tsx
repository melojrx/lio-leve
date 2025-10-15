// TODO: Implementar AuthContext com Supabase
// Será implementado pelo Dyad

import { createContext } from 'react';

export const AuthContext = createContext(null);
export const AuthProvider = ({ children }: any) => children;
export const useAuth = () => null;
