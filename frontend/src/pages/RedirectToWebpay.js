import { useEffect } from 'react';

const RedirectToWebPay = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  useEffect(() => {
    if (token) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://webpay3gint.transbank.cl/webpayserver/init_transaction.cgi';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = token;
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();
    }
  }, [token]);

  return <p>Redirigiendo a WebPay...</p>;
};

export default RedirectToWebPay;
