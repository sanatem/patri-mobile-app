import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal, Pressable, Dimensions, ScrollView } from 'react-native';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { inputStyles } from '@/styles/ui/Input.styles';
import { selectStyles, SCREEN_HEIGHT } from '@/styles/ui/Select.styles';
import { Button } from './Button';
import Colors from '@/constants/Colors';

interface CalendarSelectProps {
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function CalendarSelect({
  value,
  onSelect,
  placeholder = "Selecciona una fecha",
  label,
  error,
  disabled = false,
  className,
}: CalendarSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  
  const borderAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const yearScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (value && value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const date = new Date(year, month, day);
        setSelectedDate(date);
        setCurrentDate(date);
      }
    }
  }, [value]);

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    if (showYearSelector && yearScrollViewRef.current) {
      const currentYear = new Date().getFullYear();
      const yearIndex = currentYear - 1925;
      if (yearIndex >= 0) {
        const itemHeight = 48;
        const scrollToY = yearIndex * itemHeight;
        const offsetY = Math.max(0, scrollToY - 48);
        
        setTimeout(() => {
          yearScrollViewRef.current?.scrollTo({
            y: offsetY,
            animated: false
          });
        }, 350);
      }
    }
  }, [showYearSelector]);

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isOpen]);

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#DC2626' : Colors.gray[100], Colors.secondary[500]],
  });

  const handleConfirm = () => {
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear().toString();
      const formattedDate = `${day}/${month}/${year}`;
      onSelect(formattedDate);
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const overlayStyle = [
    selectStyles.overlay,
    {
      backgroundColor: overlayAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)'],
      }),
    },
  ];

  const sheetStyle = [
    selectStyles.modalSheet,
    {
      transform: [
        {
          translateY: sheetAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [SCREEN_HEIGHT, 0],
          }),
        },
      ],
    },
  ];

  const displayValue = value || placeholder;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setShowMonthSelector(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearSelector(false);
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearArray: number[] = [];
    for (let year = 1925; year <= currentYear + 100; year++) {
      yearArray.push(year);
    }
    return yearArray;
  }, []);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return selectedDate && 
           day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };


  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const calendarDays = generateCalendarDays(currentDate);

  return (
    <View className={cn('mb-5 w-full', className)}>
      {label && (
        <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[500] }}>{label}</Text>
      )}
      <Animated.View
        style={[
          inputStyles.container,
          {
            borderColor: error ? '#DC2626' : animatedBorderColor,
            backgroundColor: disabled ? '#F3F4F6' : '#fff',
          },
        ]}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          onPress={toggleDropdown}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text
            className={cn(
              'text-base font-regular',
              disabled && 'text-gray-400'
            )}
            style={{ 
              flex: 1,
              color: disabled 
                ? Colors.gray[400] 
                : value 
                  ? Colors.primary[500] 
                  : Colors.primary[400]
            }}
          >
            {displayValue}
          </Text>
          <ChevronDown
            size={18}
            color={disabled ? '#D1D5DB' : '#6B7280'}
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={overlayStyle}>
            <Pressable style={{ flex: 1 }} onPress={() => setIsOpen(false)} />
          </Animated.View>
          <Animated.View style={sheetStyle}>
            <View style={selectStyles.dragIndicatorContainer}>
              <View style={selectStyles.dragIndicator} />
            </View>
            {label && (
              <Text className="text-base font-medium mb-4" style={{ color: Colors.primary[500] }}>{label}</Text>
            )}
            
            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 20 
              }}>
                <TouchableOpacity
                  onPress={() => setShowMonthSelector(!showMonthSelector)}
                  style={{ 
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginRight: 8
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-medium text-center" style={{ color: Colors.primary[700] }}>
                    {monthNames[currentDate.getMonth()]}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowYearSelector(!showYearSelector)}
                  style={{ 
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginLeft: 8
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-medium text-center" style={{ color: Colors.primary[700] }}>
                    {currentDate.getFullYear()}
                  </Text>
                </TouchableOpacity>
              </View>

              {showMonthSelector && (
                <View style={{
                  position: 'absolute',
                  top: 60,
                  left: 20,
                  right: 20,
                  backgroundColor: 'white',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.gray[200],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                  zIndex: 1000,
                  maxHeight: 200
                }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {monthNames.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderBottomWidth: index !== monthNames.length - 1 ? 1 : 0,
                          borderColor: Colors.gray[100],
                          backgroundColor: currentDate.getMonth() === index ? Colors.secondary[100] : 'transparent'
                        }}
                        onPress={() => handleMonthSelect(index)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className="text-base text-center"
                          style={{
                            color: currentDate.getMonth() === index ? Colors.secondary[700] : Colors.primary[700],
                            fontWeight: currentDate.getMonth() === index ? '600' : '400'
                          }}
                        >
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {showYearSelector && (
                <View style={{
                  position: 'absolute',
                  top: 60,
                  left: 20,
                  right: 20,
                  backgroundColor: 'white',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.gray[200],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                  zIndex: 1000,
                  maxHeight: 200
                }}>
                  <ScrollView 
                    ref={yearScrollViewRef}
                    showsVerticalScrollIndicator={false}
                  >
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderBottomWidth: year !== years[years.length - 1] ? 1 : 0,
                          borderColor: Colors.gray[100],
                          backgroundColor: currentDate.getFullYear() === year ? Colors.secondary[100] : 'transparent'
                        }}
                        onPress={() => handleYearSelect(year)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className="text-base text-center"
                          style={{
                            color: currentDate.getFullYear() === year ? Colors.secondary[700] : Colors.primary[700],
                            fontWeight: currentDate.getFullYear() === year ? '600' : '400'
                          }}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={{ 
                flexDirection: 'row', 
                marginBottom: 10 
              }}>
                {dayNames.map((day, index) => (
                  <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                    <Text className="text-sm font-medium" style={{ color: Colors.gray[500] }}>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap',
                marginBottom: 20
              }}>
                {calendarDays.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      width: '14.28%',
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                    onPress={() => day && handleDateSelect(day)}
                    disabled={!day}
                    activeOpacity={0.7}
                  >
                    {day && (
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isSelected(day) 
                          ? Colors.secondary[500] 
                          : isToday(day) 
                            ? Colors.secondary[100] 
                            : 'transparent',
                        borderWidth: isToday(day) ? 1 : 0,
                        borderColor: Colors.secondary[300],
                      }}>
                        <Text
                          className={cn(
                            'text-sm',
                            isSelected(day) ? 'font-medium' : 'font-regular'
                          )}
                          style={{
                            color: isSelected(day) 
                              ? 'white' 
                              : Colors.primary[700]
                          }}
                        >
                          {day}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row' }}>
                <Button
                  title="Confirmar"
                  onPress={handleConfirm}
                  disabled={!selectedDate}
                  variant="primary"
                  fullWidth
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {error && <Text className="text-sm mt-1 font-regular" style={{ color: Colors.error[500] }}>{error}</Text>}
    </View>
  );
} 