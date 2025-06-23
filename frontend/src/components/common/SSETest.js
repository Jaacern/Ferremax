import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Badge } from 'react-bootstrap';
import notificationService from '../../services/notification.service';
import config from '../../config';

const SSETest = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Suscribirse a eventos de conexión
    const connectionUnsubscribe = notificationService.subscribe('connection', (data) => {
      setConnectionStatus(data.status);
      if (data.status === 'connected') {
        addMessage('info', 'Conexión SSE establecida');
      } else if (data.status === 'failed') {
        addMessage('danger', `Error de conexión: ${data.message}`);
      }
    });

    // Suscribirse a mensajes genéricos
    const messageUnsubscribe = notificationService.subscribe('message', (data) => {
      addMessage('info', `Mensaje recibido: ${JSON.stringify(data)}`);
    });

    // Suscribirse a alertas de stock
    const stockUnsubscribe = notificationService.subscribe('stock_alert', (data) => {
      addMessage('warning', `Alerta de stock: ${data.message}`);
    });

    // Suscribirse a notificaciones de sistema
    const systemUnsubscribe = notificationService.subscribe('system_notification', (data) => {
      addMessage('success', `Notificación del sistema: ${data.message}`);
    });

    return () => {
      connectionUnsubscribe();
      messageUnsubscribe();
      stockUnsubscribe();
      systemUnsubscribe();
    };
  }, []);

  const addMessage = (type, text) => {
    const newMessage = {
      id: Date.now(),
      type,
      text,
      timestamp: new Date()
    };
    setMessages(prev => [newMessage, ...prev].slice(0, 10));
  };

  const testSSEConnection = async () => {
    try {
      const response = await fetch(`${config.API_URL.replace('/api', '')}/api/sse/status`);
      const data = await response.json();
      setTestResults(prev => ({ ...prev, status: data }));
      addMessage(data.status === 'ok' ? 'success' : 'danger', 
                `Estado SSE: ${data.message}`);
    } catch (error) {
      addMessage('danger', `Error al verificar estado SSE: ${error.message}`);
    }
  };

  const testSystemNotification = async () => {
    try {
      const response = await fetch(`${config.API_URL.replace('/api', '')}/api/sse/test`);
      const data = await response.json();
      setTestResults(prev => ({ ...prev, system: data }));
      addMessage('info', 'Notificación del sistema enviada');
    } catch (error) {
      addMessage('danger', `Error al enviar notificación: ${error.message}`);
    }
  };

  const testStockAlert = async () => {
    try {
      const response = await fetch(`${config.API_URL.replace('/api', '')}/api/sse/test-stock`);
      const data = await response.json();
      setTestResults(prev => ({ ...prev, stock: data }));
      addMessage('info', 'Alerta de stock enviada');
    } catch (error) {
      addMessage('danger', `Error al enviar alerta: ${error.message}`);
    }
  };

  const testOrderNotification = async () => {
    try {
      const response = await fetch(`${config.API_URL.replace('/api', '')}/api/sse/test-order`);
      const data = await response.json();
      setTestResults(prev => ({ ...prev, order: data }));
      addMessage('info', 'Notificación de orden enviada');
    } catch (error) {
      addMessage('danger', `Error al enviar notificación: ${error.message}`);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge bg="success">Conectado</Badge>;
      case 'failed':
        return <Badge bg="danger">Falló</Badge>;
      default:
        return <Badge bg="secondary">Desconectado</Badge>;
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <h5>Prueba de Notificaciones SSE</h5>
        <div className="d-flex justify-content-between align-items-center">
          <span>Estado: {getStatusBadge()}</span>
          <small className="text-muted">
            URL: {config.SSE_URL}
          </small>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={testSSEConnection}
            className="me-2"
          >
            Verificar Estado
          </Button>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={testSystemNotification}
            className="me-2"
          >
            Probar Sistema
          </Button>
          <Button 
            variant="outline-warning" 
            size="sm" 
            onClick={testStockAlert}
            className="me-2"
          >
            Probar Stock
          </Button>
          <Button 
            variant="outline-info" 
            size="sm" 
            onClick={testOrderNotification}
          >
            Probar Orden
          </Button>
        </div>

        <div className="mb-3">
          <h6>Mensajes Recibidos:</h6>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <Alert variant="info">No hay mensajes recibidos</Alert>
            ) : (
              messages.map(message => (
                <Alert 
                  key={message.id} 
                  variant={message.type}
                  className="py-2 mb-1"
                >
                  <small>
                    {message.timestamp.toLocaleTimeString()}: {message.text}
                  </small>
                </Alert>
              ))
            )}
          </div>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div>
            <h6>Resultados de Pruebas:</h6>
            <pre className="bg-light p-2 rounded" style={{ fontSize: '0.8rem' }}>
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SSETest; 