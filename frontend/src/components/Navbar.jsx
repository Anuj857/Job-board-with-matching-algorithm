export default function Navbar({ title, onLogout }) {
  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '15px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #eaeaea' 
    }}>
      <h2 style={{ margin: 0, color: '#333' }}>{title}</h2>
      <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}>
        Log Out
      </button>
    </nav>
  );
}