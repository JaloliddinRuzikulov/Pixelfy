import { RegisterForm } from "@/components/auth/register-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function RegisterPage() {
	return (
		<AuthLayout 
			title="Video Editor" 
			subtitle="Join thousands of creators making amazing videos"
		>
			<RegisterForm />
		</AuthLayout>
	);
}
