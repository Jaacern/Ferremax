import { useDispatch, useSelector } from 'react-redux';
import { setSelected, fetchConversion, selectCurrencyState } from '../store/currency.slice';

const currencies = ['CLP', 'USD', 'EUR', 'GBP', 'BRL', 'MXN', 'ARS'];

export default function CurrencySelector({ cartTotalCLP }) {
  const dispatch = useDispatch();
  const { selected, status } = useSelector(selectCurrencyState);

  const handleChange = (e) => {
    const newCur = e.target.value;
    dispatch(setSelected(newCur));
    if (newCur !== 'CLP') {
      dispatch(fetchConversion({ amount: cartTotalCLP, to: newCur }));
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label me-2 fw-semibold">Moneda:</label>
      <select value={selected} onChange={handleChange} className="form-select d-inline w-auto">
        {currencies.map((c) => <option key={c}>{c}</option>)}
      </select>
      {status === 'loading' && <span className="ms-2 spinner-border spinner-border-sm" />}
    </div>
  );
}
