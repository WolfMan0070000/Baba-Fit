export default function ProgressionChart({ data, title, color = '#00e5ff' }) {
    if (!data || data.length < 2) return (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Not enough data for {title}</span>
        </div>
    );

    // Normalizing
    const maxVal = Math.max(...data.map(d => d.value));
    const minVal = Math.min(...data.map(d => d.value));
    const range = maxVal - minVal || 1;
    const height = 150;
    const width = 300; // viewBox width

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - minVal) / range) * height; // Invert Y
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: color }}>{title}</h3>
            <svg viewBox={`0 0 ${width} ${height + 20}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Fill Area */}
                <polyline
                    points={`${0},${height} ${points} ${width},${height}`}
                    fill={color}
                    fillOpacity="0.1"
                    stroke="none"
                />
                {/* Dots */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * width;
                    const y = height - ((d.value - minVal) / range) * height;
                    return (
                        <circle key={i} cx={x} cy={y} r="4" fill="#fff" />
                    );
                })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{data[0].date}</span>
                <span>{data[data.length - 1].date}</span>
            </div>
        </div>
    );
}
