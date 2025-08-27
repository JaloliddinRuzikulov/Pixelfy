import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function LoginPage() {
	return (
		<AuthLayout 
			title="Video Editor" 
			subtitle="Professional video editing made simple"
		>
			<LoginForm />
		</AuthLayout>
	);
}
