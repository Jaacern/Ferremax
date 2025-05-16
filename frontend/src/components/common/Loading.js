import React from 'react';

const Loading = ({ message = 'Cargando...', fullScreen = false }) => {
  // Estilo para el contenedor de carga en pantalla completa
  const fullScreenStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  };
  
  // Estilo para el contenedor de carga en línea
  const inlineStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  };
  
  return (
    <div style={fullScreen ? fullScreenStyle : inlineStyle}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
        {message && <p className="mt-3 text-primary">{message}</p>}
      </div>
    </div>
  );
};

export default Loading;