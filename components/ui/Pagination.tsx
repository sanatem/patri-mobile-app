import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 3,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    if (currentPage <= halfVisible) {
      endPage = Math.min(maxVisiblePages, totalPages);
    } else if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.navButton,
          currentPage === 1 && styles.navButtonDisabled,
        ]}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft
          size={20}
          color={currentPage === 1 ? Colors.gray[400] : Colors.primary[600]}
        />
      </TouchableOpacity>

      <View style={styles.pagesContainer}>
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <View key={`ellipsis-${index}`} style={styles.ellipsis}>
                <Text style={styles.ellipsisText}>...</Text>
              </View>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <TouchableOpacity
              key={pageNumber}
              style={[
                styles.pageButton,
                isActive && styles.pageButtonActive,
              ]}
              onPress={() => onPageChange(pageNumber)}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  isActive && styles.pageButtonTextActive,
                ]}
              >
                {pageNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.navButton,
          currentPage === totalPages && styles.navButtonDisabled,
        ]}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight
          size={20}
          color={
            currentPage === totalPages ? Colors.gray[400] : Colors.primary[600]
          }
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 6,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: Colors.gray[50],
    borderColor: Colors.gray[200],
  },
  pagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pageButton: {
    minWidth: 40,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary[600],
  },
  pageButtonTextActive: {
    color: 'white',
  },
  ellipsis: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsisText: {
    fontSize: 14,
    color: Colors.gray[500],
  },
});
