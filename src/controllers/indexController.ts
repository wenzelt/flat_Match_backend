import { Request, Response } from "express"

// Register a property owner.
export async function greetUser(req: Request, res: Response) {
	return res
		.status(200)
		.json({ message: { msgBody: '👋 Hello world! 👋', msgError: false } })
}
