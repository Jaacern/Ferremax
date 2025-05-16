import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { 
  Box, Typography, Paper, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, 
  Dialog, DialogActions, DialogContent, 
  DialogTitle, FormControl, InputLabel,
  Select, MenuItem, Alert, IconButton,
  Grid, FormControlLabel, Checkbox, Chip
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';

const UserManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para paginación y filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Estado para modal de usuario
  const [openModal, setOpenModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    first_name: '',
    last_name: '',
    rut: '',
    phone: '',
    address: '',
    is_active: true
  });
  
  // Roles disponibles
  const userRoles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'vendor', label: 'Vendedor' },
    { value: 'warehouse', label: 'Bodeguero' },
    { value: 'accountant', label: 'Contador' },
    { value: 'customer', label: 'Cliente' }
  ];

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: page + 1,  // API usa base 1 para páginas
        per_page: rowsPerPage
      });
      
      if (roleFilter) {
        params.append('role', roleFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await api.get(`/auth/users?${params.toString()}`);
      setUsers(response.data.users);
      
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudieron cargar los usuarios. Intente nuevamente.');
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenModal = (userData = null) => {
    if (userData) {
      // Editar usuario existente
      setCurrentUser(userData);
      setFormData({
        username: userData.username,
        email: userData.email,
        password: '', // No se carga la contraseña
        role: userData.role,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        rut: userData.rut || '',
        phone: userData.phone || '',
        address: userData.address || '',
        is_active: userData.is_active
      });
    } else {
      // Nuevo usuario
      setCurrentUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'customer',
        first_name: '',
        last_name: '',
        rut: '',
        phone: '',
        address: '',
        is_active: true
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validar campos requeridos
      if (!formData.username || !formData.email || !formData.role) {
        setError('Faltan campos requeridos');
        setLoading(false);
        return;
      }
      
      // Si es un nuevo usuario, se requiere contraseña
      if (!currentUser && !formData.password) {
        setError('La contraseña es requerida para nuevos usuarios');
        setLoading(false);
        return;
      }
      
      // Crear o actualizar usuario
      if (currentUser) {
        // Actualizar usuario existente
        await api.put(`/auth/users/${currentUser.id}`, formData);
      } else {
        // Crear nuevo usuario
        await api.post('/auth/users', formData);
      }
      
      // Cerrar modal y actualizar lista
      handleCloseModal();
      fetchUsers();
      
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setError(err.response?.data?.error || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/auth/users/${userId}`);
      
      // Actualizar lista
      fetchUsers();
      
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      setError('No se pudo eliminar el usuario. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar chip de estado según el rol
  const renderRoleChip = (role) => {
    let color;
    switch (role) {
      case 'admin':
        color = 'error';
        break;
      case 'vendor':
        color = 'primary';
        break;
      case 'warehouse':
        color = 'warning';
        break;
      case 'accountant':
        color = 'info';
        break;
      case 'customer':
        color = 'success';
        break;
      default:
        color = 'default';
    }
    
    const label = userRoles.find(r => r.value === role)?.label || role;
    
    return <Chip label={label} color={color} size="small" />;
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
        Gestión de Usuarios
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Filtros y búsqueda */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Buscar usuarios"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton type="submit" edge="end">
                      <Search />
                    </IconButton>
                  ),
                }}
              />
            </form>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Rol</InputLabel>
              <Select
                value={roleFilter}
                label="Rol"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={5} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
            >
              Nuevo Usuario
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabla de usuarios */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo Electrónico</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>RUT</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && page === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>{userData.username}</TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      {userData.first_name} {userData.last_name}
                    </TableCell>
                    <TableCell>{userData.rut}</TableCell>
                    <TableCell>
                      {renderRoleChip(userData.role)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={userData.is_active ? 'Activo' : 'Inactivo'} 
                        color={userData.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary"
                        onClick={() => handleOpenModal(userData)}
                      >
                        <Edit />
                      </IconButton>
                      {user.id !== userData.id && (
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(userData.id)}
                        >
                          <Delete />
                        </IconButton>
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
          count={-1} // No conocemos el total exacto desde la API
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to }) => `${from}-${to}`}
        />
      </Paper>
      
      {/* Modal de usuario */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <form id="user-form" onSubmit={handleSubmitUser}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de Usuario"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={currentUser ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!currentUser}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="Rol"
                    onChange={handleInputChange}
                  >
                    {userRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="RUT"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  placeholder="12.345.678-9"
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                  }
                  label="Usuario Activo"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button 
            type="submit" 
            form="user-form"
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

export default UserManagement;