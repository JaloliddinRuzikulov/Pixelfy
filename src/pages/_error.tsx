import { NextPageContext } from "next";

function Error({ statusCode }: { statusCode: number }) {
	return (
		<div
			style={{
				display: "flex",
				minHeight: "100vh",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			<div style={{ textAlign: "center" }}>
				<h1 style={{ fontSize: "4rem", fontWeight: "bold", margin: "0" }}>
					{statusCode || "Error"}
				</h1>
				<p style={{ fontSize: "1.5rem", marginTop: "1rem", color: "#666" }}>
					{statusCode
						? `Server xatoligi ${statusCode} yuz berdi`
						: "Client tarafda xatolik yuz berdi"}
				</p>
				<a
					href="/"
					style={{
						display: "inline-block",
						marginTop: "2rem",
						padding: "12px 24px",
						backgroundColor: "#007bff",
						color: "white",
						textDecoration: "none",
						borderRadius: "6px",
					}}
				>
					Bosh sahifaga qaytish
				</a>
			</div>
		</div>
	);
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return { statusCode };
};

export default Error;
