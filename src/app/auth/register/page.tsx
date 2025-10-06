import { RegisterForm } from "@/components/auth/register-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Suspense } from "react";

function RegisterFormWrapper() {
	return <RegisterForm />;
}

export default function RegisterPage() {
	return (
		<AuthLayout
			title="Pixelfy"
			subtitle="Join thousands of creators on Pixelfy.uz"
		>
			<Suspense fallback={<div>Loading...</div>}>
				<RegisterFormWrapper />
			</Suspense>
		</AuthLayout>
	);
}
