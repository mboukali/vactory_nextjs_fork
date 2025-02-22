import React, { useState, useEffect } from "react"
import { useI18n } from "@vactory/next/i18n"
import { useSession } from "next-auth/react"
import { useSignUp, useCreateUser } from "@vactory/next-user"
import { useForm } from "react-hook-form"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"

const ReCaptcha = dynamic(() => import("react-google-recaptcha"), {
	ssr: false,
})

const errorFields = {
	"/data/attributes/mail": "email",
	"/data/attributes/mail/value": "email",
	"/data/attributes/field_first_name": "field_first_name",
	"/data/attributes/field_last_name": "field_last_name",
}

const RegisterPage = ({ node }) => {
	const { t } = useI18n()
	const { data: session, status } = useSession()
	const userLoading = status === "loading"
	const { csrfToken } = node
	const signUp = useSignUp()
	const createUser = useCreateUser()
	const recaptchaRef = React.createRef()
	const {
		register,
		handleSubmit,
		setError,
		setValue,
		clearErrors,
		formState: { errors },
	} = useForm()

	const [loading, setLoading] = useState(false)
	const router = useRouter()

	useEffect(() => {
		// Prefetch the dashboard page
		router.prefetch("/user/login")
	}, [])

	// When rendering client side don't display anything until loading is complete
	if (typeof window !== "undefined" && userLoading) return null

	if (session) {
		return <h1>Already logged in</h1>
	}

	const onSubmit = async (input) => {
		const Toast = (await import("cogo-toast")).default
		setLoading(true)
		const { hide } = Toast.loading("Loading...", { hideAfter: 0 })
		try {
			const response = await createUser(input)
			const data = await response.json()
			setLoading(false)
			hide()
			if (response.ok) {
				await router.push({
					pathname: "/user/login",
					query: { isNew: true },
				})
			} else {
				const errors = data?.errors || []
				errors.forEach((item) => {
					const field = errorFields[item?.source?.pointer] || undefined
					if (field) {
						setError(field, {
							type: "manual",
							message: item.detail,
						})
					} else {
						console.warn(item)
					}
				})
			}
		} catch (err) {
			hide()
			Toast.error(t("Une erreur s'est produite"))
			console.error(err)
		}
	}

	return (
		<div className="relative px-4 sm:px-6 lg:px-8">
			<div className="text-lg max-w-prose mx-auto">
				<h1>
					<span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
						{node.title}
					</span>
				</h1>
			</div>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
			>
				<input
					name="_csrf"
					{...register("_csrf")}
					type="hidden"
					defaultValue={csrfToken}
				/>
				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
						E-mail
					</label>
					<input
						className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						id="email"
						name="email"
						type="text"
						placeholder="foo@bar.com"
						{...register("email", { required: "Email is required" })}
					/>
					{errors.email && (
						<p className="text-red text-xs italic">{errors.email.message}</p>
					)}
				</div>
				<div className="mb-6">
					<label
						className="block text-gray-700 text-sm font-bold mb-2"
						htmlFor="password"
					>
						Password
					</label>
					<input
						className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						id="password"
						type="password"
						name="password"
						placeholder="******************"
						{...register("password", { required: "Password is required" })}
					/>
					{errors.password && (
						<p className="text-red text-xs italic">{errors.password.message}</p>
					)}
				</div>
				<div className="mb-4">
					<label
						className="block text-gray-700 text-sm font-bold mb-2"
						htmlFor="first-name"
					>
						First Name
					</label>
					<input
						className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						id="first-name"
						name="first_name"
						type="text"
						{...register("first_name", { required: "First name is required" })}
					/>
					{errors.first_name && (
						<p className="text-red text-xs italic">{errors.first_name.message}</p>
					)}
				</div>
				<div className="mb-4">
					<label
						className="block text-gray-700 text-sm font-bold mb-2"
						htmlFor="last-name"
					>
						Last Name
					</label>
					<input
						className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						id="last-name"
						name="last_name"
						type="text"
						{...register("last_name", { required: "Last name is required" })}
					/>
					{errors.last_name && (
						<p className="text-red text-xs italic">{errors.last_name.message}</p>
					)}
				</div>
				<div className="relative my-4 flex flex-col items-end">
					<input
						type="hidden"
						name="recaptchaResponse"
						{...register("recaptchaResponse", { required: "Robot check required" })}
					/>
					<ReCaptcha
						sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY}
						hl={"fr"}
						ref={recaptchaRef}
						onChange={(val) => {
							setValue("recaptchaResponse", val)
							clearErrors("recaptchaResponse")
						}}
						onExpired={() => {
							setValue("recaptchaResponse", null)
							setError("recaptchaResponse", {
								type: "manual",
								message: "Recaptcha Expired!",
							})
						}}
						onErrored={() => {
							setError("recaptchaResponse", {
								type: "manual",
								message: "Recaptcha Error!",
							})
						}}
					/>
					{errors.recaptchaResponse && (
						<p className="mt-2 text-sm text-red-600">
							{errors.recaptchaResponse.message}
						</p>
					)}
				</div>
				<div className="flex items-center justify-between">
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						type="submit"
						disabled={loading}
					>
						{t("webform:Submit")}
					</button>
					<a
						className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
						href="#"
					>
						Forgot Password?
					</a>
					<a
						className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
						onClick={signUp}
						href="#"
					>
						Register
					</a>
				</div>
			</form>
		</div>
	)
}

export default RegisterPage
