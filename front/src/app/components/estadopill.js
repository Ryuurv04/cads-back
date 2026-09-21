

export default function Badge({ estado, valor_estado }) {
    return (
        <span className={`badge ${valor_estado || ''}`}><span className="dot"/>{estado}</span>
    );
}