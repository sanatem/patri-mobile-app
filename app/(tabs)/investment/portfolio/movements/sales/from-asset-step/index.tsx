import React from 'react';
import { View, Text } from 'react-native';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { Container } from '@/components/ui/Container';
import Colors from '@/constants/Colors';

interface FromAssetStepProps {
  activo: string | undefined;
  setActivo: (v: string) => void;
  destino: string | undefined;
  cuenta: string | undefined;
  setCuenta: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
  mockActivos: { label: string; value: string }[];
  mockCuentas: { label: string; value: string }[];
}

export default function FromAssetStep({ activo, setActivo, destino, cuenta, setCuenta, onNext, onPrev, mockActivos, mockCuentas }: FromAssetStepProps) {
  return (
    <Container variant="secondaryPage" className="px-3">
      <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>¿De <Text className="font-semibold">qué activo</Text> quieres vender cuotas?</Text>
      <Select options={mockActivos} value={activo} onSelect={setActivo} placeholder="Selecciona un activo" />
      {destino === 'cuenta-bancaria' && (
        <>
          <Text className="text-base font-regular mb-2" style={{ color: Colors.primary[500] }}>¿En <Text className="font-semibold">qué cuenta bancaria</Text> quieres recibir el dinero?</Text>
          <Select options={mockCuentas} value={cuenta} onSelect={setCuenta} placeholder="Selecciona cuenta bancaria" />
        </>
      )}
    </Container>
  );
} 