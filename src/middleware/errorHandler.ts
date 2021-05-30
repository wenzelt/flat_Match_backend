import { Request, Response } from "express"

// error handling middleware
export const errorHandler = (fn: any) => (req: Request, res: Response) => {
	Promise.resolve(fn(req, res)).catch((err) => {
		// tslint:disable-next-line:no-console
		console.log(err)
		return res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } })
	})
}
