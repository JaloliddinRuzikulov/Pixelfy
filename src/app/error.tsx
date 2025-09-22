'use client';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold">Xatolik yuz berdi!</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					{error.message || 'Kutilmagan xatolik yuz berdi'}
				</p>
				<button
					onClick={reset}
					className="mt-8 inline-block px-6 py-3 bg-primary text-white rounded-lg"
				>
					Qayta urinish
				</button>
			</div>
		</div>
	);
}