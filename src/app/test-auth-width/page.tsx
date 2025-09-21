import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function TestAuthWidthPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8">
				<h1 className="text-2xl font-bold text-center mb-8">
					Auth Form Width Test
				</h1>
				<div className="mb-8">
					<h2 className="text-lg font-semibold mb-4">
						Current Implementation:
					</h2>
					<AuthLayout
						title="Video Editor"
						subtitle="Width test for authentication form"
					>
						<LoginForm />
					</AuthLayout>
				</div>
				<div className="text-center text-muted-foreground">
					<p>This page is for testing the authentication form width fix.</p>
					<p>
						The form should be responsive and not too narrow on larger screens.
					</p>
				</div>
			</div>
		</div>
	);
}
