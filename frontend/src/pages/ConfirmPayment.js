import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ConfirmPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token_ws");

    if (token) {
      fetch(`/api/payments/confirm?token_ws=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.redirect) {
            navigate(data.redirect); // ← Esto lleva a /payment/success?order_id=12
          } else {
            navigate("/payment/failure");
          }
        })
        .catch(() => navigate("/payment/failure"));
    } else {
      navigate("/payment/failure");
    }
  }, [navigate, location.search]);

  return <p>Confirmando el pago con WebPay...</p>;
};

export default ConfirmPayment;
