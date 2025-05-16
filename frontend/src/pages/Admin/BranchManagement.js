import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { 
  Box, Typography, Paper, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, IconButton,
  Dialog, DialogActions, DialogContent, 
  DialogTitle, Grid, FormControlLabel, Checkbox
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const BranchManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para modal de sucursal
  const [openModal, setOpenModal] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    is_main: false
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/products/branches');
      setBranches(response.data.branches);
      
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setError('No se pudieron cargar las sucursales. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (branch = null) => {
    if (branch) {
      // Editar sucursal existente
      setCurrentBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address || '',
        city: branch.city || '',
        region: branch.region || '',
        phone: branch.phone || '',
        email: branch.email || '',
        is_main: branch.is_main || false
      });
    } else {
      // Nueva sucursal
      setCurrentBranch(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        region: '',
        phone: '',
        email: '',
        is_main: false
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentBranch(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitBranch = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Crear o actualizar sucursal
      if (currentBranch) {
        // Actualizar sucursal existente
        await api.put(`/products/branches/${currentBranch.id}`, formData);
      } else {
        // Crear nueva sucursal
        await api.post('/products/branches', formData);
      }
      
      // Cerrar modal y actualizar lista
      handleCloseModal();
      fetchBranches();
      
    } catch (err) {
      console.error('Error al guardar sucursal:', err);
      setError(err.response?.data?.error || 'Error al guardar la sucursal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!window.confirm('¿Está seguro que desea eliminar esta sucursal?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/products/branches/${branchId}`);
      
      // Actualizar lista
      fetchBranches();
      
    } catch (err) {
      console.error('Error al eliminar sucursal:', err);
      setError('No se pudo eliminar la sucursal. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
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
        Gestión de Sucursales
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Nueva Sucursal
        </Button>
      </Box>
      
      {/* Tabla de sucursales */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Ciudad</TableCell>
                <TableCell>Región</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Sucursal Principal</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Cargando sucursales...
                  </TableCell>
                </TableRow>
              ) : branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron sucursales
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell>{branch.region}</TableCell>
                    <TableCell>{branch.phone}</TableCell>
                    <TableCell>{branch.email}</TableCell>
                    <TableCell align="center">
                      {branch.is_main ? 'Sí' : 'No'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary"
                        onClick={() => handleOpenModal(branch)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteBranch(branch.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Modal de sucursal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </DialogTitle>
        <DialogContent>
          <form id="branch-form" onSubmit={handleSubmitBranch}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="address"
                  value={formData.address}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Región"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_main"
                      checked={formData.is_main}
                      onChange={handleInputChange}
                    />
                  }
                  label="Sucursal Principal"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button 
            type="submit" 
            form="branch-form"
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchManagement;