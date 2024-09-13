// src/components/types/types.ts

// Interface pour les actions des utilisateurs
export interface UserAction {
  actionType: string; // Type de l'action (ex: 'login', 'logout')
  timestamp: Date; // Date et heure de l'action
  userId: string; // ID de l'utilisateur qui a effectué l'action
  details?: string; // Détails supplémentaires sur l'action (optionnel)
}

export interface User {
  id: number;
  img: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  identityDocumentUrl: string;
  verified: boolean;
  name: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  [key: string]: any;
}
  
  // Interface pour les données de graphiques
  export interface ChartData {
    name: string;
    users?: number;
    products?: number;
    revenue?: number;
    visit?: number;
    profit?: number;
    ratio?: number;
  }
  
  // Interface pour les props de ChartBox
  export interface ChartBoxProps {
    title: string;
    dataKey: string;
    percentage: number;
    chartData: ChartData[];
    color: string;
    icon: string;
  }
  
  
  // Interface pour les props de BarChartBox
  export interface BarChartBoxProps {
    title: string;
    color: string;
    dataKey: string;
    chartData: ChartData[];
    
  }
  



  // Interface pour un élément de menu
  export interface ListItem {
    id: number;
    title: string;
    url: string;
    icon: string;
  }
  
  // Interface pour un item de menu
  export interface MenuItem {
    id: number;
    title: string;
    listItems: ListItem[];
  }
  
  // Interface pour les props de DataTable
  export interface DataTableProps {
    rows: User[];
    title: string;
  }
