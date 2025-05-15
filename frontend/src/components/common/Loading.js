import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const Loading = ({ message = 'Cargando...', fullscreen = false, size = 'lg' }) => {
  // Estilo para el contenedor basado en si es pantalla completa o no
  const containerStyle = fullscreen ? { 
    height: '80vh', 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center' 
  } : {};

  return (
    <Container style={containerStyle} className="text-center py-4">
      <Spinner 
        animation="border" 
        role="status" 
        variant="primary"
        size={size}
        style={{ width: size === 'lg' ? '3rem' : '1.5rem', height: size === 'lg' ? '3rem' : '1.5rem' }}
      >
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <p className="mt-3">{message}</p>
    </Container>
  );
};

export default Loading;