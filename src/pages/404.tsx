export default function Custom404() {
	return (
		<div style={{
			display: 'flex',
			minHeight: '100vh',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: 'system-ui, -apple-system, sans-serif'
		}}>
			<div style={{ textAlign: 'center' }}>
				<h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: '0' }}>404</h1>
				<p style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#666' }}>
					Sahifa topilmadi
				</p>
				<a
					href="/"
					style={{
						display: 'inline-block',
						marginTop: '2rem',
						padding: '12px 24px',
						backgroundColor: '#007bff',
						color: 'white',
						textDecoration: 'none',
						borderRadius: '6px'
					}}
				>
					Bosh sahifaga qaytish
				</a>
			</div>
		</div>
	);
}