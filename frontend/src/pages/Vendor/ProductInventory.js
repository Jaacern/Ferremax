import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, Typography, Paper, TextField, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, 
  Alert, IconButton, Chip, InputAdornment,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Search, Visibility, Warning
} from '@mui/icons-material';
import api from '../../services/api';
import StockAlert from '../../components/common/StockAlert';

const ProductInventory = () => {
  const { user } = useSelector(state => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para filtros y paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out'
  const [branchFilter, setBranchFilter] = useState(''); // ID de la sucursal del vendedor
  const [branches, setBranches] = useState([]);
  
  // Categorías disponibles (desde el enum del backend)
  const productCategories = [
    { value: 'MANUAL_TOOLS', label: 'Herramientas Manuales' },
    { value: 'POWER_TOOLS', label: 'Herramientas Eléctricas' },
    { value: 'CONSTRUCTION_MATERIALS', label: 'Materiales de Construcción' },
    { value: 'FINISHES', label: 'Acabados' },
    { value: 'SAFETY_EQUIPMENT', label: 'Equipos de Seguridad' },
    { value: 'FASTENERS', label: 'Tornillos y Anclajes' },
    { value: 'ADHESIVES', label: 'Fijaciones y Adhesivos' },
    { value: 'MEASURING_TOOLS', label: 'Equipos de Medición' }
  ];

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (branchFilter) {
      fetchProducts();
    }
  }, [page, rowsPerPage, categoryFilter, stockFilter, branchFilter]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/products/branches');
      setBranches(response.data.branches);
      
      // Configurar la primera sucursal como predeterminada o usar una asociada al vendedor
      // En una implementación real, obtendríamos la sucursal asignada al vendedor desde el usuario
      if (response.data.branches.length > 0) {
        setBranchFilter(response.data.branches[0].id);
      }
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setError('No se pudieron cargar las sucursales');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // En un caso real, consultaríamos los productos con su stock en la sucursal del vendedor
      // Construir parámetros para la consulta
      let endpoint = `/stock?branch_id=${branchFilter}`;
      
      if (stockFilter === 'low') {
        endpoint += '&low_stock=true';
      } else if (stockFilter === 'out') {
        endpoint += '&out_of_stock=true';
      }
      
      if (categoryFilter) {
        endpoint += `&category=${categoryFilter}`;
      }
      
      if (searchTerm) {
        endpoint += `&search=${searchTerm}`;
      }
      
      const response = await api.get(endpoint);
      setProducts(response.data.stocks);
      
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Formatear precio en pesos chilenos
  const formatCurrency = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Renderizar chip de estado de stock
  const renderStockStatus = (stock) => {
    if (stock.quantity <= 0) {
      return <Chip label="Sin stock" color="error" size="small" />;
    } else if (stock.is_low_stock) {
      return <Chip label="Stock bajo" color="warning" size="small" />;
    } else {
      return <Chip label="Disponible" color="success" size="small" />;
    }
  };

  if (!user || user.role !== 'vendor') {
    return (
      <Box p={3}>
        <Alert severity="error">
          No tiene permisos para acceder a esta página
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom component="h1">
        Inventario de Productos
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filtros */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sucursal</InputLabel>
            <Select
              value={branchFilter}
              label="Sucursal"
              onChange={(e) => setBranchFilter(e.target.value)}
              size="small"
            >
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoryFilter}
              label="Categoría"
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">Todas</MenuItem>
              {productCategories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Stock</InputLabel>
            <Select
              value={stockFilter}
              label="Stock"
              onChange={(e) => setStockFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="low">Stock bajo</MenuItem>
              <MenuItem value="out">Sin stock</MenuItem>
            </Select>
          </FormControl>
          
          <form onSubmit={handleSearch} style={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              label="Buscar productos"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" edge="end">
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Box>
      </Paper>
      
      {/* Tabla de productos */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.sku || '-'}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.product?.category || '-'}</TableCell>
                    <TableCell>{item.product ? formatCurrency(item.product.current_price || item.product.price) : '-'}</TableCell>
                    <TableCell align="center">
                      {item.quantity}
                      {item.is_low_stock && (
                        <Warning color="warning" sx={{ ml: 1, verticalAlign: 'middle' }} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {renderStockStatus(item)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Alertas de stock */}
      {products.filter(item => item.is_low_stock).length > 0 && (
        <Box mt={3}>
          <Alert severity="warning">
            <Typography variant="subtitle2" gutterBottom>
              Productos con stock bajo:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              {products
                .filter(item => item.is_low_stock)
                .slice(0, 5)
                .map(item => (
                  <li key={`alert-${item.id}`}>
                    {item.product_name} - {item.quantity} unidades disponibles
                  </li>
                ))}
              {products.filter(item => item.is_low_stock).length > 5 && (
                <li>Y {products.filter(item => item.is_low_stock).length - 5} más...</li>
              )}
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Contacte a bodega para solicitar reposición.
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default ProductInventory;