import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatUtils';

/**
 * Componente para mostrar una tabla de stock con funciones de filtrado.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.stocks - Lista de stocks
 * @param {boolean} props.loading - Indica si está cargando
 * @param {Function} props.onEdit - Función a llamar al editar un stock
 * @param {Function} props.onTransfer - Función a llamar para transferir stock
 * @param {Array} props.branches - Lista de sucursales disponibles
 * @returns {React.ReactNode} - Tabla de stock
 */
const StockTable = ({ 
  stocks = [], 
  loading = false, 
  onEdit, 
  onTransfer, 
  branches = [] 
}) => {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  
  // Aplicar filtros a la lista de stocks
  const filteredStocks = stocks.filter(stock => {
    // Filtrar por búsqueda
    const searchMatch = !search || 
      (stock.product_name && stock.product_name.toLowerCase().includes(search.toLowerCase())) ||
      (stock.product_sku && stock.product_sku.toLowerCase().includes(search.toLowerCase())) ||
      (stock.branch_name && stock.branch_name.toLowerCase().includes(search.toLowerCase()));
    
    // Filtrar por sucursal
    const branchMatch = !branchFilter || stock.branch_id === parseInt(branchFilter, 10);
    
    // Filtrar por stock bajo
    const lowStockMatch = !lowStockOnly || stock.is_low_stock;
    
    // Filtrar por stock agotado
    const outOfStockMatch = !outOfStockOnly || stock.is_out_of_stock;
    
    return searchMatch && branchMatch && lowStockMatch && outOfStockMatch;
  });
  
  // Calcular estadísticas de stock
  const stockStats = {
    total: filteredStocks.length,
    lowStock: filteredStocks.filter(s => s.is_low_stock).length,
    outOfStock: filteredStocks.filter(s => s.is_out_of_stock).length
  };
  
  // Renderizar color según estado del stock
  const getStockColorClass = (stock) => {
    if (stock.is_out_of_stock) {
      return 'text-danger fw-bold';
    } else if (stock.is_low_stock) {
      return 'text-warning fw-bold';
    }
    return 'text-success';
  };
  
  // Renderizar badges de estado
  const renderStockStatus = (stock) => {
    if (stock.is_out_of_stock) {
      return <span className="badge bg-danger">Agotado</span>;
    } else if (stock.is_low_stock) {
      return <span className="badge bg-warning text-dark">Stock Bajo</span>;
    }
    return <span className="badge bg-success">En Stock</span>;
  };
  
  // Mostrar placeholder si está cargando
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-6"></span>
            <span className="placeholder col-8"></span>
            <span className="placeholder col-10"></span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0">Inventario</h5>
      </div>
      <div className="card-body">
        {/* Filtros */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar producto, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-md-3 mb-3 mb-md-0">
            <select
              className="form-select"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">Todas las sucursales</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-5">
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="lowStockFilter"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="lowStockFilter">
                  Stock Bajo
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="outOfStockFilter"
                  checked={outOfStockOnly}
                  onChange={(e) => setOutOfStockOnly(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="outOfStockFilter">
                  Agotados
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card border-0 bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Total Productos</h6>
                <h3>{stockStats.total}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Stock Bajo</h6>
                <h3 className="text-warning">{stockStats.lowStock}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 bg-light">
              <div className="card-body text-center">
                <h6 className="text-muted">Agotados</h6>
                <h3 className="text-danger">{stockStats.outOfStock}</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabla de inventario */}
        {filteredStocks.length === 0 ? (
          <div className="alert alert-info text-center p-5">
            <i className="bi bi-search fs-1 d-block mb-3"></i>
            <h4>No se encontraron productos</h4>
            <p className="mb-0">Intente con otros filtros o verifique el inventario.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Sucursal</th>
                  <th>Cantidad</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                  <th>Actualizado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map(stock => (
                  <tr key={stock.id}>
                    <td>
                      <Link to={`/products/${stock.product_id}`} className="text-decoration-none">
                        {stock.product_name}
                      </Link>
                    </td>
                    <td>
                      <small className="text-muted">{stock.product_sku}</small>
                    </td>
                    <td>{stock.branch_name}</td>
                    <td className={getStockColorClass(stock)}>
                      {stock.quantity}
                    </td>
                    <td>{stock.min_stock}</td>
                    <td>
                      {renderStockStatus(stock)}
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(stock.updated_at)}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => onEdit(stock)}
                          title="Editar stock"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => onTransfer(stock)}
                          title="Transferir stock"
                        >
                          <i className="bi bi-arrow-left-right"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockTable;