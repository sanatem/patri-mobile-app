import React from 'react';
import {
  ChartBar as BarChart,
  ChartPie as PieChart,
  Users,
  Sparkles,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react-native';

type IconName =
  | 'bar-chart'
  | 'pie-chart'
  | 'users'
  | 'sparkles'
  | 'dollar'
  | 'more';

interface TabBarIconProps {
  name: IconName;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size }) => {
  switch (name) {
    case 'bar-chart':
      return <BarChart size={size} color={color} />;
    case 'pie-chart':
      return <PieChart size={size} color={color} />;
    case 'users':
      return <Users size={size} color={color} />;
    case 'dollar':
      return <DollarSign size={size} color={color} />;
    case 'sparkles':
      return <Sparkles size={size} color={color} />;
    case 'more':
      return <MoreHorizontal size={size} color={color} />;
    default:
      return null;
  }
};

export default TabBarIcon;
