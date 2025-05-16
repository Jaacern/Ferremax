import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { 
  Box, Typography, Paper, TextField, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, 
  Alert, IconButton, Chip, InputAdornment,
  FormControl, InputLabel, Select, MenuItem,
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Tabs, Tab
} from '@mui/material';
import { 
  Search, Edit, Warning, Refresh,
  SwapHoriz, Add, Remove, Save
} from '@mui/icons-material';
import api from '../../services/api';

const StockManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para filtros y paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState(searchParams.get('filter') || 'all'); // 'all', 'low', 'out'
  const [branchFilter, setBranchFilter] = useState(''); // ID de la sucursal del bodeguero
  const [branches, setBranches] = useState([]);
  const [tabValue, setTabValue] = useState(searchParams.get('action') === 'transfer' ? 1 : 0);
  
  // Estado para edición de stock
  const [editMode, setEditMode] = useState(false);
  const [editingStock, setEditingStock] = useState({});
  
  // Estado para transferencia de stock
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [transferData, setTransferData] = useState({
    product_id: '',
    source_branch_id: '',
    target_branch_id: '',
    quantity: 1
  });
  
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
      fetchStock();
    }
  }, [page, rowsPerPage, categoryFilter, stockFilter, branchFilter]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/products/branches');
      setBranches(response.data.branches);
      
      // Configurar la primera sucursal como predeterminada o usar una asociada al bodeguero
      // En una implementación real, obtendríamos la sucursal asignada al bodeguero desde el usuario
      if (response.data.branches.length > 0) {
        setBranchFilter(response.data.branches[0].id);
      }
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setError('No se pudieron cargar las sucursales');
    }
  };

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setStock(response.data.stocks);
      
      // Resetear modo de edición
      setEditMode(false);
      setEditingStock({});
      
    } catch (err) {
      console.error('Error al cargar stock:', err);
      setError('No se pudieron cargar los datos de stock. Intente nuevamente.');
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
    fetchStock();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Actualizar URL
    setSearchParams(newValue === 1 ? { action: 'transfer' } : {});
  };

  const handleEditStock = (stockItem) => {
    setEditingStock({
      ...stockItem,
      newQuantity: stockItem.quantity,
      newMinStock: stockItem.min_stock
    });
    setEditMode(true);
  };

  const handleQuantityChange = (value) => {
    // Asegurarnos que la cantidad no sea negativa
    const newValue = Math.max(0, value);
    setEditingStock({
      ...editingStock,
      newQuantity: newValue
    });
  };

  const handleMinStockChange = (value) => {
    // Asegurarnos que el stock mínimo no sea negativo
    const newValue = Math.max(0, value);
    setEditingStock({
      ...editingStock,
      newMinStock: newValue
    });
  };

  const handleSaveStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Enviar actualización al backend
      await api.put(`/stock/update/${editingStock.id}`, {
        quantity: editingStock.newQuantity,
        min_stock: editingStock.newMinStock
      });
      
      // Refrescar datos
      fetchStock();
      
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      setError(err.response?.data?.error || 'Error al actualizar el stock');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTransferDialog = (product = null) => {
    if (product) {
      setTransferData({
        product_id: product.product_id,
        source_branch_id: branchFilter,
        target_branch_id: '',
        quantity: 1
      });
    } else {
      setTransferData({
        product_id: '',
        source_branch_id: branchFilter,
        target_branch_id: '',
        quantity: 1
      });
    }
    setOpenTransferDialog(true);
  };

  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
  };

  const handleTransferInputChange = (e) => {
    const { name, value } = e.target;
    setTransferData({
      ...transferData,
      [name]: value
    });
  };

  const handleTransferStock = async () => {
    // Validar datos
    if (!transferData.product_id || !transferData.target_branch_id || transferData.quantity <= 0) {
      setError('Por favor complete todos los campos correctamente');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Enviar solicitud de transferencia
      await api.post('/stock/transfer', transferData);
      
      // Cerrar diálogo y refrescar datos
      handleCloseTransferDialog();
      fetchStock();
      
    } catch (err) {
      console.error('Error al transferir stock:', err);
      setError(err.response?.data?.error || 'Error al transferir el stock');
    } finally {
      setLoading(false);
    }
  };

  // Formatear precio en pesos chilenos
  const formatCurrency = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Renderizar chip de estado de stock
  const renderStockStatus = (stockItem) => {
    if (stockItem.quantity <= 0) {
      return <Chip label="Sin stock" color="error" size="small" />;
    } else if (stockItem.is_low_stock || stockItem.quantity <= stockItem.min_stock) {
      return <Chip label="Stock bajo" color="warning" size="small" />;
    } else {
      return <Chip label="Disponible" color="success" size="small" />;
    }
  };

  if (!user || user.role !== 'warehouse') {
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
        Gestión de Stock
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Pestañas */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Inventario" />
          <Tab label="Transferencias" />
        </Tabs>
      </Paper>
      
      {tabValue === 0 ? (
        // Pestaña de Inventario
        <>
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
              
              <Button 
                variant="outlined" 
                startIcon={<SwapHoriz />}
                onClick={() => setTabValue(1)}
              >
                Transferencias
              </Button>
            </Box>
          </Paper>
          
          {/* Tabla de stock */}
          <Paper elevation={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="center">Stock Mínimo</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Cargando inventario...
                      </TableCell>
                    </TableRow>
                  ) : stock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  ) : (
                    stock.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.sku || item.product_sku || '-'}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.product?.category || '-'}</TableCell>
                        <TableCell>{item.product ? formatCurrency(item.product.current_price || item.product.price) : '-'}</TableCell>
                        
                        {editMode && editingStock.id === item.id ? (
                          <>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton 
                                  size="small"
                                  onClick={() => handleQuantityChange(editingStock.newQuantity - 1)}
                                  disabled={editingStock.newQuantity <= 0}
                                >
                                  <Remove />
                                </IconButton>
                                <TextField
                                  value={editingStock.newQuantity}
                                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                                  inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                  variant="outlined"
                                  size="small"
                                  sx={{ width: 70, mx: 1 }}
                                />
                                <IconButton 
                                  size="small"
                                  onClick={() => handleQuantityChange(editingStock.newQuantity + 1)}
                                >
                                  <Add />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                value={editingStock.newMinStock}
                                onChange={(e) => handleMinStockChange(parseInt(e.target.value) || 0)}
                                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                variant="outlined"
                                size="small"
                                sx={{ width: 70 }}
                              />
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell align="center">
                              {item.quantity}
                              {item.is_low_stock && (
                                <Warning color="warning" sx={{ ml: 1, verticalAlign: 'middle' }} />
                              )}
                            </TableCell>
                            <TableCell align="center">{item.min_stock}</TableCell>
                          </>
                        )}
                        
                        <TableCell align="center">
                          {renderStockStatus(item)}
                        </TableCell>
                        <TableCell align="center">
                          {editMode && editingStock.id === item.id ? (
                            <IconButton 
                              color="success"
                              onClick={handleSaveStock}
                              title="Guardar cambios"
                            >
                              <Save />
                            </IconButton>
                          ) : (
                            <>
                              <IconButton 
                                color="primary"
                                onClick={() => handleEditStock(item)}
                                title="Editar stock"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton 
                                color="secondary"
                                onClick={() => handleOpenTransferDialog({
                                  product_id: item.product_id,
                                  product_name: item.product_name
                                })}
                                title="Transferir stock"
                              >
                                <SwapHoriz />
                              </IconButton>
                            </>
                          )}
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
              count={stock.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          
          {/* Alertas de stock */}
          {stock.filter(item => item.is_low_stock).length > 0 && (
            <Box mt={3}>
              <Alert severity="warning">
                <Typography variant="subtitle2" gutterBottom>
                  Productos con stock bajo:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {stock
                    .filter(item => item.is_low_stock)
                    .slice(0, 5)
                    .map(item => (
                      <li key={`alert-${item.id}`}>
                        {item.product_name} - {item.quantity} unidades disponibles (mínimo: {item.min_stock})
                      </li>
                    ))}
                  {stock.filter(item => item.is_low_stock).length > 5 && (
                    <li>Y {stock.filter(item => item.is_low_stock).length - 5} más...</li>
                  )}
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Considere solicitar reposición o transferir stock desde otra sucursal.
                </Typography>
              </Alert>
            </Box>
          )}
        </>
      ) : (
        // Pestaña de Transferencias
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Transferencia de Stock entre Sucursales
          </Typography>
          
          <Typography variant="body2" paragraph>
            Utilice este formulario para transferir productos entre sucursales. 
            Seleccione el producto, la sucursal de origen, la sucursal de destino y la cantidad a transferir.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Producto</InputLabel>
                <Select
                  name="product_id"
                  value={transferData.product_id}
                  label="Producto"
                  onChange={handleTransferInputChange}
                >
                  <MenuItem value="">Seleccione un producto</MenuItem>
                  {stock.map((item) => (
                    <MenuItem 
                      key={item.product_id} 
                      value={item.product_id}
                      disabled={item.quantity <= 0}
                    >
                      {item.product_name} ({item.quantity} en stock)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Sucursal de Origen</InputLabel>
                <Select
                  name="source_branch_id"
                  value={transferData.source_branch_id}
                  label="Sucursal de Origen"
                  onChange={handleTransferInputChange}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Sucursal de Destino</InputLabel>
                <Select
                  name="target_branch_id"
                  value={transferData.target_branch_id}
                  label="Sucursal de Destino"
                  onChange={handleTransferInputChange}
                >
                  <MenuItem value="">Seleccione una sucursal</MenuItem>
                  {branches
                    .filter(branch => branch.id != transferData.source_branch_id)
                    .map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ mr: 2 }}>Cantidad:</Typography>
                <IconButton 
                  size="small"
                  onClick={() => setTransferData({
                    ...transferData,
                    quantity: Math.max(1, transferData.quantity - 1)
                  })}
                  disabled={transferData.quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <TextField
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({
                    ...transferData,
                    quantity: Math.max(1, parseInt(e.target.value) || 1)
                  })}
                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                  variant="outlined"
                  size="small"
                  sx={{ width: 70, mx: 1 }}
                />
                <IconButton 
                  size="small"
                  onClick={() => setTransferData({
                    ...transferData,
                    quantity: transferData.quantity + 1
                  })}
                >
                  <Add />
                </IconButton>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleTransferStock}
                disabled={!transferData.product_id || !transferData.target_branch_id || loading}
              >
                Realizar Transferencia
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  Información importante:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>Las transferencias son inmediatas y no se pueden cancelar.</li>
                  <li>Asegúrese de que la sucursal de origen tiene suficiente stock antes de transferir.</li>
                  <li>La cantidad a transferir debe ser mayor a 0.</li>
                  <li>Solo puede transferir a sucursales distintas a la de origen.</li>
                </Box>
              </Alert>
              
              {transferData.product_id && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detalle de transferencia:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Producto:</strong> {stock.find(item => item.product_id == transferData.product_id)?.product_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Origen:</strong> {branches.find(branch => branch.id == transferData.source_branch_id)?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Destino:</strong> {branches.find(branch => branch.id == transferData.target_branch_id)?.name || 'No seleccionado'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cantidad:</strong> {transferData.quantity}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Diálogo de transferencia */}
      <Dialog
        open={openTransferDialog}
        onClose={handleCloseTransferDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Transferir Stock
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Producto</InputLabel>
                <Select
                  name="product_id"
                  value={transferData.product_id}
                  label="Producto"
                  onChange={handleTransferInputChange}
                >
                  {stock.map((item) => (
                    <MenuItem 
                      key={item.product_id} 
                      value={item.product_id}
                      disabled={item.quantity <= 0}
                    >
                      {item.product_name} ({item.quantity} en stock)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sucursal de Origen</InputLabel>
                <Select
                  name="source_branch_id"
                  value={transferData.source_branch_id}
                  label="Sucursal de Origen"
                  onChange={handleTransferInputChange}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sucursal de Destino</InputLabel>
                <Select
                  name="target_branch_id"
                  value={transferData.target_branch_id}
                  label="Sucursal de Destino"
                  onChange={handleTransferInputChange}
                >
                  <MenuItem value="">Seleccione una sucursal</MenuItem>
                  {branches
                    .filter(branch => branch.id != transferData.source_branch_id)
                    .map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 2 }}>Cantidad:</Typography>
                <IconButton 
                  size="small"
                  onClick={() => setTransferData({
                    ...transferData,
                    quantity: Math.max(1, transferData.quantity - 1)
                  })}
                  disabled={transferData.quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <TextField
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({
                    ...transferData,
                    quantity: Math.max(1, parseInt(e.target.value) || 1)
                  })}
                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                  variant="outlined"
                  size="small"
                  sx={{ width: 70, mx: 1 }}
                />
                <IconButton 
                  size="small"
                  onClick={() => setTransferData({
                    ...transferData,
                    quantity: transferData.quantity + 1
                  })}
                >
                  <Add />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleTransferStock}
            disabled={!transferData.product_id || !transferData.target_branch_id || loading}
          >
            Transferir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockManagement;