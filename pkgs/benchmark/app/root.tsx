import { Outlet, Scripts } from "react-router";

export default function App() {
	return (
		<html lang="en">
			<head>
				<title>pow-captcha Benchmark</title>
			</head>
			<body>
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
