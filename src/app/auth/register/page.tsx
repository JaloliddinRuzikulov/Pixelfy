import { RegisterForm } from "@/components/auth/register-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function RegisterPage() {
	return (
		<AuthLayout
			title="Pixelfy"
			subtitle="Join thousands of creators on Pixelfy.uz"
		>
			<RegisterForm />
		</AuthLayout>
	);
}
