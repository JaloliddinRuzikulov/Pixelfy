import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TestWidthPage() {
	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<div className="max-w-2xl mx-auto space-y-8">
				<h1 className="text-3xl font-bold text-center">
					Kenglik Test Sahifasi
				</h1>

				{/* Test 1: Minimal card with explicit width */}
				<div className="bg-white p-8 rounded-lg shadow-lg">
					<h2 className="text-xl font-semibold mb-4">Test 1: Oddiy Karta</h2>
					<div className="space-y-4">
						<div>
							<Label>Email</Label>
							<Input placeholder="test@misol.com" />
						</div>
						<div>
							<Label>Parol</Label>
							<Input type="password" placeholder="Parol" />
						</div>
						<Button className="w-full">Kirish</Button>
					</div>
				</div>

				{/* Test 2: Card with different max-width classes */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">
						Test 2: Different Max Width Classes
					</h2>

					<div className="w-full max-w-sm mx-auto bg-blue-100 p-4 rounded">
						<p>max-w-sm (384px) - Should be narrow</p>
					</div>

					<div className="w-full max-w-md mx-auto bg-green-100 p-4 rounded">
						<p>max-w-md (448px) - Should be medium</p>
					</div>

					<div className="w-full max-w-lg mx-auto bg-yellow-100 p-4 rounded">
						<p>max-w-lg (512px) - Should be wide</p>
					</div>

					<div className="w-full max-w-xl mx-auto bg-purple-100 p-4 rounded">
						<p>max-w-xl (576px) - Should be widest</p>
					</div>

					<div className="w-full max-w-2xl mx-auto bg-red-100 p-4 rounded">
						<p>max-w-2xl (672px) - Should be very wide</p>
					</div>
				</div>

				{/* Test 3: Responsive breakpoints */}
				<div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-orange-100 p-4 rounded">
					<h3 className="font-semibold">Test 3: Responsive Width</h3>
					<p className="text-sm">
						Responsive: sm=384px, md=448px, lg=512px, xl=576px
					</p>
				</div>

				{/* Test 4: Custom CSS override */}
				<div
					className="mx-auto bg-pink-100 p-4 rounded"
					style={{ width: "100%", maxWidth: "600px" }}
				>
					<h3 className="font-semibold">Test 4: Inline Style Override</h3>
					<p className="text-sm">Max-width set to 600px via inline style</p>
				</div>
			</div>
		</div>
	);
}
