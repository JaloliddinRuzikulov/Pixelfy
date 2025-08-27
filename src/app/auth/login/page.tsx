import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function LoginPage() {
	return (
		<AuthLayout 
			title="Pixelfy" 
			subtitle="Professional video editing platform"
		>
			<LoginForm />
		</AuthLayout>
	);
}
