export const allowCrossDomain = (req: any, res: any, next: any) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
	res.header('Access-Control-Allow-Headers', '*')

	// intercept OPTIONS method
	if ('OPTIONS' === req.method) {
		res.sendStatus(200)
	}
	else {
		next()
	}
}