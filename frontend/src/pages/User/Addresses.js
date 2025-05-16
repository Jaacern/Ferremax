import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, Typography, Paper, Grid, Button, TextField,
  List, ListItem, ListItemText, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import { 
  Add, Edit, Delete, Home, LocationOn
} from '@mui/icons-material';
import api from '../../services/api';

// Nota: Esta página es hipotética ya que no vemos una API específica para
// gestionar múltiples direcciones en el backend proporcionado.
// Normalmente, sería parte de un módulo más completo de gestión de perfil.

const Addresses = () => {
  const { user } = useSelector(state => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el diálogo de dirección
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formData, setFormData] = useState({
    address_name: '',
    street: '',
    number: '',
    apartment: '',
    city: '',
    region: '',
    postal_code: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      // Aquí se haría una llamada a la API para obtener las direcciones del usuario
      // Como es hipotético, usaremos datos de ejemplo
      
      // Tiempo simulado para cargar
      setTimeout(() => {
        const mockAddresses = [
          {
            id: 1,
            address_name: 'Casa',
            street: 'Av. Libertador B. O\'Higgins',
            number: '1111',
            apartment: '',
            city: 'Santiago',
            region: 'Metropolitana',
            postal_code: '8320000',
            is_default: true
          },
          {
            id: 2,
            address_name: 'Trabajo',
            street: 'Av. Providencia',
            number: '2222',
            apartment: 'Oficina 505',
            city: 'Providencia',
            region: 'Metropolitana',
            postal_code: '7500000',
            is_default: false
          }
        ];
        
        setAddresses(mockAddresses);
        setLoading(false);
      }, 1000);
    }
  }, [user]);

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Debe iniciar sesión para acceder a esta página
        </Alert>
      </Box>
    );
  }
  
  const handleOpenDialog = (address = null) => {
    if (address) {
      // Editar dirección existente
      setCurrentAddress(address);
      setFormData({
        address_name: address.address_name,
        street: address.street,
        number: address.number,
        apartment: address.apartment || '',
        city: address.city,
        region: address.region,
        postal_code: address.postal_code,
        is_default: address.is_default
      });
    } else {
      // Nueva dirección
      setCurrentAddress(null);
      setFormData({
        address_name: '',
        street: '',
        number: '',
        apartment: '',
        city: '',
        region: '',
        postal_code: '',
        is_default: addresses.length === 0 // Primera dirección como predeterminada
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAddress(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aquí se enviaría a la API para guardar/actualizar
    // Como es hipotético, solo actualizaremos el estado local
    
    if (currentAddress) {
      // Actualizar dirección existente
      const updatedAddresses = addresses.map(addr => 
        addr.id === currentAddress.id 
          ? { ...addr, ...formData }
          : formData.is_default && addr.is_default 
            ? { ...addr, is_default: false } 
            : addr
      );
      
      setAddresses(updatedAddresses);
    } else {
      // Nueva dirección
      const newAddress = {
        id: Date.now(), // ID temporal
        ...formData
      };
      
      // Si la nueva dirección es predeterminada, actualizar las demás
      const updatedAddresses = formData.is_default 
        ? addresses.map(addr => ({ ...addr, is_default: false }))
        : [...addresses];
      
      setAddresses([...updatedAddresses, newAddress]);
    }
    
    handleCloseDialog();
  };
  
  const handleDelete = (addressId) => {
    if (!window.confirm('¿Está seguro que desea eliminar esta dirección?')) {
      return;
    }
    
    // Aquí se enviaría a la API para eliminar
    // Como es hipotético, solo actualizaremos el estado local
    const filteredAddresses = addresses.filter(addr => addr.id !== addressId);
    
    // Si eliminamos la dirección predeterminada, hacer predeterminada la primera
    if (addresses.find(addr => addr.id === addressId)?.is_default && filteredAddresses.length > 0) {
      filteredAddresses[0].is_default = true;
    }
    
    setAddresses(filteredAddresses);
  };
  
  const handleSetDefault = (addressId) => {
    // Aquí se enviaría a la API para actualizar
    // Como es hipotético, solo actualizaremos el estado local
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      is_default: addr.id === addressId
    }));
    
    setAddresses(updatedAddresses);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom component="h1">
        Mis Direcciones
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Dirección
        </Button>
      </Box>
      
      {loading ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Cargando direcciones...</Typography>
        </Paper>
      ) : addresses.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No tienes direcciones guardadas
          </Typography>
          <Typography variant="body2" paragraph>
            Agrega tu primera dirección para agilizar tus compras.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Agregar Dirección
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {addresses.map((address) => (
            <Grid item xs={12} md={6} key={address.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  border: address.is_default ? '2px solid #1976d2' : '1px solid #e0e0e0'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" color={address.is_default ? 'primary' : 'inherit'}>
                    {address.is_default ? (
                      <Home color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    ) : (
                      <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    )}
                    {address.address_name}
                    {address.is_default && (
                      <Typography 
                        variant="caption" 
                        color="primary"
                        sx={{ 
                          ml: 1,
                          border: '1px solid',
                          borderRadius: 1,
                          p: 0.5
                        }}
                      >
                        Predeterminada
                      </Typography>
                    )}
                  </Typography>
                  
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDialog(address)}
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(address.id)}
                      title="Eliminar"
                      disabled={address.is_default && addresses.length > 1}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2">
                  {address.street} {address.number}
                  {address.apartment && `, ${address.apartment}`}
                </Typography>
                <Typography variant="body2">
                  {address.city}, {address.region}
                </Typography>
                <Typography variant="body2">
                  CP: {address.postal_code}
                </Typography>
                
                {!address.is_default && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Establecer como predeterminada
                  </Button>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Diálogo para agregar/editar dirección */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentAddress ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
        </DialogTitle>
        
        <DialogContent>
          <form id="address-form" onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de la dirección"
                  name="address_name"
                  value={formData.address_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Casa, Trabajo, etc."
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Calle"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Número"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Departamento/Oficina (opcional)"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Región"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código Postal"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <label>
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    disabled={addresses.length === 0} // Si es la primera dirección, siempre es predeterminada
                  />
                  {' '}Establecer como dirección predeterminada
                </label>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            form="address-form"
            variant="contained" 
            color="primary"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Addresses;