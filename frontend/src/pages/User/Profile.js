import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, Typography, Paper, Grid, TextField, 
  Button, Avatar, Alert, Divider
} from '@mui/material';
import { Save, Edit, Person } from '@mui/icons-material';
import api from '../../services/api';
import { updateProfile } from '../../store/auth.slice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    try {
      const resultAction = await dispatch(updateProfile(formData));
      
      if (updateProfile.fulfilled.match(resultAction)) {
        setSuccess(true);
        setIsEditing(false);
      } else {
        setError(resultAction.error.message || 'Error al actualizar el perfil');
      }
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
      console.error(err);
    }
  };

  // Generar iniciales para el avatar
  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    } else if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom component="h1">
        Mi Perfil
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Perfil actualizado correctamente
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Avatar y datos de usuario */}
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: 'primary.main',
                  fontSize: 40,
                  margin: '0 auto 16px'
                }}
              >
                {getInitials()}
              </Avatar>
              
              <Typography variant="h6" gutterBottom>
                {user.username}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                {user.email}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ 
                  display: 'inline-block',
                  py: 0.5,
                  px: 1.5,
                  borderRadius: 1,
                  bgcolor: 'action.selected'
                }}
              >
                {user.role === 'admin' ? 'Administrador' : 
                 user.role === 'vendor' ? 'Vendedor' : 
                 user.role === 'warehouse' ? 'Bodeguero' : 
                 user.role === 'accountant' ? 'Contador' : 
                 'Cliente'}
              </Typography>
              
              {!isEditing && (
                <Button 
                  variant="outlined"
                  startIcon={<Edit />}
                  sx={{ mt: 2 }}
                  onClick={() => setIsEditing(true)}
                >
                  Editar perfil
                </Button>
              )}
            </Grid>
            
            {/* Formulario de perfil */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
              
              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        phone: user.phone || '',
                        address: user.address || ''
                      });
                    }}
                    sx={{ mr: 2 }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    variant="contained" 
                    color="primary"
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;