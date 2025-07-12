'use client'
import { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, IconButton, Tooltip, Typography, Chip,
  CircularProgress, Alert, TextField, InputAdornment, Button, MenuItem,
  Stack, FormControl, InputLabel, Select, Badge, Grid, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InventoryIcon from '@mui/icons-material/Inventory';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, alpha } from '@mui/material/styles';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { AddInventoryModal } from './AddInventoryModal';
import { EditInventoryModal } from './EditInventoryModal';

const BRAND_COLOR = '#FF90B3';

interface Product {
  name: string;
  sku: string;
  price: number;
  min_stock: number;
  category?: string;
}

interface InventoryItem {
  id: string;
  quantity: number;
  product: Product;
  min_stock: number;
}

interface RawInventoryData {
  id: string;
  quantity: number;
  min_stock: number;
  product: {
    name: string;
    sku: string;
    price: number;
    category: string;
  } | {
    name: string;
    sku: string;
    price: number;
    category: string;
  }[]; // Permite que product sea un objeto o un array
}

interface Props {
  userId?: string;
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
}

interface Filters {
  search: string;
  category: string;
  stockStatus: string;
}

export function InventoryTable({ userId, addOpen, setAddOpen }: Props) {
  const theme = useTheme();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    stockStatus: ''
  });
  const [categories, setCategories] = useState<string[]>([]);

  const fetchInventory = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          min_stock,
          product:products (
            name,
            sku,
            price,
            category
          )
        `)
        .eq('user_id', session.user.id)
        .order('id');

      if (error) throw error;

      const formattedData: InventoryItem[] = data.map(item => {
        // Verificar si product es un array o un objeto único
        const productData = Array.isArray(item.product) ? item.product[0] : item.product;
        
        return {
          id: item.id,
          quantity: item.quantity,
          min_stock: item.min_stock,
          product: {
            name: productData.name,
            sku: productData.sku,
            price: productData.price,
            min_stock: item.min_stock,
            category: productData.category
          }
        };
      });

      setInventory(formattedData);
      setFilteredInventory(formattedData);
      
      // Extraer categorías únicas para los filtros
      const uniqueCategories = Array.from(
        new Set(formattedData.map(item => item.product.category).filter(Boolean))
      ) as string[];
      
      setCategories(uniqueCategories.sort());
      
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [session]);
  
  // Aplicar filtros cuando cambien
  useEffect(() => {
    let result = [...inventory];
    
    // Filtrar por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        item => 
          item.product.name.toLowerCase().includes(searchTerm) || 
          item.product.sku.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtrar por categoría
    if (filters.category) {
      result = result.filter(item => item.product.category === filters.category);
    }
    
    // Filtrar por estado de stock
    if (filters.stockStatus === 'low') {
      result = result.filter(item => item.quantity <= item.min_stock);
    } else if (filters.stockStatus === 'normal') {
      result = result.filter(item => item.quantity > item.min_stock);
    } else if (filters.stockStatus === 'empty') {
      result = result.filter(item => item.quantity === 0);
    }
    
    setFilteredInventory(result);
    setPage(0); // Resetear a primera página al filtrar
  }, [filters, inventory]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      stockStatus: ''
    });
  };
  
  const handleExport = () => {
    // Determinar qué datos exportar (filtrados o todos)
    const dataToExport = filteredInventory.length > 0 ? filteredInventory : inventory;
    
    // Crear encabezados para CSV
    const headers = ['SKU', 'Producto', 'Categoría', 'Precio', 'Stock Actual', 'Stock Mínimo', 'Estado'];
    
    // Formatear datos para CSV
    const csvData = [
      headers.join(','),
      ...dataToExport.map(item => [
        item.product.sku,
        `"${item.product.name}"`, // Usar comillas para manejar comas en nombres
        `"${item.product.category || ''}"`,
        item.product.price,
        item.quantity,
        item.min_stock,
        item.quantity <= item.min_stock ? 'Stock Bajo' : 'En Stock'
      ].join(','))
    ].join('\n');
    
    // Crear archivo y descargar
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Estadísticas para el panel superior
  const inventoryStats = useMemo(() => {
    if (!inventory.length) return { total: 0, lowStock: 0, totalValue: 0 };
    
    return {
      total: inventory.length,
      lowStock: inventory.filter(item => item.quantity <= item.min_stock).length,
      totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.product.price), 0)
    };
  }, [inventory]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200 
      }}>
        <CircularProgress sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Agregar esta línea después de las importaciones
  const MotionTableRow = motion(TableRow);

  return (
    <>
      {/* Resumen del inventario */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper 
          elevation={0}
          sx={{ 
            flex: 1, 
            minWidth: 180,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(BRAND_COLOR, 0.1)
              : alpha(BRAND_COLOR, 0.05),
            borderRadius: 2
          }}
        >
          <InventoryIcon sx={{ color: BRAND_COLOR }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Productos
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {inventoryStats.total}
            </Typography>
          </Box>
        </Paper>
        
        <Paper 
          elevation={0}
          sx={{ 
            flex: 1,
            minWidth: 180,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.warning.main, 0.1)
              : alpha(theme.palette.warning.main, 0.05),
            borderRadius: 2
          }}
        >
          <Badge
            badgeContent={inventoryStats.lowStock}
            color="warning"
          >
            <WarningIcon sx={{ color: theme.palette.warning.main }} />
          </Badge>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Stock Crítico
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
              {inventoryStats.lowStock} productos
            </Typography>
          </Box>
        </Paper>
        
        <Paper 
          elevation={0}
          sx={{ 
            flex: 1, 
            minWidth: 180,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.success.main, 0.1)
              : alpha(theme.palette.success.main, 0.05),
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            color: theme.palette.success.main,
            fontSize: '1.8rem',
            fontWeight: 700,
            marginLeft: 0.5
          }}>$</Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Valor Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              ${inventoryStats.totalValue.toLocaleString()}
            </Typography>
          </Box>
        </Paper>
      </Box>
      
      {/* Filtros */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: showFilters ? 2 : 0 }}>
          <TextField
            placeholder="Buscar productos..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilters(prev => ({ ...prev, search: '' }))}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={{ 
              flexGrow: 1,
              mr: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
            size="small"
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                borderColor: BRAND_COLOR,
                color: BRAND_COLOR,
                '&:hover': {
                  borderColor: BRAND_COLOR,
                  bgcolor: `${BRAND_COLOR}10`
                }
              }}
            >
              {showFilters ? 'Ocultar filtros' : 'Filtros'}
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              Exportar
            </Button>
            
            {(filters.search || filters.category || filters.stockStatus) && (
              <Button
                variant="text"
                size="small"
                onClick={handleResetFilters}
                sx={{ color: theme.palette.text.secondary }}
              >
                Limpiar
              </Button>
            )}
          </Box>
        </Box>
        
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filters.category}
                    label="Categoría"
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <MenuItem value="">Todas las categorías</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Estado de stock</InputLabel>
                  <Select
                    value={filters.stockStatus}
                    label="Estado de stock"
                    onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="low">Stock bajo</MenuItem>
                    <MenuItem value="normal">Stock normal</MenuItem>
                    <MenuItem value="empty">Sin stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 1 }}>
                  {filteredInventory.length} producto{filteredInventory.length !== 1 ? 's' : ''} encontrado{filteredInventory.length !== 1 ? 's' : ''}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Tabla de inventario */}
      <Paper 
        elevation={0}
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white'
        }}
      >
        {filteredInventory.length > 0 ? (
          <>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      { label: "SKU", align: "left" },
                      { label: "Producto", align: "left" },
                      { label: "Categoría", align: "left" },
                      { label: "Precio", align: "right" },
                      { label: "Stock", align: "right" },
                      { label: "Estado", align: "left" },
                      { label: "Acciones", align: "right" }
                    ].map((header, index) => (
                      <TableCell 
                        key={index}
                        align={header.align as "left" | "right" | "center" | "justify" | "inherit"}
                        sx={{ 
                          fontWeight: 600, 
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                          // Fondo sólido y degradado rosado
                          bgcolor: theme.palette.mode === 'dark' 
                            ? alpha(BRAND_COLOR, 0.2)
                            : alpha(BRAND_COLOR, 0.05),
                          // Base sólida para evitar transparencias
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: '100%',
                            zIndex: -1,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(30, 30, 30, 0.95)'
                              : 'rgba(255, 255, 255, 0.95)',
                          },
                          borderBottom: `2px solid ${alpha(BRAND_COLOR, 0.4)}`,
                          color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0,0,0,0.87)',
                          paddingTop: '12px',
                          paddingBottom: '12px',
                        }}
                      >
                        {header.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredInventory
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <MotionTableRow
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          sx={{
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' 
                                ? 'rgba(255,255,255,0.05)' 
                                : 'rgba(255,144,179,0.05)'
                            },
                            borderLeft: item.quantity <= item.min_stock
                              ? `3px solid ${theme.palette.warning.main}`
                              : 'none'
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {item.product.sku}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.product.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {item.product.category || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: BRAND_COLOR,
                                fontWeight: 600 
                              }}
                            >
                              ${item.product.price.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: item.quantity <= item.min_stock 
                                    ? theme.palette.warning.main
                                    : 'inherit'
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                / {item.min_stock}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {item.quantity <= 0 ? (
                              <Chip
                                label="Sin Stock"
                                color="error"
                                size="small"
                                sx={{ 
                                  '& .MuiChip-label': { fontWeight: 500 }
                                }}
                              />
                            ) : item.quantity <= item.min_stock ? (
                              <Chip
                                icon={<WarningIcon />}
                                label="Stock Bajo"
                                color="warning"
                                size="small"
                                sx={{ 
                                  '& .MuiChip-label': { fontWeight: 500 }
                                }}
                              />
                            ) : (
                              <Chip
                                label="En Stock"
                                color="success"
                                size="small"
                                sx={{ 
                                  '& .MuiChip-label': { fontWeight: 500 }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Gestionar Stock">
                              <IconButton 
                                size="small" 
                                onClick={() => { 
                                  setSelectedItem(item); 
                                  setEditOpen(true); 
                                }}
                                sx={{
                                  color: BRAND_COLOR,
                                  '&:hover': {
                                    bgcolor: `${BRAND_COLOR}15`
                                  }
                                }}
                              >
                                <InventoryIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </MotionTableRow>
                      ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredInventory.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.02)' 
                  : 'transparent',
                '.MuiTablePagination-selectIcon': {
                  color: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.5)
                    : undefined
                }
              }}
            />
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron productos
            </Typography>
            {(filters.search || filters.category || filters.stockStatus) && (
              <Button
                variant="text"
                size="small"
                onClick={handleResetFilters}
                sx={{ 
                  mt: 1,
                  color: BRAND_COLOR,
                  '&:hover': { bgcolor: `${BRAND_COLOR}10` }
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        )}
      </Paper>
      
      {/* Modales */}
      <AddInventoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchInventory}
        userId={userId || ''}
      />
      
      <EditInventoryModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={fetchInventory}
        inventoryId={selectedItem?.id || ''}
        currentQuantity={selectedItem?.quantity || 0}
        productName={selectedItem?.product.name || ''}
      />
    </>
  );
}