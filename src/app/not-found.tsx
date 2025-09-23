export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-bold">404</h1>
				<p className="mt-4 text-xl">Sahifa topilmadi</p>
				<a
					href="/"
					className="mt-8 inline-block px-6 py-3 bg-primary text-white rounded-lg"
				>
					Bosh sahifaga qaytish
				</a>
			</div>
		</div>
	);
}
