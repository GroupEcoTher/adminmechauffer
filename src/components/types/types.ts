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
    number: number;
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
