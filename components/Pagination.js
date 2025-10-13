import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { theme } from '../styles/theme';

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  if (pageNumbers.length <= 1) {
    return null;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.pageItem, currentPage === item && styles.activePageItem]}
      onPress={() => paginate(item)}
    >
      <Text style={[styles.pageLink, currentPage === item && styles.activePageLink]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={styles.pageItem}
        onPress={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text style={[styles.pageLink, currentPage === 1 && styles.disabledText]}>
          Previous
        </Text>
      </TouchableOpacity>

      <FlatList
        data={pageNumbers}
        renderItem={renderItem}
        keyExtractor={(item) => item.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.pageItem}
        onPress={() => paginate(currentPage + 1)}
        disabled={currentPage === pageNumbers.length}
      >
        <Text style={[styles.pageLink, currentPage === pageNumbers.length && styles.disabledText]}>
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  pageItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.solidBorder,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.white,
    marginHorizontal: 4,
  },
  activePageItem: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pageLink: {
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  activePageLink: {
    color: theme.colors.white,
  },
  disabledText: {
    color: '#cccccc',
  },
});

export default Pagination;