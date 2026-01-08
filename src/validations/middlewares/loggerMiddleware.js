export default function loggerMiddleware(req, res, next) {
  try {
    const {
      body,
      headers,
      params,
      query,
      originalUrl,
      baseUrl,
      host,
      protocol,
    } = req;

    console.log(':::::::::::::::::::::Incoming Request:::::::::::::::::::::');
    console.log({
      body,
      headers,
      params,
      query,
      originalUrl,
      baseUrl,
      host,
      hostV2: req.get('host'),
      protocol,
      time: new Date().toLocaleTimeString(),
    });
    console.log(':::::::::::::::::::::Request Ends:::::::::::::::::::::');

    next();
  } catch (error) {
    next(error);
  }
}
