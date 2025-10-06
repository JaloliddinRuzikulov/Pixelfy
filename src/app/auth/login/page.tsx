import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Suspense } from "react";

function LoginFormWrapper() {
	return <LoginForm />;
}

export default function LoginPage() {
	return (
		<AuthLayout title="Pixelfy" subtitle="Professional video editing platform">
			<Suspense fallback={<div>Loading...</div>}>
				<LoginFormWrapper />
			</Suspense>
		</AuthLayout>
	);
}
