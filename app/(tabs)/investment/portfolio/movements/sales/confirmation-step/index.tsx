import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui/Card';

interface ConfirmationStepProps {
  activo: string | undefined;
  mockActivos: { label: string; value: string }[];
  destino: string | undefined;
  onPrev: () => void;
  onFinish: () => void;
}

export default function ConfirmationStep({ activo, mockActivos, destino, onPrev, onFinish }: ConfirmationStepProps) {
  return (
    <Container variant="secondaryPage" className="px-3" >
      <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>Confirma que los datos sean correctos antes de finalizar la operación.</Text>
      <Card className="bg-gray-50 rounded-xl p-4 mb-4">
        <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>Origen</Text>
        <Text className="text-base font-semibold mb-2" style={{ color: Colors.primary[500] }}>{activo ? mockActivos.find(a => a.value === activo)?.label : ''}</Text>
        <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>Dinero a retirar</Text>
        <Text className="text-base font-semibold mb-2" style={{ color: Colors.primary[500] }}>$1.492.500,00 CLP</Text>
        <Text className="text-sm font-regular mb-1" style={{ color: Colors.primary[500] }}>Destino</Text>
        <Text className="text-base font-semibold mb-2" style={{ color: Colors.primary[500] }}>{destino === 'cuenta-bancaria' ? 'Mi cuenta bancaria' : 'Mi saldo en caja'}</Text>
      </Card>
      <Text className="text-xs text-gray-500 mb-4">Al presionar finalizar tu solicitud será enviada a la corredora. El dinero será enviado a tu método de pago seleccionado dos días hábiles después de ejecutada la venta de las cuotas.</Text>
    </Container>
  );
} 