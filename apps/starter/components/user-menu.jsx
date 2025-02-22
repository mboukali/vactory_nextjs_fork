import { Fragment } from "react"
import classNames from "clsx"
import { Menu } from "@vactory/headlessui/menu"
import { Transition } from "@vactory/headlessui/transition"
import Image from "next/image"
import { useRouter } from "next/router"
import Link from "next/link"

const UserMenu = ({ data, signOut }) => {
	const router = useRouter()
	const { locale } = router

	const userNavigation = [
		{ name: "Settings", href: `/${locale}/user/profile` },
		{ name: "Sign out", href: "#.", onClick: signOut },
	]

	return (
		<Menu as="div" className="inline-block flex-shrink-0 relative ml-4">
			<div>
				<Menu.Button className="bg-gray-800 rounded-full flex text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
					<span className="sr-only">Open user menu</span>
					{data.user?.avatar ? (
						<Image
							alt="Me"
							src={data.user.avatar}
							width={32}
							height={32}
							className="h-8 w-8 rounded-full"
						/>
					) : (
						<svg
							className="h-8 w-8 text-gray-300"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					)}
				</Menu.Button>
			</div>
			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="z-10	origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 divide-y divide-gray-100 focus:outline-none">
					<div className="py-1">
						<Menu.Item>
							<span className="block px-4 py-2 text-sm text-gray-900 font-bold">
								{data.user.full_name}
							</span>
						</Menu.Item>
					</div>
					<div className="py-1">
						{userNavigation.map((item) => (
							<Menu.Item key={item.name}>
								{({ active }) => (
									<Link href={item?.href} passHref>
										<a
											onClick={item?.onClick}
											className={classNames(
												active ? "bg-gray-100 text-gray-900" : "text-gray-700",
												"block px-4 py-2 text-sm rounded-md"
											)}
										>
											{item.name}
										</a>
									</Link>
								)}
							</Menu.Item>
						))}
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	)
}

export default UserMenu
