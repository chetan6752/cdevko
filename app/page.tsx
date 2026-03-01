import Image from 'next/image';
import Link from 'next/link';

import logo from 'public/icons/logo.svg';

import Footer from 'components/footer';
import Features from 'components/home/features';

import url from 'constants/url';
import { premiumPlan } from 'constants/usage';

export default function Home() {
	return (
		<div className="relative h-full bg-gradient-to-br from-sky-100 via-white to-sky-100 pl-2 pr-2 text-gray-800">
			<header className="relative m-auto h-[56px] max-w-4xl pt-3">
				<div className="absolute left-0 right-0 top-3 z-20 flex items-center justify-between">
					<Link href={'/'} className="flex max-w-[180px] items-center p-3 text-2xl">
						<Image src={logo} width={30} height={30} alt="FinTracker logo" className="mr-2" />
						<span className="font-black tracking-[-0.03em] text-gray-900">FinTracker</span>
					</Link>
					<Link
						href={url.app.signin}
						className="leading-2 mr-4 inline-flex h-[34px] items-center overflow-hidden rounded-full bg-gray-900 px-4 py-1 text-sm font-medium text-white transition hover:bg-primary/90"
					>
						Sign in
					</Link>
				</div>
			</header>
			<main>
				<div className="absolute inset-x-0 top-[-55px] z-10 h-96 overflow-hidden text-gray-900/40 opacity-10 [mask-image:linear-gradient(to_top,transparent,white)]">
					<svg className="absolute inset-0 top-0 h-full w-full text-gray-900" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<pattern
								id="pattern"
								width="32"
								height="32"
								patternUnits="userSpaceOnUse"
								x="50%"
								y="100%"
								patternTransform="translate(0 -1)"
							>
								<path d="M0 32V.5H32" fill="none" stroke="currentColor"></path>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#pattern)"></rect>
					</svg>
				</div>
				<div className="mx-auto mb-16 mt-16 max-w-md px-3 text-center sm:max-w-lg sm:px-0">
					<h1 className="mt-4	text-4xl font-black leading-[1.15] tracking-[-0.03em] text-black sm:text-5xl sm:leading-[1.15]">
						Effortlessly Track and Manage{' '}
						<span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
							Expenses.
						</span>
					</h1>
					<p className="mt-5 text-base font-normal leading-6 tracking-tight sm:text-lg">
						Our easy-to-use platform allows you to track and categorize your spending, giving you a clear picture of
						your financials.
					</p>
					<div className="mt-10 flex justify-center">
						<Link
							href={url.app.signup}
							className="inline-flex h-[34px] items-center justify-center rounded-full bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 hover:shadow"
						>
							Try it for Free
						</Link>

					</div>
				</div>
				<div className="mx-auto mb-16 mt-16 max-w-md px-3 text-center sm:max-w-lg sm:px-0">
					<h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-black sm:text-4xl">
						<span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
							Why to use
						</span>{' '}
						FinTracker?
					</h2>
					<ul className="mt-6 list-decimal px-4 text-left leading-6 [counter-reset:section] sm:px-2">
						<li className="before::h-2 mt-4 text-base tracking-tight sm:text-lg">
							<b className="font-sans font-bold text-black">Easy to use:</b> Track expenses on-the-go with
							categorization and logging.
						</li>
						<li className="before::h-2 mt-4 text-base tracking-tight sm:text-lg">
							<b className="font-sans font-bold text-black">Data-driven insights:</b> Expense tracker can provide
							valuable insights into your spending habits, allowing you to make more informed decisions.
						</li>
						<li className="before::h-2 mt-4 text-base tracking-tight sm:text-lg">
							<b className="font-sans font-bold text-black">Identify overspending:</b> Take control of your finances by
							identifying and reducing overspending with an expense tracker.
						</li>
						<li className="before::h-2 mt-4 text-base tracking-tight sm:text-lg">
							<b className="font-sans font-bold text-black">Real-time visibility:</b> Monitor your expenses in
							real-time, whether you are at home or on-the-go, with a user-friendly interface
						</li>
					</ul>
				</div>
				<div className="mx-auto mb-16 mt-16 max-w-2xl">
					<h2 className="mb-12 mt-8 text-center text-3xl font-extrabold tracking-[-0.03em] text-black sm:text-4xl">
						Simple yet,{' '}
						<span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
							Powerful
						</span>{' '}
						Features.
					</h2>
				<div className="mt-10 grid grid-cols-1 justify-center gap-10 p-5">
						<Features />
					</div>
				</div>
				<div className="mx-auto mb-16 mt-16 grid max-w-md justify-center px-3 text-center sm:px-0 md:max-w-[600px]">
					<h2 className="mt-0 text-3xl font-extrabold tracking-[-0.03em] text-black sm:text-4xl">
						Our{' '}
						<span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
							Pricing Plans
						</span>
					</h2>
					<p className="mt-3 text-base leading-7 tracking-tight sm:text-lg">
						Start for free, no credit card is required.
					</p>
					<div className="mt-8 flex w-full flex-col sm:flex-row">
						<div className="min-w-[330px] divide-y divide-gray-600 rounded-lg bg-zinc-900 text-left shadow-sm sm:mr-8">
							<div className="p-5 py-6">
								<h2 className="text-3xl font-extrabold leading-6 text-white">Basic</h2>
								<p className="mb-2 mt-2 text-gray-300">Free forever with limits.</p>
								<p className="mt-4">
									<span className="text-3xl font-extrabold text-white">$ 0</span>
									<span className="text-base  text-gray-100"> / month</span>
								</p>
								<div className="mb-0 ml-1 mt-4 flex flex-col justify-center text-left text-white ">
									<span className="m-1 ml-0 flex items-center  text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										Trend visualisation with charts
									</span>
									<span className="m-1 ml-0 flex items-center text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										<span>Add up to 100 entries per account</span>
									</span>
									<span className="m-1 ml-0 flex items-center text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										Track subscription billing dates
									</span>
									<span className="m-1 ml-0 flex items-center text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										Choose preferred currency display
									</span>
									<span className="m-1 ml-0 flex items-center text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										Email support available
									</span>
								</div>
								<a
									className="mt-10 block w-full rounded-md bg-white py-2 text-center text-sm font-semibold text-black hover:bg-gray-200"
									href="/signup"
								>
									Start for free
								</a>
							</div>
						</div>
						<div className="bg-pro-plan mt-8  min-w-[330px] divide-y divide-gray-600 rounded-lg bg-zinc-900 text-left shadow-sm sm:mt-0">
							<div className="p-5 py-6">
								<h2 className="text-3xl font-extrabold leading-6 text-white">Premium</h2>
								<p className="mb-2 mt-2 text-gray-300">Access to all premium features.</p>
								<p className="mt-4">
									<span className="inline-flex text-3xl font-extrabold text-white">$ 20</span>
									<span className="text-base text-gray-100"> / year</span>
								</p>
								<div className="mb-0 ml-1 mt-4 flex flex-col justify-center text-left text-white ">
									<span className="m-1 ml-0 flex items-center  text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										Everything in Basic plan
									</span>
									<span className="m-1 ml-0 flex items-center text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										<span>Add up to {premiumPlan.limit} entries per account</span>
									</span>
									<span className="m-1 ml-0 flex items-center text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										<span>Advanced trend visualisation</span>
									</span>
									<span className="m-1 ml-0 flex items-center text-[15px]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
											className="mr-1 h-5 w-5 text-green-600"
										>
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											></path>
										</svg>
										<span>Priority support with quick reply</span>
									</span>
								</div>
								<a
									className="mt-10 flex w-full justify-center rounded-md bg-white py-2 text-center text-sm font-semibold text-black hover:bg-gray-200"
									href="/signup"
								>
									Get started
								</a>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
