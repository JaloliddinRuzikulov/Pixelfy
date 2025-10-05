"use client";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Video, Sparkles, Wand2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const t = useTranslations("landing");

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			// Don't redirect if user is already on landing page
			// Let them navigate manually to /projects or /edit
			// router.push("/projects");
		}
	}, [isLoading, isAuthenticated]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">
						{t("hero.loading", { default: "Yuklanmoqda..." })}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background relative overflow-hidden">
			{/* Ultra Premium Animated Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				{/* Base gradient with enhanced colors */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background via-50% to-purple-500/15" />

				{/* Animated gradient orbs - Layer 1 (Largest) - ENHANCED */}
				<div className="absolute inset-0 opacity-60 dark:opacity-50">
					<div className="absolute -top-20 -left-20 w-[700px] h-[700px] bg-gradient-to-br from-primary/70 via-purple-500/60 to-pink-500/50 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob" />
					<div className="absolute top-20 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/70 via-rose-500/60 to-purple-500/60 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[90px] animate-blob animation-delay-2000" />
					<div className="absolute -bottom-20 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-blue-500/60 via-cyan-500/50 to-primary/60 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
					<div className="absolute bottom-1/3 right-1/4 w-[550px] h-[550px] bg-gradient-to-br from-purple-500/60 via-violet-500/50 to-pink-500/60 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] animate-blob animation-delay-6000" />
				</div>

				{/* Animated gradient orbs - Layer 2 (Medium) - ENHANCED */}
				<div className="absolute inset-0 opacity-40 dark:opacity-30">
					<div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/80 via-blue-500/70 to-primary/60 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[70px] animate-blob-reverse" />
					<div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-rose-400/80 via-pink-500/70 to-purple-500/60 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] animate-blob-reverse animation-delay-3000" />
					<div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-gradient-to-br from-amber-400/50 via-orange-500/40 to-pink-500/50 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] animate-blob animation-delay-4000" />
				</div>

				{/* Enhanced grid pattern */}
				<div
					className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
					style={{
						backgroundImage: `
							linear-gradient(to right, rgb(var(--foreground)) 1px, transparent 1px),
							linear-gradient(to bottom, rgb(var(--foreground)) 1px, transparent 1px)
						`,
						backgroundSize: "60px 60px",
					}}
				/>

				{/* Enhanced radial dot pattern overlay */}
				<div
					className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
					style={{
						backgroundImage: `radial-gradient(circle, rgb(var(--foreground)) 2px, transparent 2px)`,
						backgroundSize: "50px 50px",
						backgroundPosition: "0 0, 25px 25px",
					}}
				/>

				{/* Enhanced diagonal light streaks */}
				<div className="absolute inset-0 opacity-[0.08]">
					<div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent rotate-12 animate-shimmer" />
					<div className="absolute top-0 right-1/3 w-2 h-full bg-gradient-to-b from-transparent via-purple-500/50 to-transparent -rotate-12 animate-shimmer animation-delay-2000" />
					<div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-pink-500/40 to-transparent rotate-6 animate-shimmer animation-delay-4000" />
				</div>

				{/* Glowing accent spots */}
				<div className="absolute inset-0 opacity-30 dark:opacity-20">
					<div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/50 rounded-full filter blur-[40px] animate-pulse" />
					<div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-purple-500/50 rounded-full filter blur-[50px] animate-pulse animation-delay-2000" />
				</div>

				{/* Enhanced vignette layers */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_30%,hsl(var(--background)/0.7)_100%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08)_0%,transparent_50%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.08)_0%,transparent_50%)]" />
			</div>

			{/* Header */}
			<header className="border-b border-border/50 bg-background/30 backdrop-blur-xl sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Video className="w-8 h-8 text-primary" />
						<h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							{t("header.appName")}
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<ThemeToggle />
						<LanguageSwitcher />
						{isAuthenticated ? (
							<>
								<Link href="/projects">
									<Button variant="ghost">Projects</Button>
								</Link>
								<Link href="/edit">
									<Button>
										Open Editor
										<ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
							</>
						) : (
							<>
								<Link href="/auth/login">
									<Button variant="ghost">{t("header.signIn")}</Button>
								</Link>
								<Link href="/auth/register">
									<Button>
										{t("header.signUp")}
										<ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative container mx-auto px-4 py-20 md:py-32">
				{/* Hero glow effect */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
				</div>

				<div className="relative max-w-4xl mx-auto text-center space-y-8">
					<div className="inline-block animate-fade-in">
						<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/5">
							<Sparkles className="w-4 h-4 text-primary animate-pulse" />
							<span className="text-sm font-medium">{t("hero.badge")}</span>
						</div>
					</div>

					<h2 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up">
						<span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
							{t("hero.title")}
						</span>
						<br />
						<span className="inline-block mt-2">{t("hero.titleSuffix")}</span>
					</h2>

					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						{t("hero.description")}
					</p>

					<div className="flex items-center justify-center gap-4 flex-wrap">
						<Link href="/auth/register">
							<Button size="lg" className="text-lg px-8 transition-all">
								{t("hero.ctaStart")}
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</Link>
						<Link href="/auth/login">
							<Button
								size="lg"
								variant="outline"
								className="text-lg px-8 backdrop-blur-sm bg-background/50 border-border/50 hover:bg-background/80"
							>
								{t("hero.ctaDemo")}
							</Button>
						</Link>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
						<div className="p-6 rounded-2xl bg-background/30 backdrop-blur-sm border border-border/50 hover:bg-background/50 transition-all">
							<div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								10K+
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								{t("hero.stats.users")}
							</div>
						</div>
						<div className="p-6 rounded-2xl bg-background/30 backdrop-blur-sm border border-border/50 hover:bg-background/50 transition-all">
							<div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								50K+
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								{t("hero.stats.videos")}
							</div>
						</div>
						<div className="p-6 rounded-2xl bg-background/30 backdrop-blur-sm border border-border/50 hover:bg-background/50 transition-all">
							<div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								4.9/5
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								{t("hero.stats.rating")}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h3 className="text-3xl md:text-4xl font-bold mb-4">
							{t("features.title")}
						</h3>
						<p className="text-lg text-muted-foreground">
							{t("features.subtitle")}
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{/* Feature 1 */}
						<div className="group p-8 rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm hover:bg-background/50 hover:border-primary/30 transition-all duration-300">
							<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
								<Wand2 className="w-7 h-7 text-primary" />
							</div>
							<h4 className="text-xl font-semibold mb-3">
								{t("features.aiTools.title")}
							</h4>
							<p className="text-muted-foreground leading-relaxed">
								{t("features.aiTools.description")}
							</p>
						</div>

						{/* Feature 2 */}
						<div className="group p-8 rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm hover:bg-background/50 hover:border-primary/30 transition-all duration-300">
							<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
								<Video className="w-7 h-7 text-primary" />
							</div>
							<h4 className="text-xl font-semibold mb-3">
								{t("features.browserBased.title")}
							</h4>
							<p className="text-muted-foreground leading-relaxed">
								{t("features.browserBased.description")}
							</p>
						</div>

						{/* Feature 3 */}
						<div className="group p-8 rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm hover:bg-background/50 hover:border-primary/30 transition-all duration-300">
							<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
								<Zap className="w-7 h-7 text-primary" />
							</div>
							<h4 className="text-xl font-semibold mb-3">
								{t("features.fastRender.title")}
							</h4>
							<p className="text-muted-foreground leading-relaxed">
								{t("features.fastRender.description")}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="max-w-4xl mx-auto">
					<div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 p-12 md:p-16 text-center overflow-hidden backdrop-blur-sm">
						{/* Decorative elements */}
						<div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
						<div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />

						<h3 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
							{t("cta.title")}
						</h3>
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto relative z-10">
							{t("cta.description")}
						</p>
						<Link href="/auth/register">
							<Button
								size="lg"
								className="text-lg px-12 transition-all relative z-10"
							>
								{t("cta.button")}
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t py-8 mt-20">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<Video className="w-6 h-6 text-primary" />
							<span className="font-semibold">{t("header.appName")}</span>
						</div>
						<p className="text-sm text-muted-foreground">
							{t("footer.copyright")}
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
