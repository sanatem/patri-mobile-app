import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Settings, 
  HelpCircle, 
  FileText, 
  Shield, 
  Bell, 
  CreditCard, 
  PieChart,
  ChevronRight,
  ArrowLeft 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function MoreScreen() {
  const router = useRouter();

  const menuItems = [
    {
      id: '1',
      title: 'Configuración',
      subtitle: 'Ajustes de la aplicación',
      icon: Settings,
      onPress: () => console.log('Configuración'),
    },
    {
      id: '2',
      title: 'Notificaciones',
      subtitle: 'Gestionar alertas y recordatorios',
      icon: Bell,
      onPress: () => console.log('Notificaciones'),
    },
    {
      id: '3',
      title: 'Mis Tarjetas',
      subtitle: 'Administrar tarjetas vinculadas',
      icon: CreditCard,
      onPress: () => console.log('Tarjetas'),
    },
    {
      id: '4',
      title: 'Reportes',
      subtitle: 'Generar informes financieros',
      icon: PieChart,
      onPress: () => console.log('Reportes'),
    },
    {
      id: '5',
      title: 'Términos y Condiciones',
      subtitle: 'Políticas de uso',
      icon: FileText,
      onPress: () => console.log('Términos'),
    },
    {
      id: '6',
      title: 'Privacidad y Seguridad',
      subtitle: 'Configuración de privacidad',
      icon: Shield,
      onPress: () => console.log('Privacidad'),
    },
    {
      id: '7',
      title: 'Ayuda y Soporte',
      subtitle: 'Centro de ayuda y contacto',
      icon: HelpCircle,
      onPress: () => console.log('Ayuda'),
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <item.icon size={22} color={Colors.primary[500]} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={Colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Configuración</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Configuración y herramientas adicionales</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map(renderMenuItem)}
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: 'white',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 40, // Alineado con el título
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
}); 