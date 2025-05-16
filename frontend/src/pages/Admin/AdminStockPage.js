import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Modal, Alert, Spinner } from "react-bootstrap";
import StockTable from "../../components/stock/StockTable"; // o "../../components/..." según corresponda
import StockForm from "../../components/stock/StockForm";
import StockTransferForm from "../../components/stock/StockTransferForm";
import stockService from "../../services/stock.service"; // ajusta la ruta según tu servicio

// ----- Componente principal ---------
const AdminStockPage = () => {
  /* ---------------------------------------------------------------- */
  /* ESTADO */
  /* ---------------------------------------------------------------- */
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);

  /* ---------------------------------------------------------------- */
  /* EFECTOS */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    fetchStocks();
  }, []);

  /* ---------------------------------------------------------------- */
  /* HANDLERS */
  /* ---------------------------------------------------------------- */
  const fetchStocks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await stockService.getStock();
      setStocks(data.stocks || []);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar stock");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (stock) => {
    setCurrentStock(stock);
    setShowEditModal(true);
  };

  const handleOpenTransfer = (stock) => {
    setCurrentStock(stock);
    setShowTransferModal(true);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowTransferModal(false);
    setCurrentStock(null);
  };

  const handleSaveStock = async (updated) => {
    await fetchStocks();
    handleCloseModals();
  };

  /* ---------------------------------------------------------------- */
  /* RENDER */
  /* ---------------------------------------------------------------- */
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Gestión de Stock</h1>
          <p className="text-muted">Revisa y actualiza el inventario de las sucursales</p>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
              <p className="mt-3">Cargando stock...</p>
            </div>
          ) : (
            <StockTable
              stocks={stocks}
              onRefresh={fetchStocks}
              onEdit={handleOpenEdit}
              onTransfer={handleOpenTransfer}
            />
          )}
        </Card.Body>
      </Card>

      {/* ------- Modal editar / actualizar stock ------- */}
      <Modal show={showEditModal} onHide={handleCloseModals} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{currentStock ? "Actualizar Stock" : "Agregar Stock"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentStock && (
            <StockForm stock={currentStock} onSaved={handleSaveStock} onCancel={handleCloseModals} />
          )}
        </Modal.Body>
      </Modal>

      {/* ------- Modal transferir stock -------- */}
      <Modal show={showTransferModal} onHide={handleCloseModals} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Transferir Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentStock && (
            <StockTransferForm stock={currentStock} onTransferred={handleSaveStock} onCancel={handleCloseModals} />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminStockPage;
